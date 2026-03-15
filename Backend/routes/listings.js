// SPI 1 — GET    /listings        ดึงสินค้าทั้งหมด + กรอง
// SPI 2 — GET    /listings/:id    รายละเอียดสินค้า
// SPI 3 — POST   /listings        ลงประกาศใหม่
// SPI 4 — DELETE /listings/:id    ปิดประกาศ

module.exports = (app, getConn) => {

    const validateListing = (data) => {
        let errors = [];
        if (!data.title)     errors.push('กรุณากรอกชื่อสินค้า');
        if (!data.price)     errors.push('กรุณากรอกราคา');
        if (!data.category)  errors.push('กรุณาเลือกประเภทสินค้า');
        if (!data.condition) errors.push('กรุณาเลือกสภาพสินค้า');
        return errors;
    };

    // SPI 1 — GET /listings
    // query: ?category=  ?condition=  ?search=
    app.get('/listings', async (req, res) => {
        try {
            const conn = getConn();
            const { category, condition, search } = req.query;

            let sql    = 'SELECT l.*, u.name AS seller_name FROM listings l JOIN users u ON l.user_id = u.id WHERE l.status = ?';
            let params = ['active'];

            if (category)  { sql += ' AND l.category = ?';  params.push(category); }
            if (condition) { sql += ' AND l.condition = ?';  params.push(condition); }
            if (search)    { sql += ' AND l.title LIKE ?';   params.push(`%${search}%`); }

            sql += ' ORDER BY l.id DESC';

            const results = await conn.query(sql, params);
            res.json(results[0]);
        } catch (error) {
            console.error('Error fetching listings:', error.message);
            res.status(500).json({ message: 'Error fetching listings', error: error.message });
        }
    });

    // GET /listings/user/:userId — ประกาศของผู้ใช้คนนี้
    app.get('/listings/user/:userId', async (req, res) => {
        try {
            const conn    = getConn();
            let userId    = req.params.userId;
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

    // SPI 2 — GET /listings/:id
    app.get('/listings/:id', async (req, res) => {
        try {
            const conn    = getConn();
            let id        = req.params.id;
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
            let statusCode = error.statusCode || 500;
            res.status(statusCode).json({ message: 'Error fetching listing', error: error.message });
        }
    });

    // SPI 3 — POST /listings
    // body: { user_id, title, description, price, category, condition }
    app.post('/listings', async (req, res) => {
        try {
            const conn  = getConn();
            let listing = req.body;

            const errors = validateListing(listing);
            if (errors.length > 0) {
                throw { message: 'กรุณากรอกข้อมูลให้ครบถ้วน', errors: errors };
            }

            listing.status = 'active';

            const results = await conn.query('INSERT INTO listings SET ?', listing);
            res.json({ message: 'ลงประกาศสำเร็จ', data: results[0] });
        } catch (error) {
            console.error('Error creating listing:', error.message);
            res.status(500).json({ message: 'Error creating listing', error: error.message });
        }
    });

    // SPI 4 — DELETE /listings/:id
    app.delete('/listings/:id', async (req, res) => {
        try {
            const conn    = getConn();
            let id        = req.params.id;
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
            let statusCode = error.statusCode || 500;
            res.status(statusCode).json({ message: 'Error closing listing', error: error.message });
        }
    });

};