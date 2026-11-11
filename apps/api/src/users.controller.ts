import { Body, Controller, Get, HttpCode, Param, ParseIntPipe, Patch, Post, UseGuards, BadRequestException } from "@nestjs/common";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { PermissionGuard } from "./permission.guard";
import { PermissionCodes } from "./require-permission.decorator";
import { UsersService } from "./users.service";

type CreateUserBody = { loginId?: unknown; email?: unknown; name?: unknown; password?: unknown; teamId?: unknown; roleIds?: unknown };
type StatusBody = { useYn?: unknown };

@Controller("users")
@UseGuards(JwtAuthGuard, PermissionGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  @PermissionCodes("USER_VIEW")
  list() { return this.users.list(); }

  @Get("meta")
  @PermissionCodes("USER_VIEW")
  meta() { return this.users.meta(); }

  @Post()
  @HttpCode(201)
  @PermissionCodes("USER_CREATE")
  create(@Body() body: CreateUserBody) {
    if (typeof body.loginId !== "string" || typeof body.name !== "string" || !body.loginId.trim() || !body.name.trim() || (body.email !== undefined && typeof body.email !== "string") || !Number.isInteger(body.teamId) || (body.teamId as number) < 0 || !Array.isArray(body.roleIds) || !body.roleIds.length || body.roleIds.some((id) => !Number.isInteger(id) || id < 1)) throw new BadRequestException("Invalid user input.");
    return this.users.create({ loginId: body.loginId.trim(), email: body.email?.trim(), name: body.name.trim(), teamId: body.teamId as number, roleIds: [...new Set(body.roleIds as number[])] });
  }

  @Patch(":userId")
  @HttpCode(204)
  @PermissionCodes("USER_UPDATE")
  update(@Param("userId", ParseIntPipe) userId: number, @Body() body: CreateUserBody) {
    if (typeof body.loginId !== "string" || !body.loginId.trim() || (body.email !== undefined && typeof body.email !== "string") || !Number.isInteger(body.teamId) || (body.teamId as number) < 0 || !Array.isArray(body.roleIds) || !body.roleIds.length || body.roleIds.some((id) => !Number.isInteger(id) || id < 1)) throw new BadRequestException("Invalid user input.");
    return this.users.update(userId, { loginId: body.loginId.trim(), email: body.email?.trim(), teamId: body.teamId as number, roleIds: [...new Set(body.roleIds as number[])] });
  }

  @Patch(":userId/password-reset")
  @HttpCode(204)
  @PermissionCodes("USER_PASSWORD_RESET")
  resetPassword(@Param("userId", ParseIntPipe) userId: number) { return this.users.resetPassword(userId); }

  @Patch(":userId/status")
  @HttpCode(204)
  @PermissionCodes("USER_STATUS_UPDATE")
  updateStatus(@Param("userId", ParseIntPipe) userId: number, @Body() body: StatusBody) {
    if (typeof body.useYn !== "boolean") throw new BadRequestException("Invalid user status.");
    return this.users.updateStatus(userId, body.useYn);
  }
}
