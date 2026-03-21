//  POST /users/login

module.exports = (app, getConn) => {

    // 1. POST /users — สมัครสมาชิก
    // body: { name, email, password, description }
    app.post('/users', async (req, res) => {
        try {
            const conn = getConn();
            let user   = req.body;

            let errors = [];
            if (!user.name)     errors.push('กรุณากรอกชื่อ');
            if (!user.email)    errors.push('กรุณากรอกอีเมล');
            if (!user.password) errors.push('กรุณากรอกรหัสผ่าน');
            if (errors.length > 0) {
                throw { message: 'กรุณากรอกข้อมูลให้ครบถ้วน', errors: errors };
            }

            const results = await conn.query('INSERT INTO users SET ?', user);
            res.json({ message: 'สมัครสมาชิกสำเร็จ', data: results[0] });
        } catch (error) {
            console.error('Error creating user:', error.message);
            res.status(500).json({ message: 'Error creating user', error: error.message });
        }
    });

    // 2. POST /users/login — เข้าสู่ระบบ
    // body: { email, password }
    app.post('/users/login', async (req, res) => {
        try {
            const conn = getConn();
            const { email, password } = req.body;

            const results = await conn.query(
                'SELECT id, name, email, description FROM users WHERE email = ? AND password = ?',
                [email, password]
            );
            if (results[0].length === 0) {
                throw { statusCode: 401, message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' };
            }
            res.json({ message: 'เข้าสู่ระบบสำเร็จ', data: results[0][0] });
        } catch (error) {
            console.error('Error login:', error.message);
            let statusCode = error.statusCode || 500;
            res.status(statusCode).json({ message: error.message });
        }
    });

};