// GET  /comments/:listingId  — ดึงคอมเม้นท์ของประกาศ
// POST /comments             — โพสต์คอมเม้นท์ใหม่

module.exports = (app, getConn) => {

    //14. GET /comments/:listingId
    app.get('/comments/:listingId', async (req, res) => {
        try {
            const conn      = getConn();
            const listingId = req.params.listingId;
            const results   = await conn.query(
                'SELECT c.*, u.name AS author_name FROM comments c JOIN users u ON c.user_id = u.id WHERE c.listing_id = ? ORDER BY c.id ASC',
                [listingId]
            );
            res.json(results[0]);
        } catch (error) {
            console.error('Error fetching comments:', error.message);
            res.status(500).json({ message: 'Error fetching comments', error: error.message });
        }
    });

    //15. POST /comments
    // body: { listing_id, user_id, content }
    app.post('/comments', async (req, res) => {
        try {
            const conn    = getConn();
            const comment = req.body;

            if (!comment.content || !comment.content.trim()) {
                return res.status(400).json({ message: 'กรุณากรอกคอมเม้นท์' });
            }
            if (!comment.user_id) {
                return res.status(401).json({ message: 'กรุณาเข้าสู่ระบบก่อนคอมเม้นท์' });
            }

            const results = await conn.query('INSERT INTO comments SET ?', {
                listing_id: comment.listing_id,
                user_id:    comment.user_id,
                content:    comment.content.trim()
            });
            res.json({ message: 'คอมเม้นท์สำเร็จ', data: results[0] });
        } catch (error) {
            console.error('Error posting comment:', error.message);
            res.status(500).json({ message: 'Error posting comment', error: error.message });
        }
    });

};

