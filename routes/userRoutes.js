const express = require("express");
const router = express.Router();
const db = require("../db");
const authenticateUser = require("../middleware/authMiddleware"); // adjust path if needed

// ✅ Get user full profile (posts, followers, following, etc.)
router.get("/:id/profile", async (req, res) => {
  const userId = req.params.id;

  try {
    // 1. Basic user info
    const userResult = await db.query(
      `SELECT id, username, email, profile_pic, 
              TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at 
       FROM users 
       WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = userResult.rows[0];

    // 2. Post count
    const postCountResult = await db.query(
      `SELECT COUNT(*) AS count FROM posts WHERE user_id = $1`,
      [userId]
    );
    const postCount = parseInt(postCountResult.rows[0].count);

    // 3. Followers count
    const followersResult = await db.query(
      `SELECT COUNT(*) AS count FROM follows WHERE following_id = $1`,
      [userId]
    );
    const followersCount = parseInt(followersResult.rows[0].count);

    // 4. Following count
    const followingResult = await db.query(
      `SELECT COUNT(*) AS count FROM follows WHERE follower_id = $1`,
      [userId]
    );
    const followingCount = parseInt(followingResult.rows[0].count);

    // 5. User's posts
    const postsResult = await db.query(
      `SELECT id, content, media_url, 
              TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at 
       FROM posts 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json({
      user,
      stats: {
        postCount,
        followersCount,
        followingCount
      },
      posts: postsResult.rows
    });

  } catch (error) {
    console.error("❌ Database Error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Search for users
router.get("/search", authenticateUser, async (req, res) => {
  const query = req.query.q;

  try {
    const result = await db.query(
      `SELECT id, username, profile_pic FROM users WHERE username ILIKE $1 LIMIT 10`,
      [`%${query}%`]
    );
    res.json({ users: result.rows });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});



module.exports = router;
