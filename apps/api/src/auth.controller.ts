import { BadRequestException, Body, Controller, Get, HttpCode, Patch, Post, Req, UnauthorizedException, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./jwt-auth.guard";

type LoginBody = { loginId?: unknown; password?: unknown };
type PasswordBody = { password?: unknown };

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Get("session")
  @UseGuards(JwtAuthGuard)
  session(@Req() request: { user?: { sub?: number } }) {
    if (!request.user?.sub) throw new UnauthorizedException("Invalid session.");
    return this.auth.permissionCodes(request.user.sub).then((permissions) => ({ permissions }));
  }

  @Post("login")
  @HttpCode(200)
  login(@Body() body: LoginBody) {
    if (typeof body.loginId !== "string" || typeof body.password !== "string" || !body.loginId.trim() || !body.password) throw new UnauthorizedException("Invalid login credentials.");
    return this.auth.login(body.loginId.trim(), body.password);
  }

  @Patch("password")
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  changePassword(@Req() request: { user?: { sub?: number } }, @Body() body: PasswordBody) {
    if (!request.user?.sub || typeof body.password !== "string") throw new BadRequestException("Invalid password.");
    return this.auth.changePassword(request.user.sub, body.password);
  }
}
