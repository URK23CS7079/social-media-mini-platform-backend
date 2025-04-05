const express = require("express");
const router = express.Router();
const db = require("../db");
const authenticateUser = require("../middleware/authMiddleware");

// Check if a user is following another user
router.get("/check", authenticateUser, async (req, res) => {
    const { followerId, followingId } = req.query;

    if (!followerId || !followingId) {
        return res.status(400).json({ error: "Both followerId and followingId are required" });
    }

    try {
        const result = await db.query(
            `SELECT EXISTS(
                SELECT 1 FROM follows 
                WHERE follower_id = $1 AND following_id = $2
            ) AS "isFollowing"`,
            [followerId, followingId]
        );
        res.json({ isFollowing: result.rows[0].isFollowing });
    } catch (err) {
        console.error("Follow check error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Follow a user
router.post("/follow", authenticateUser, async (req, res) => {
    const { followerId, followingId } = req.body;

    if (!followerId || !followingId) {
        return res.status(400).json({ error: "Both followerId and followingId are required" });
    }

    if (followerId === followingId) {
        return res.status(400).json({ error: "Cannot follow yourself" });
    }

    try {
        // Check if user exists
        const userCheck = await db.query(
            `SELECT 1 FROM users WHERE id = $1`,
            [followingId]
        );
        if (userCheck.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        // Check if already following
        const followCheck = await db.query(
            `SELECT 1 FROM follows WHERE follower_id = $1 AND following_id = $2`,
            [followerId, followingId]
        );

        if (followCheck.rows.length > 0) {
            return res.status(400).json({ error: "Already following this user" });
        }

        // Create follow relationship
        await db.query(
            `INSERT INTO follows (follower_id, following_id) VALUES ($1, $2)`,
            [followerId, followingId]
        );

        // Update follower count cache if you have one
        // (This would be in addition to your actual count queries)

        res.json({ success: true, message: "Successfully followed user" });
    } catch (err) {
        console.error("Follow error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Unfollow a user
router.post("/unfollow", authenticateUser, async (req, res) => {
    const { followerId, followingId } = req.body;

    if (!followerId || !followingId) {
        return res.status(400).json({ error: "Both followerId and followingId are required" });
    }

    try {
        const result = await db.query(
            `DELETE FROM follows 
             WHERE follower_id = $1 AND following_id = $2 
             RETURNING *`,
            [followerId, followingId]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ error: "Not following this user" });
        }

        // Update follower count cache if you have one
        // (This would be in addition to your actual count queries)

        res.json({ success: true, message: "Successfully unfollowed user" });
    } catch (err) {
        console.error("Unfollow error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Get followers list
router.get("/followers/:userId", authenticateUser, async (req, res) => {
    const { userId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    try {
        const result = await db.query(
            `SELECT u.id, u.username, u.profile_pic
             FROM follows f
             JOIN users u ON f.follower_id = u.id
             WHERE f.following_id = $1
             ORDER BY f.created_at DESC
             LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );

        res.json({ followers: result.rows });
    } catch (err) {
        console.error("Get followers error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Get following list
router.get("/following/:userId", authenticateUser, async (req, res) => {
    const { userId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    try {
        const result = await db.query(
            `SELECT u.id, u.username, u.profile_pic
             FROM follows f
             JOIN users u ON f.following_id = u.id
             WHERE f.follower_id = $1
             ORDER BY f.created_at DESC
             LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );

        res.json({ following: result.rows });
    } catch (err) {
        console.error("Get following error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;