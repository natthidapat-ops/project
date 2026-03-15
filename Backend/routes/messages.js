// SPI 5 — POST /messages

module.exports = (app, getConn) => {

    // SPI 5 — POST /messages
    // body: { listing_id, sender_id, content }
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

    // GET /messages/:listingId — ดูข้อความของประกาศนั้น
    app.get('/messages/:listingId', async (req, res) => {
        try {
            const conn    = getConn();
            let listingId = req.params.listingId;
            const results = await conn.query(
                'SELECT m.*, u.name AS sender_name FROM messages m JOIN users u ON m.sender_id = u.id WHERE m.listing_id = ? ORDER BY m.id ASC',
                [listingId]
            );
            res.json(results[0]);
        } catch (error) {
            console.error('Error fetching messages:', error.message);
            res.status(500).json({ message: 'Error fetching messages', error: error.message });
        }
    });

};