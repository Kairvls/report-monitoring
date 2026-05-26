import mysql from "mysql2/promise";

let pool: mysql.Pool;

export const db = () => {
  if (!process.env.MYSQL_URL) {
    throw new Error("MYSQL_URL is not defined");
  }

  if (!pool) {
    pool = mysql.createPool({
      uri: process.env.MYSQL_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    });
  }

  return pool;
};
