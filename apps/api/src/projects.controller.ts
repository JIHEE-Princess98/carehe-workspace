import { BadRequestException, Body, Controller, Get, HttpCode, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { PermissionGuard } from "./permission.guard";
import { PermissionCodes } from "./require-permission.decorator";
import { ProjectsService } from "./projects.service";

type RequestUser = { user?: { sub?: number } };

@Controller("projects")
@UseGuards(JwtAuthGuard, PermissionGuard)
@PermissionCodes("PROJECT_VIEW")
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}
  @Get() list(@Req() request: RequestUser) { return this.projects.list(this.userId(request)); }
  @Post() create(@Body() body: Record<string, unknown>, @Req() request: RequestUser) { return this.projects.create(this.projects.validateProject(body), this.userId(request)); }
  @Get(":projectId") get(@Param("projectId", ParseIntPipe) projectId: number, @Req() request: RequestUser) { return this.projects.get(projectId, this.userId(request)); }
  @Get(":projectId/documents") documents(@Param("projectId", ParseIntPipe) projectId: number, @Req() request: RequestUser) { return this.projects.documents(projectId, this.userId(request)); }
  @Patch(":projectId") @HttpCode(204) update(@Param("projectId", ParseIntPipe) projectId: number, @Body() body: Record<string, unknown>, @Req() request: RequestUser) { return this.projects.update(projectId, this.projects.validateProject(body), this.userId(request)); }
  @Get(":projectId/members") members(@Param("projectId", ParseIntPipe) projectId: number, @Req() request: RequestUser) { return this.projects.members(projectId, this.userId(request)); }
  @Get(":projectId/available-members") availableMembers(@Param("projectId", ParseIntPipe) projectId: number, @Req() request: RequestUser) { return this.projects.availableMembers(projectId, this.userId(request)); }
  @Post(":projectId/members") @HttpCode(204) invite(@Param("projectId", ParseIntPipe) projectId: number, @Body() body: { userId?: unknown; memberRole?: unknown }, @Req() request: RequestUser) {
    if (!Number.isInteger(body.userId) || (body.memberRole !== "EDITOR" && body.memberRole !== "VIEWER")) throw new BadRequestException("Invalid project member.");
    return this.projects.invite(projectId, body.userId as number, body.memberRole, this.userId(request));
  }
  @Patch(":projectId/members/:userId/response") @HttpCode(204) respond(@Param("projectId", ParseIntPipe) projectId: number, @Param("userId", ParseIntPipe) userId: number, @Body() body: { status?: unknown }, @Req() request: RequestUser) {
    if (body.status !== "ACCEPTED" && body.status !== "DECLINED") throw new BadRequestException("Invalid invitation response.");
    return this.projects.respond(projectId, userId, body.status, this.userId(request));
  }
  @Patch(":projectId/members/:userId/revoke") @HttpCode(204) revoke(@Param("projectId", ParseIntPipe) projectId: number, @Param("userId", ParseIntPipe) userId: number, @Req() request: RequestUser) { return this.projects.revoke(projectId, userId, this.userId(request)); }
  private userId(request: RequestUser) { if (!request.user?.sub) throw new BadRequestException("Invalid user."); return request.user.sub; }
}
