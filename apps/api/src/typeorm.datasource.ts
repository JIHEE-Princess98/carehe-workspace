import { DataSource } from "typeorm";

function databaseOptions() {
  const host = process.env.DB_HOST ?? process.env.MYSQL_HOST;
  const username = process.env.DB_USERNAME ?? process.env.MYSQL_USER;
  const password = process.env.DB_PASSWORD ?? process.env.MYSQL_PASSWORD;
  const database = process.env.DB_DATABASE ?? process.env.MYSQL_DATABASE;
  if (!host || !username || !password || !database) throw new Error("Database configuration is missing.");
  return { host, username, password, database };
}

export function createDatabaseDataSource() {
  const { host, username, password, database } = databaseOptions();
  return new DataSource({ type: "mysql", host, port: Number(process.env.DB_PORT ?? process.env.MYSQL_PORT ?? 3306), username, password, database, entities: [], synchronize: false, migrationsRun: false, logging: false, ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false" } : undefined });
}
