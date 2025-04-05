const express = require("express");
const router = express.Router();
const authenticateUser = require("../middleware/authMiddleware");
const db = require("../db");
const upload = require("../middleware/upload"); // Cloudinary multer middleware

// ✅ Create a Post with Image Upload
router.post("/create", upload.single("image"), async (req, res) => {
    try {
        const { userId, content } = req.body;
        const imageUrl = req.file ? req.file.path : null;

        if (!userId || !content) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        await db.query(
            `INSERT INTO posts (user_id, content, media_url, created_at) 
             VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`,
            [userId, content, imageUrl]
        );

        res.json({ message: "Post created successfully!", mediaUrl: imageUrl });
    } catch (error) {
        console.error("❌ Post Creation Error:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ✅ Fetch All Posts (With Image URL, Likes & Comments Count)
router.get("/", authenticateUser, async (req, res) => {
    try {
        const result = await db.query(
            `SELECT posts.id, posts.content, posts.media_url, users.username, 
                    TO_CHAR(posts.created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at,
                    (SELECT COUNT(*) FROM likes WHERE likes.post_id = posts.id) AS like_count,
                    (SELECT COUNT(*) FROM comments WHERE comments.post_id = posts.id) AS comments_count
             FROM posts
             JOIN users ON posts.user_id = users.id
             ORDER BY posts.created_at DESC`
        );

        const posts = result.rows.map(row => ({
            id: row.id,
            content: row.content,
            media_url: row.media_url,
            username: row.username,
            created_at: row.created_at,
            like_count: row.like_count,
            comments_count: row.comments_count
        }));

        res.status(200).json(posts);
    } catch (error) {
        console.error("❌ Fetch Posts Error:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
