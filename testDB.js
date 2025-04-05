const connectDB = require("./db");

async function testConnection() {
  try {
    const conn = await connectDB();
    console.log("🎉 Connection successful!");
    await conn.close();
  } catch (error) {
    console.error("❌ Connection failed:", error);
  }
}

testConnection();
