const express    = require('express');
const bodyParser = require('body-parser');
const mysql      = require('mysql2/promise');
const cors       = require('cors');
const path       = require('path');

const app  = express();
const port = 8000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

let conn = null;

const initMYSQL = async () => {
    try {
        conn = await mysql.createConnection({
            host:     'localhost',
            user:     'root',
            password: 'root',
            database: 'webdb',
            port:     9000,
            timezone: '+07:00'
        });
        console.log('Connected to MYSQL database');
    } catch (error) {
        console.error('Database connection failed:', error.message);
    }
};

require('./routes/users')(app,    () => conn);
require('./routes/listings')(app, () => conn);
require('./routes/messages')(app, () => conn);
require('./routes/comments')(app, () => conn);

app.listen(port, async () => {
    await initMYSQL();
    console.log(`Server is running on http://localhost:${port}`);
});
