import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { createDatabaseDataSource } from "./typeorm.datasource";

@Injectable()
export class DatabaseHealthService {
  private dataSource?: DataSource;

  async isAvailable() {
    try {
      this.dataSource ??= createDatabaseDataSource();
      if (!this.dataSource.isInitialized) await this.dataSource.initialize();
      await this.dataSource.query("SELECT 1");
      return true;
    } catch {
      return false;
    }
  }
}
