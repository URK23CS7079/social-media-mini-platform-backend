const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.error("❌ No token provided.");
        return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Add user data to request
        console.log("✅ Token Verified:", decoded); // ✅ Debugging log
        next();
    } catch (error) {
        console.error("❌ Invalid Token:", error.message);
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }
};
