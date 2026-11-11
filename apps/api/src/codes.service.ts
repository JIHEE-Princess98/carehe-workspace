import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { DatabaseService } from "./database.service";

type CodeRow = RowDataPacket & { codeId: number; codeGroup: string; code: string; codeName: string; sortOrder: number; useYn: number };
type CodeInput = { codeGroup: string; code: string; codeName: string; sortOrder: number; useYn: boolean };

@Injectable()
export class CodesService {
  constructor(private readonly database: DatabaseService) {}

  async list() {
    const [rows] = await this.database.connection.query<CodeRow[]>("SELECT code_id AS codeId, code_group AS codeGroup, code, code_name AS codeName, sort_order AS sortOrder, use_yn AS useYn FROM tb_codes ORDER BY code_group, sort_order, code");
    return rows.map((row) => ({ ...row, useYn: Boolean(row.useYn) }));
  }

  async create(input: CodeInput) {
    const [result] = await this.database.connection.execute<ResultSetHeader>("INSERT INTO tb_codes (code_group, code, code_name, sort_order, use_yn) VALUES (?, ?, ?, ?, ?)", [input.codeGroup, input.code, input.codeName, input.sortOrder, input.useYn ? 1 : 0]);
    return { id: result.insertId };
  }

  async update(codeId: number, input: CodeInput) {
    const [result] = await this.database.connection.execute<ResultSetHeader>("UPDATE tb_codes SET code_group = ?, code = ?, code_name = ?, sort_order = ?, use_yn = ? WHERE code_id = ?", [input.codeGroup, input.code, input.codeName, input.sortOrder, input.useYn ? 1 : 0, codeId]);
    if (!result.affectedRows) throw new NotFoundException("Code not found.");
  }

  validate(body: Record<string, unknown>): CodeInput {
    const text = (key: string) => {
      const value = body[key];
      if (typeof value !== "string" || !value.trim() || value.trim().length > 100) throw new BadRequestException(`Invalid ${key}.`);
      return value.trim().toUpperCase();
    };
    const sortOrder = body.sortOrder;
    if (!Number.isInteger(sortOrder) || (sortOrder as number) < 0) throw new BadRequestException("Invalid sortOrder.");
    if (typeof body.useYn !== "boolean") throw new BadRequestException("Invalid useYn.");
    return { codeGroup: text("codeGroup"), code: text("code"), codeName: typeof body.codeName === "string" && body.codeName.trim() && body.codeName.trim().length <= 100 ? body.codeName.trim() : (() => { throw new BadRequestException("Invalid codeName."); })(), sortOrder: sortOrder as number, useYn: body.useYn };
  }
}
