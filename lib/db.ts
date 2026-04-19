import mysql from "mysql2/promise";

declare global {
  var _dbPool: mysql.Pool | undefined;
}

export const db =
  global._dbPool ||
  mysql.createPool(process.env.MYSQL_URL!);

if (process.env.NODE_ENV !== "production") {
  global._dbPool = db;
}
