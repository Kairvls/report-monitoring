import mysql from "mysql2/promise";

declare global {
  var _dbPool: mysql.Pool | undefined;
}

export const db = () => {
  if (!process.env.MYSQL_URL) {
    throw new Error("MYSQL_URL is not defined");
  }

  if (!global._dbPool) {
    global._dbPool = mysql.createPool({
      uri: process.env.MYSQL_URL,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });
  }

  return global._dbPool;
};
