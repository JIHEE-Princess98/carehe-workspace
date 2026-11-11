import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthService } from "./auth.service";

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly auth: AuthService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<string[]>("permissionCodes", [context.getHandler(), context.getClass()]) ?? [];
    const user = context.switchToHttp().getRequest<{ user?: { sub?: number } }>().user;
    if (!required.length) return true;
    const permissions = user?.sub ? await this.auth.permissionCodes(user.sub) : [];
    if (required.every((code) => permissions.includes(code))) return true;
    throw new ForbiddenException("Permission is required.");
  }
}
