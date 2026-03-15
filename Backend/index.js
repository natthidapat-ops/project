const express    = require('express');
const bodyParser = require('body-parser');
const mysql      = require('mysql2/promise');
const cors       = require('cors');

const app  = express();
const port = 8000;          // Express รันที่ 8000 → Postman/Frontend ใช้ port นี้

app.use(bodyParser.json());
app.use(cors());

let conn = null;

const initMYSQL = async () => {
    conn = await mysql.createConnection({
        host:     'localhost',
        user:     'root',
        password: 'root',
        database: 'webdb',
        port:     9000      // MySQL Docker "9000:3306" ตาม docker-compose
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