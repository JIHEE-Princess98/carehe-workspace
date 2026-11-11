import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user?: { roles?: string[] } }>();
    if (!request.user?.roles?.includes("ADMIN")) throw new ForbiddenException("Administrator access is required.");
    return true;
  }
}
