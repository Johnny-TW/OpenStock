新增後端功能模組指令：

建立新的 NestJS 功能模組時，需要產生以下檔案：

```
backend/src/<module-name>/
├── <module-name>.module.ts      # 模組定義，import PrismaModule
├── <module-name>.controller.ts  # 路由，加 @ApiTags + Swagger 註解
├── <module-name>.service.ts     # 商業邏輯，注入 PrismaService
└── dto/
    └── <module-name>.dto.ts     # DTO，用 class-validator 驗證
```

並在 `app.module.ts` 的 imports 陣列中註冊新模組。

注意事項：
- Controller 加 `@ApiTags('模組中文名')`
- 每個端點加 `@ApiOperation({ summary: '...' })`
- 需認證的路由加 `@UseGuards(AuthGuard)`
- Service 的每個方法都要有對應的 `.spec.ts` 測試
