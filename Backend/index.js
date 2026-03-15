const express    = require('express');
const bodyParser = require('body-parser');
const mysql      = require('mysql2/promise');
const cors       = require('cors');
const path       = require('path');

const app  = express();
const port = 8000;

app.use(bodyParser.json());
app.use(cors());

// ── เปิดให้เข้าถึงรูปได้จาก http://localhost:8000/uploads/ชื่อไฟล์
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

let conn = null;

const initMYSQL = async () => {
    conn = await mysql.createConnection({
        host:     'localhost',
        user:     'root',
        password: 'root',
        database: 'webdb',
        port:     9000
    });
    console.log('Connected to MYSQL database');
};

require('./routes/users')(app,     () => conn);
require('./routes/listings')(app,  () => conn);
require('./routes/messages')(app,  () => conn);

app.listen(port, async () => {
    await initMYSQL();
    console.log(`Server is running on http://localhost:${port}`);
});