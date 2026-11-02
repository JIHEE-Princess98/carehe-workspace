import 'reflect-metadata';import {NestFactory} from '@nestjs/core';import {Module,Controller,Get} from '@nestjs/common';
@Controller('health')class HealthController{@Get()check(){return {status:'ok',service:'carehe-issue-api',mode:'bootstrap-only'}}}
@Module({controllers:[HealthController]})class AppModule{}
async function bootstrap(){const app=await NestFactory.create(AppModule);app.enableCors({origin:'http://localhost:8000'});await app.listen(8080);console.log('API running at http://localhost:8080/health')}bootstrap();
