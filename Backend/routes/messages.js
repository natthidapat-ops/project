module.exports = (app, getConn) => {

    //9. POST /messages
    app.post('/messages', async (req, res) => {
        try {
            const conn  = getConn();
            let message = req.body;
            if (!message.content) {
                throw { message: 'กรุณากรอกข้อความ' };
            }
            const results = await conn.query('INSERT INTO messages SET ?', message);
            res.json({ message: 'ส่งข้อความสำเร็จ', data: results[0] });
        } catch (error) {
            console.error('Error sending message:', error.message);
            res.status(500).json({ message: 'Error sending message', error: error.message });
        }
    });

    //10. GET /messages/inbox/:userId
    app.get('/messages/inbox/:userId', async (req, res) => {
        try {
            const conn    = getConn();
            const userId  = req.params.userId;
            const results = await conn.query(
                `SELECT m.*, u.name AS sender_name, l.title AS listing_title
                 FROM messages m
                 JOIN users u ON m.sender_id = u.id
                 JOIN listings l ON m.listing_id = l.id
                 WHERE l.user_id = ?
                 ORDER BY m.id DESC`,
                [userId]
            );
            res.json(results[0]);
        } catch (error) {
            console.error('Error fetching inbox:', error.message);
            res.status(500).json({ message: 'Error fetching inbox', error: error.message });
        }
    });

    //11. GET /messages/sent/:userId
    app.get('/messages/sent/:userId', async (req, res) => {
        try {
            const conn    = getConn();
            const userId  = req.params.userId;
            const results = await conn.query(
                `SELECT m.*, u.name AS owner_name, l.title AS listing_title
                 FROM messages m
                 JOIN listings l ON m.listing_id = l.id
                 JOIN users u ON l.user_id = u.id
                 WHERE m.sender_id = ?
                 ORDER BY m.id DESC`,
                [userId]
            );
            res.json(results[0]);
        } catch (error) {
            console.error('Error fetching sent:', error.message);
            res.status(500).json({ message: 'Error fetching sent', error: error.message });
        }
    });

    //12. PATCH /messages/:id/reply
    app.patch('/messages/:id/reply', async (req, res) => {
        try {
            const conn  = getConn();
            const id    = req.params.id;
            const reply = req.body.reply;
            if (!reply || !reply.trim()) {
                return res.status(400).json({ message: 'กรุณากรอกข้อความตอบกลับ' });
            }
            const results = await conn.query(
                'UPDATE messages SET reply = ?, reply_at = NOW() WHERE id = ?',
                [reply.trim(), id]
            );
            if (results[0].affectedRows === 0) {
                throw { statusCode: 404, message: 'ไม่พบข้อความ' };
            }
            res.json({ message: 'ตอบกลับสำเร็จ' });
        } catch (error) {
            console.error('Error replying:', error.message);
            const statusCode = error.statusCode || 500;
            res.status(statusCode).json({ message: error.message });
        }
    });

    //13. GET /messages/:listingId
    app.get('/messages/:listingId', async (req, res) => {
        try {
            const conn    = getConn();
            const results = await conn.query(
                'SELECT m.*, u.name AS sender_name FROM messages m JOIN users u ON m.sender_id = u.id WHERE m.listing_id = ? ORDER BY m.id ASC',
                [req.params.listingId]
            );
            res.json(results[0]);
        } catch (error) {
            console.error('Error fetching messages:', error.message);
            res.status(500).json({ message: 'Error fetching messages', error: error.message });
        }
    });

};
