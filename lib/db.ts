import mysql from "mysql2/promise";

declare global {
  var _dbPool: mysql.Pool | undefined;
}

export const db = () => {
  if (!process.env.MYSQL_URL) {
    throw new Error("MYSQL_URL is not defined");
  }

  if (!global._dbPool) {
    global._dbPool = mysql.createPool(process.env.MYSQL_URL);
  }

  return global._dbPool;
};
