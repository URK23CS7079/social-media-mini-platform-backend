require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require("./db"); // PostgreSQL Pool (no .init needed)

const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");
const likeRoutes = require("./routes/likeRoutes");
const followRoutes = require("./routes/followRoutes");
const userRouters = require('./routes/userRoutes');

const app = express();

// ✅ CORS Configuration (Allow Frontend)
app.use(
  cors({
    origin: "http://localhost:3000", // Change this to your frontend URL or Render client URL
    credentials: true, // Allows cookies and credentials to be sent
  })
);

app.use(bodyParser.json());

// ✅ Use Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/follows", followRoutes);
app.use("/api/users", userRouters);

// ✅ Start Server Directly (no db.init for PostgreSQL)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
