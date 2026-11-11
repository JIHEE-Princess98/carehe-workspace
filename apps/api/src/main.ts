import "reflect-metadata";
import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(__dirname, "../.env") });
import { NestFactory } from "@nestjs/core";
import { Controller, Get, Module, ServiceUnavailableException } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { DatabaseService } from "./database.service";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { AdminGuard } from "./admin.guard";
import { PermissionGuard } from "./permission.guard";
import { PermissionsController } from "./permissions.controller";
import { PermissionsService } from "./permissions.service";
import { CodesController } from "./codes.controller";
import { CodesService } from "./codes.service";
import { DatabaseHealthService } from "./database-health.service";
import { ProjectsController } from "./projects.controller";
import { ProjectsService } from "./projects.service";
import { PlanningController } from "./planning.controller";
import { PlanningService } from "./planning.service";

@Controller("health")
class HealthController {
  constructor(private readonly databaseHealth: DatabaseHealthService) {}
  @Get() check() { return { status: "ok", service: "carehe-issue-api" }; }
  @Get("db") async checkDatabase() { if (!(await this.databaseHealth.isAvailable())) throw new ServiceUnavailableException({ status: "unavailable" }); return { status: "ok" }; }
}

@Module({
  imports: [JwtModule.register({ secret: process.env.JWT_SECRET })],
  controllers: [HealthController, AuthController, UsersController, PermissionsController, CodesController, ProjectsController, PlanningController],
  providers: [DatabaseService, DatabaseHealthService, AuthService, UsersService, PermissionsService, CodesService, ProjectsService, PlanningService, JwtAuthGuard, AdminGuard, PermissionGuard],
}) class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const corsOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:8000,http://127.0.0.1:8000").split(",").map((origin) => origin.trim()).filter(Boolean);
  app.enableCors({ origin: (origin, callback) => callback(null, !origin || corsOrigins.includes(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)), methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], allowedHeaders: ["Content-Type", "Authorization"] });
  await app.listen(8080);
  console.log("API running at http://localhost:8080/health");
}
bootstrap();
