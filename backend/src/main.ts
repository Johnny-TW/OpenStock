import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { LoggingInterceptor, ResponseInterceptor } from './interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new LoggingInterceptor(), new ResponseInterceptor());

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
      '本平臺提供臺灣證券交易所服務 API 的二次封裝，資料來源為 [TWSE OpenAPI](https://openapi.twse.com.tw/)。\n\n' +
        '## 認證方式\n' +
        '需認證的 API 請在 Header 帶入 `Authorization: Bearer <token>`，點擊右上角 🔓 Authorize 按鈕輸入 JWT Token。',
    )
    .setVersion('1.0')
    .setExternalDoc('TWSE OpenAPI 原始文件', 'https://openapi.twse.com.tw/')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: '請輸入 JWT Token',
      },
      'bearer',
    )
    .addServer('http://localhost:3004', '本機開發')
    .addServer('http://52.68.77.3:4004', 'QAS 測試環境')
    .addTag('系統', '健康檢查與基本資訊')
    .addTag('證券交易', '上市個股日成交資訊、估值、成交量排行')
    .addTag('指數', '大盤指數、盤中即時成交、歷史資料')
    .addTag('排行榜', '營收、毛利率、殖利率、本益比排行')
    .addTag('新聞', '台股、美股、國際財經新聞彙整')
    .addTag('熱力圖', '產業漲跌幅 Treemap 資料')
    .addTag('持股管理', '使用者持股 CRUD (需認證)')
    .addTag('自選股', '使用者自選股 CRUD (需認證)')
    .addTag('AI 股票分析', 'Claude AI 市場分析與推薦（需認證）')
    .build();
  const document = SwaggerModule.createDocument(app, config, {
    autoTagControllers: false,
  });

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

  const corsOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:3004',
  ];
  if (process.env.CORS_ORIGIN) {
    corsOrigins.push(process.env.CORS_ORIGIN);
  }
  app.enableCors({
    origin: corsOrigins,
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
