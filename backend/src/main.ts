import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { LoggingInterceptor, ResponseInterceptor } from './interceptors/response.interceptor';

// 並行 HTTPS 請求（TWSE API 批次呼叫）會在同一個 TLSSocket 上掛多個 error listener，
// 預設上限 10 不夠用，調高避免誤報 MaxListenersExceededWarning。
process.setMaxListeners(50);

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
    .setTitle('SS01 - StockSmart System OpenAPI')
    .setDescription(
      '本平臺提供臺灣證券交易所服務 API 的二次封裝，資料來源為 [TWSE OpenAPI](https://openapi.twse.com.tw/)。\n\n' +
        '## 認證方式\n' +
        '需認證的 API 請點擊右上角 🔓 Authorize 按鈕輸入 JWT Token。',
    )
    .setVersion('1.0')
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
      displayRequestDuration: true,
    },
    customSiteTitle: 'SS01 - StockSmart System OpenAPI',
    customCss: `.topbar-wrapper a::after { content: " | OpenAPI JSON"; font-size: 12px; color: #89bf04; }
      .swagger-ui .info .base-url { font-size: 14px; font-weight: bold; }`,
    customfavIcon: '',
    customJsStr: `
      setTimeout(() => {
        const info = document.querySelector('.info');
        if (info && !document.querySelector('.custom-json-link')) {
          const link = document.createElement('a');
          link.className = 'custom-json-link';
          link.href = '/api/docs-json';
          link.target = '_blank';
          link.style.cssText = 'display:inline-block;margin-top:8px;font-size:13px;text-decoration:underline;';
          link.textContent = '/api/docs-json';
          const desc = info.querySelector('.description');
          if (desc) desc.parentNode.insertBefore(link, desc);
          else info.appendChild(link);
        }
      }, 500);
    `,
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
