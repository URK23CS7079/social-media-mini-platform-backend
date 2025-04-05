const db = require("../db");

// 🔹 Register a New User
async function createUser(username, email, hashedPassword, profilePic = null) {
  const query = `
    INSERT INTO users (username, email, password, profile_pic)
    VALUES ($1, $2, $3, $4)
  `;
  const values = [username, email, hashedPassword, profilePic];
  await db.query(query, values);
}

// 🔹 Find a User by Email
async function findUserByEmail(email) {
  const query = `SELECT * FROM users WHERE email = $1`;
  const result = await db.query(query, [email]);
  return result.rows[0]; // Returns user object if found
}

module.exports = { createUser, findUserByEmail };
