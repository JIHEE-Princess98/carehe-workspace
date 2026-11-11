import { Body, Controller, Get, HttpCode, Param, ParseIntPipe, Patch, Post, Put, UseGuards, BadRequestException } from "@nestjs/common";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { PermissionsService } from "./permissions.service";
import { PermissionGuard } from "./permission.guard";
import { PermissionCodes } from "./require-permission.decorator";

type RoleBody = { name?: unknown; description?: unknown };
type PermissionBody = { code?: unknown; name?: unknown };
type MappingBody = { permissionIds?: unknown };
type RoleUpdateBody = { name?: unknown; description?: unknown; useYn?: unknown };

@Controller("permissions")
@UseGuards(JwtAuthGuard, PermissionGuard)
export class PermissionsController {
  constructor(private readonly permissions: PermissionsService) {}
  @Get() @PermissionCodes("ROLE_VIEW") list() { return this.permissions.list(); }
  @Post("roles") @PermissionCodes("ROLE_MANAGE") createRole(@Body() body: RoleBody) { return this.permissions.createRole(this.permissions.validateName(body.name, "role name"), typeof body.description === "string" ? body.description.trim() : undefined); }
  @Patch("roles/:roleId") @HttpCode(204) @PermissionCodes("ROLE_MANAGE") updateRole(@Param("roleId", ParseIntPipe) roleId: number, @Body() body: RoleUpdateBody) {
    if (typeof body.name !== "string" || !body.name.trim() || (body.description !== undefined && typeof body.description !== "string") || typeof body.useYn !== "boolean") throw new BadRequestException("Invalid role input.");
    return this.permissions.updateRole(roleId, body.name.trim(), body.description?.trim() ?? "", body.useYn);
  }
  @Post() @PermissionCodes("ROLE_MANAGE") createPermission(@Body() body: PermissionBody) { return this.permissions.createPermission(this.permissions.validateName(body.code, "permission code"), this.permissions.validateName(body.name, "permission name")); }
  @Put("roles/:roleId") @HttpCode(204) @PermissionCodes("ROLE_MANAGE") updateRolePermissions(@Param("roleId", ParseIntPipe) roleId: number, @Body() body: MappingBody) {
    if (!Array.isArray(body.permissionIds) || body.permissionIds.some((id) => !Number.isInteger(id) || id < 1)) throw new BadRequestException("Invalid permissions.");
    return this.permissions.replaceRolePermissions(roleId, [...new Set(body.permissionIds as number[])]);
  }
}
