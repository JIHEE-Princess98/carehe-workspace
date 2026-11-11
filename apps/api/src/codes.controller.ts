import { Body, Controller, Get, HttpCode, Param, ParseIntPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { CodesService } from "./codes.service";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { PermissionGuard } from "./permission.guard";
import { PermissionCodes } from "./require-permission.decorator";

@Controller("codes")
@UseGuards(JwtAuthGuard, PermissionGuard)
export class CodesController {
  constructor(private readonly codes: CodesService) {}

  @Get() @PermissionCodes("COMMON_CODE_VIEW") list() { return this.codes.list(); }
  @Post() @PermissionCodes("COMMON_CODE_MANAGE") create(@Body() body: Record<string, unknown>) { return this.codes.create(this.codes.validate(body)); }
  @Patch(":codeId") @HttpCode(204) @PermissionCodes("COMMON_CODE_MANAGE") update(@Param("codeId", ParseIntPipe) codeId: number, @Body() body: Record<string, unknown>) { return this.codes.update(codeId, this.codes.validate(body)); }
}
