import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('系統')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: '健康檢查' })
  @ApiResponse({ status: 200, description: '服務正常運作' })
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
