const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

//3. GET    /listings        ดึงสินค้าทั้งหมด + กรอง
//4. GET /listings/user/:userId ดึงข้อมูลสินค้าเฉพาะของ User คนนั้นๆ เพื่อนำไปแสดงในหน้า "สินค้าของฉัน"
//5. GET    /listings/:id    รายละเอียดสินค้า
//6. POST   /listings        ลงประกาศใหม่
//7. PATCH /listings/:id/sold — mark ว่าขายแล้ว
//8. DELETE /listings/:id    ปิดประกาศ


module.exports = (app, getConn) => {
    
    // 1. ตั้งค่า Multer สำหรับอัปโหลดรูปภาพ
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, uploadDir);
        },
        filename: function (req, file, cb) {
            const extension    = path.extname(file.originalname);
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, file.fieldname + '-' + uniqueSuffix + extension);
        }
    });

    const upload = multer({ storage: storage });

    // 2. ฟังก์ชันตรวจสอบข้อมูล
    const validateListing = (data) => {
        let errors = [];
        if (!data.title)     errors.push('กรุณากรอกชื่อสินค้า');
        if (!data.price)     errors.push('กรุณากรอกราคา');
        if (!data.category)  errors.push('กรุณาเลือกประเภทสินค้า');
        if (!data.condition) errors.push('กรุณาเลือกสภาพสินค้า');
        return errors;
    };

    //3. GET /listings
    app.get('/listings', async (req, res) => {
        try {
            const conn = getConn();
            const { category, condition, search } = req.query;

            let sql    = 'SELECT l.*, u.name AS seller_name FROM listings l JOIN users u ON l.user_id = u.id WHERE l.status = ?';
            let params = ['active'];

            if (category)  { sql += ' AND l.category = ?';  params.push(category); }
            if (condition) { sql += ' AND l.condition = ?'; params.push(condition); }
            if (search)    { sql += ' AND l.title LIKE ?';  params.push(`%${search}%`); }

            sql += ' ORDER BY l.id DESC';

            const results = await conn.query(sql, params);
            res.json(results[0]);
        } catch (error) {
            console.error('Error fetching listings:', error.message);
            res.status(500).json({ message: 'Error fetching listings', error: error.message });
        }
    });

    //4. GET /listings/user/:userId
    app.get('/listings/user/:userId', async (req, res) => {
        try {
            const conn    = getConn();
            const userId  = req.params.userId;
            const results = await conn.query(
                'SELECT * FROM listings WHERE user_id = ? ORDER BY id DESC',
                [userId]
            );
            res.json(results[0]);
        } catch (error) {
            console.error('Error fetching user listings:', error.message);
            res.status(500).json({ message: 'Error fetching user listings', error: error.message });
        }
    });

    //5. — GET /listings/:id
    app.get('/listings/:id', async (req, res) => {
        try {
            const conn    = getConn();
            const id      = req.params.id;
            const results = await conn.query(
                'SELECT l.*, u.name AS seller_name, u.email AS seller_email FROM listings l JOIN users u ON l.user_id = u.id WHERE l.id = ?',
                [id]
            );

            if (results[0].length === 0) {
                throw { statusCode: 404, message: 'ไม่พบสินค้า' };
            }
            res.json(results[0][0]);
        } catch (error) {
            console.error('Error fetching listing:', error.message);
            const statusCode = error.statusCode || 500;
            res.status(statusCode).json({ message: 'Error fetching listing', error: error.message });
        }
    });

    //6. POST /listings
    app.post('/listings', upload.single('image'), async (req, res) => {
        try {
            const conn  = getConn();
            let listing = req.body;

            const errors = validateListing(listing);
            if (errors.length > 0) {
                return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน', errors: errors });
            }

            listing.status = 'active';

            if (req.file) {
                listing.image_url = req.file.filename;
            }

            const results = await conn.query('INSERT INTO listings SET ?', listing);
            res.json({ message: 'ลงประกาศสำเร็จ', data: results[0] });
        } catch (error) {
            console.error('Error creating listing:', error.message);
            res.status(500).json({ message: 'Error creating listing', error: error.message });
        }
    });

    //7. PATCH /listings/:id/sold — mark ว่าขายแล้ว
    app.patch('/listings/:id/sold', async (req, res) => {
        try {
            const conn    = getConn();
            const id      = req.params.id;
            const results = await conn.query(
                "UPDATE listings SET status = 'sold' WHERE id = ?",
                [id]
            );
            if (results[0].affectedRows === 0) {
                throw { statusCode: 404, message: 'ไม่พบประกาศ' };
            }
            res.json({ message: 'ขายแล้ว! 🎉' });
        } catch (error) {
            console.error('Error marking sold:', error.message);
            const statusCode = error.statusCode || 500;
            res.status(statusCode).json({ message: error.message });
        }
    });

    //8. DELETE /listings/:id
    app.delete('/listings/:id', async (req, res) => {
        try {
            const conn    = getConn();
            const id      = req.params.id;
            const results = await conn.query(
                "UPDATE listings SET status = 'closed' WHERE id = ?",
                [id]
            );

            if (results[0].affectedRows === 0) {
                throw { statusCode: 404, message: 'ไม่พบประกาศ' };
            }
            res.json({ message: 'ปิดประกาศสำเร็จ' });
        } catch (error) {
            console.error('Error closing listing:', error.message);
            const statusCode = error.statusCode || 500;
            res.status(statusCode).json({ message: 'Error closing listing', error: error.message });
        }
    });

};