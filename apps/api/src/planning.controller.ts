import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post, Query, Req, Res, StreamableFile, UploadedFile, UseGuards, UseInterceptors, UnauthorizedException } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { createReadStream } from "fs";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { PermissionGuard } from "./permission.guard";
import { PermissionCodes } from "./require-permission.decorator";
import { PlanningService } from "./planning.service";

@Controller("planning")
@UseGuards(JwtAuthGuard, PermissionGuard)
@PermissionCodes("PLANNING_VIEW")
export class PlanningController {
  constructor(private readonly planning: PlanningService) {}
  @Get("documents") documents(@Query() query: Record<string, unknown>, @Req() request: { user?: { sub?: number } }) { return this.planning.documents(query, this.userId(request)); }
  @Post("documents") createDocument(@Body() body: Record<string, unknown>, @Req() request: { user?: { sub?: number } }) { return this.planning.createDocument(this.planning.validateDocument(body), this.userId(request)); }
  @Get("documents/:documentId") document(@Param("documentId", ParseIntPipe) documentId: number, @Req() request: { user?: { sub?: number } }) { return this.planning.document(documentId, this.userId(request)); }
  @Patch("documents/:documentId") @HttpCode(204) updateDocument(@Param("documentId", ParseIntPipe) documentId: number, @Body() body: Record<string, unknown>, @Req() request: { user?: { sub?: number } }) { return this.planning.updateDocument(documentId, this.planning.validateDocument(body), this.userId(request)); }
  @Delete("documents/:documentId") @HttpCode(204) deleteDocument(@Param("documentId", ParseIntPipe) documentId: number, @Req() request: { user?: { sub?: number } }) { return this.planning.deleteDocument(documentId, this.userId(request)); }
  @Post("documents/:documentId/attachments") @UseInterceptors(FileInterceptor("file")) uploadDocumentAttachment(@Param("documentId", ParseIntPipe) documentId: number, @UploadedFile() file: { originalname: string; mimetype: string; size: number; buffer: Buffer }, @Req() request: { user?: { sub?: number } }) { return this.planning.uploadDocumentAttachment(documentId, file, this.userId(request)); }
  @Get("attachments/:attachmentId/download") async downloadDocumentAttachment(@Param("attachmentId", ParseIntPipe) attachmentId: number, @Req() request: { user?: { sub?: number } }, @Res({ passthrough: true }) response: { setHeader: (name: string, value: string) => void }) { const attachment = await this.planning.documentAttachment(attachmentId, this.userId(request)); response.setHeader("Content-Type", attachment.mimeType); response.setHeader("Content-Disposition", `attachment; filename*=UTF-8''${encodeURIComponent(attachment.name)}`); return new StreamableFile(createReadStream(attachment.path)); }
  @Get("documents/:documentId/history") documentHistory(@Param("documentId", ParseIntPipe) documentId: number, @Req() request: { user?: { sub?: number } }) { return this.planning.documentHistory(documentId, this.userId(request)); }
  @Get("documents/:documentId/requirements") requirements(@Param("documentId", ParseIntPipe) documentId: number, @Query() query: Record<string, unknown>, @Req() request: { user?: { sub?: number } }) { return this.planning.requirements(documentId, query, this.userId(request)); }
  @Post("documents/:documentId/requirements") createRequirement(@Param("documentId", ParseIntPipe) documentId: number, @Body() body: Record<string, unknown>, @Req() request: { user?: { sub?: number } }) { return this.planning.createRequirement(documentId, this.planning.validateRequirement(body), this.userId(request)); }
  @Get("requirements/:requirementId") requirement(@Param("requirementId", ParseIntPipe) requirementId: number, @Req() request: { user?: { sub?: number } }) { return this.planning.requirement(requirementId, this.userId(request)); }
  @Patch("requirements/:requirementId") @HttpCode(204) updateRequirement(@Param("requirementId", ParseIntPipe) requirementId: number, @Body() body: Record<string, unknown>, @Req() request: { user?: { sub?: number } }) { return this.planning.updateRequirement(requirementId, this.planning.validateRequirement(body), this.userId(request)); }
  @Delete("requirements/:requirementId") @HttpCode(204) deleteRequirement(@Param("requirementId", ParseIntPipe) requirementId: number, @Req() request: { user?: { sub?: number } }) { return this.planning.deleteRequirement(requirementId, this.userId(request)); }
  @Get("requirements/:requirementId/history") requirementHistory(@Param("requirementId", ParseIntPipe) requirementId: number, @Req() request: { user?: { sub?: number } }) { return this.planning.requirementHistory(requirementId, this.userId(request)); }
  private userId(request: { user?: { sub?: number } }) { if (!request.user?.sub) throw new UnauthorizedException("Authentication is required."); return request.user.sub; }
}
