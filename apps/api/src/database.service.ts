import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { createPool, Pool } from "mysql2/promise";

@Injectable()
export class DatabaseService {
  private pool?: Pool;

  get connection(): Pool {
    if (!this.pool) {
      const host = process.env.DB_HOST ?? process.env.MYSQL_HOST;
      const port = process.env.DB_PORT ?? process.env.MYSQL_PORT;
      const database = process.env.DB_DATABASE ?? process.env.MYSQL_DATABASE;
      const user = process.env.DB_USERNAME ?? process.env.MYSQL_USER;
      const password = process.env.DB_PASSWORD ?? process.env.MYSQL_PASSWORD;
      if (!host || !database || !user || !password) throw new ServiceUnavailableException("Database connection is not configured.");
      this.pool = createPool({ host, port: Number(port ?? 3306), database, user, password, waitForConnections: true, connectionLimit: 10 });
    }
    return this.pool;
  }
}
