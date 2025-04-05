const express = require("express");
const router = express.Router();
const authenticateUser = require("../middleware/authMiddleware");
const db = require("../db");

// 🔹 Add a comment to a post
router.post("/create", authenticateUser, async (req, res) => {
    try {
        const { postId, commentText } = req.body;
        const userId = req.user.userId;

        if (!postId || !commentText) {
            return res.status(400).json({ error: "Post ID and comment text are required" });
        }

        await db.query(
            `INSERT INTO comments (user_id, post_id, content, created_at) 
             VALUES ($1, $2, $3, NOW())`,
            [userId, postId, commentText]
        );

        res.json({ message: "Comment added successfully!" });
    } catch (error) {
        console.error("❌ Comment Creation Error:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 🔹 Get all comments for a post
router.get("/:postId", async (req, res) => {
    try {
        const { postId } = req.params;

        const result = await db.query(
            `SELECT c.id, c.content, 
                    TO_CHAR(c.created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at, 
                    u.username
             FROM comments c 
             JOIN users u ON c.user_id = u.id
             WHERE c.post_id = $1
             ORDER BY c.created_at DESC`,
            [postId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error("❌ Fetch Comments Error:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 🔹 Delete a comment (Only the owner of the comment can delete it)
router.delete("/:commentId", authenticateUser, async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user.userId;

        const result = await db.query(
            `DELETE FROM comments WHERE id = $1 AND user_id = $2 RETURNING *`,
            [commentId, userId]
        );

        if (result.rowCount === 0) {
            return res.status(403).json({ error: "You are not authorized to delete this comment" });
        }

        res.json({ message: "Comment deleted successfully!" });
    } catch (error) {
        console.error("❌ Comment Deletion Error:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
