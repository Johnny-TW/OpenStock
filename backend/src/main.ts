import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import {
  LoggingInterceptor,
  ResponseInterceptor,
} from './interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new ResponseInterceptor(),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      whitelist: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('EE39 StockSmart System OpenAPI')
    .setDescription(
      '本平臺提供臺灣證券交易所服務 API 的二次封裝，資料來源為 [TWSE OpenAPI](https://openapi.twse.com.tw/)。',
    )
    .setVersion('1.0')
    .setExternalDoc('TWSE OpenAPI 原始文件', 'https://openapi.twse.com.tw/')
    .addServer('http://localhost:3004', '本機開發')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  // 設定 Swagger 並開啟 search 功能
  SwaggerModule.setup('api/docs', app, document, {
    explorer: true,
    swaggerOptions: {
      filter: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      docExpansion: 'list',
      defaultModelsExpandDepth: 1,
      defaultModelExpandDepth: 2,
    },
    customSiteTitle: '臺灣證券交易所 OpenAPI',
  });

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3003',
      'http://localhost:3004',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  const port = process.env.PORT ?? 3004;
  await app.listen(port);

  const appUrl = await app.getUrl();
  Logger.log(`Application is running on: ${appUrl}`, 'Bootstrap');
  Logger.log(`Swagger docs available at: ${appUrl}/api/docs`, 'Bootstrap');
  Logger.log(`OpenAPI JSON available at: ${appUrl}/api/docs-json`, 'Bootstrap');
}
void bootstrap();
