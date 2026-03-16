-- เพิ่มตาราง comments
CREATE TABLE IF NOT EXISTS comments (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    listing_id INT          NOT NULL,
    user_id    INT          NOT NULL,
    content    TEXT         NOT NULL,
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE
);

-- เพิ่มค่า status 'sold' ให้ listings ถ้าใช้ ENUM
-- ALTER TABLE listings MODIFY COLUMN status ENUM('active','closed','sold') DEFAULT 'active';
