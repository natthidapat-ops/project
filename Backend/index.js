const express    = require('express');
const bodyParser = require('body-parser');
const mysql      = require('mysql2/promise');
const cors       = require('cors');
const path       = require('path');

const app  = express();
const port = 8000;

// 1. Middleware Settings

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// เปิดให้เข้าถึงรูปได้จาก http://localhost:8000/uploads/ชื่อไฟล์
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 2. Database Connection

let conn = null;

const initMYSQL = async () => {
    try {
        conn = await mysql.createConnection({
            host:     'localhost',
            user:     'root',
            password: 'root',
            database: 'webdb',
            port:     9000
        });
        console.log('Connected to MYSQL database');
    } catch (error) {
        console.error('Database connection failed:', error.message);
    }
};

// 3. Routes Reference
// ส่ง app และ function ที่คืนค่า conn ไปยังไฟล์ routes ต่างๆ
require('./routes/users')(app,    () => conn);
require('./routes/listings')(app, () => conn);
require('./routes/messages')(app, () => conn);
require('./routes/comments')(app, () => conn);

// 4. Start Server
app.listen(port, async () => {
    await initMYSQL();
    console.log(`Server is running on http://localhost:${port}`);
});