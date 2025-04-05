const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db"); // updated db.js using pg Pool
const router = express.Router();

const SECRET_KEY = process.env.JWT_SECRET || "your_jwt_secret";

// 🔹 User Signup (Register)
router.post("/register", async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        await db.query(
            `INSERT INTO users (username, email, password) VALUES ($1, $2, $3)`,
            [username, email, hashedPassword]
        );

        res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
        console.error("❌ Registration Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 🔹 User Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await db.query(
            `SELECT id, username, password FROM users WHERE email = $1`,
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const token = jwt.sign({ userId: user.id, username: user.username }, SECRET_KEY, {
            expiresIn: "24h",
        });

        res.json({ message: "Login successful", token });
    } catch (error) {
        console.error("❌ Login Error:", error);
        res.status(500).json({ error: "Error logging in" });
    }
});

module.exports = router;
