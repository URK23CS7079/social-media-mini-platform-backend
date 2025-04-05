const express = require("express");
const router = express.Router();
const authenticateUser = require("../middleware/authMiddleware");
const db = require("../db");

// Toggle Like/Unlike
router.post("/:postId", authenticateUser, async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.userId;

        // Check if user already liked this post
        const existingLike = await db.query(
            `SELECT id FROM likes WHERE user_id = $1 AND post_id = $2`,
            [userId, postId]
        );

        if (existingLike.rows.length > 0) {
            // Unlike if already liked
            await db.query(
                `DELETE FROM likes WHERE user_id = $1 AND post_id = $2`,
                [userId, postId]
            );
            return res.json({ liked: false });
        }

        // Like if not already liked
        await db.query(
            `INSERT INTO likes (user_id, post_id) VALUES ($1, $2)`,
            [userId, postId]
        );

        res.json({ liked: true });
    } catch (error) {
        console.error("Like error:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Get likes for a post (including whether current user liked it)
router.get("/:postId", authenticateUser, async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user?.userId;

        // Get all likes
        const likesResult = await db.query(
            `SELECT 
                l.id,
                u.id as user_id,
                u.username
             FROM likes l
             JOIN users u ON l.user_id = u.id
             WHERE l.post_id = $1`,
            [postId]
        );

        // Check if current user liked the post
        const userLikeCheck = await db.query(
            `SELECT 1 FROM likes WHERE user_id = $1 AND post_id = $2`,
            [userId, postId]
        );

        res.json({
            likes: likesResult.rows,
            currentUserLiked: userLikeCheck.rows.length > 0
        });
    } catch (error) {
        console.error("Get likes error:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;