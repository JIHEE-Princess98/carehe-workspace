import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{ headers: { authorization?: string }; user?: unknown }>();
    const token = request.headers.authorization?.replace(/^Bearer\s+/i, "");
    if (!token) throw new UnauthorizedException("Authentication is required.");
    try {
      request.user = await this.jwt.verifyAsync(token);
      return true;
    } catch {
      throw new UnauthorizedException("Authentication is required.");
    }
  }
}
