const bcrypt = require("bcryptjs");
const mysql = require("mysql2/promise");

async function createAdmin() {
  const db = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "kaisuan",
    database: "reports_monitoring",
  });

  const username = "rica";
  const password = "passwordkai26"; // change later if you want

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.query(
    "INSERT INTO users (username, password) VALUES (?, ?)",
    [username, hashedPassword]
  );

  console.log("Admin created successfully!");
  console.log("Username: rica");
  console.log("Password: admin123");

  process.exit();
}

createAdmin();