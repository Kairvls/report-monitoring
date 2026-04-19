import mysql from "mysql2/promise";

declare global {
  // allow global var in dev (important for Next.js hot reload)
  var _dbPool: mysql.Pool | undefined;
}

export const db =
  global._dbPool ||
  mysql.createPool({
    host: "localhost",
    user: "root",
    password: "kaisuan", // change if you have password
    database: "reports_monitoring", // ⚠️ change this
    waitForConnections: true,
    connectionLimit: 10, // prevents "too many connections"
    queueLimit: 0,
  });

// ✅ prevent multiple pools in dev (VERY IMPORTANT)
if (process.env.NODE_ENV !== "production") {
  global._dbPool = db;
}