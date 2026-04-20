import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { PortfolioService } from './portfolio.service';
import { CreatePortfolioDto, UpdatePortfolioDto } from './dto/portfolio.dto';

@ApiTags('持股管理')
@ApiBearerAuth('bearer')
@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @ApiOperation({ summary: '取得我的持股清單' })
  @ApiQuery({ name: 'userId', description: '使用者 ID' })
  @ApiResponse({ status: 200, description: '成功取得持股清單' })
  @ApiResponse({ status: 401, description: '未認證' })
  @Get()
  findAll(@Query('userId') userId: string) {
    return this.portfolioService.findAll(userId);
  }

  @ApiOperation({ summary: '取得單筆持股紀錄' })
  @ApiParam({ name: 'id', description: '持股紀錄 ID', type: Number })
  @ApiQuery({ name: 'userId', description: '使用者 ID' })
  @ApiResponse({ status: 200, description: '成功取得單筆持股' })
  @ApiResponse({ status: 401, description: '未認證' })
  @ApiResponse({ status: 404, description: '持股紀錄不存在' })
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('userId') userId: string,
  ) {
    return this.portfolioService.findOne(id, userId);
  }

  @ApiOperation({ summary: '新增持股紀錄' })
  @ApiResponse({ status: 201, description: '成功新增持股' })
  @ApiResponse({ status: 400, description: '請求參數驗證失敗' })
  @ApiResponse({ status: 401, description: '未認證' })
  @Post()
  create(@Body() dto: CreatePortfolioDto) {
    return this.portfolioService.create(dto);
  }

  @ApiOperation({ summary: '更新持股紀錄' })
  @ApiParam({ name: 'id', description: '持股紀錄 ID', type: Number })
  @ApiQuery({ name: 'userId', description: '使用者 ID' })
  @ApiResponse({ status: 200, description: '成功更新持股' })
  @ApiResponse({ status: 401, description: '未認證' })
  @ApiResponse({ status: 404, description: '持股紀錄不存在' })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Query('userId') userId: string,
    @Body() dto: UpdatePortfolioDto,
  ) {
    return this.portfolioService.update(id, userId, dto);
  }

  @ApiOperation({ summary: '刪除持股紀錄' })
  @ApiParam({ name: 'id', description: '持股紀錄 ID', type: Number })
  @ApiQuery({ name: 'userId', description: '使用者 ID' })
  @ApiResponse({ status: 200, description: '成功刪除持股' })
  @ApiResponse({ status: 401, description: '未認證' })
  @ApiResponse({ status: 404, description: '持股紀錄不存在' })
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Query('userId') userId: string,
  ) {
    return this.portfolioService.remove(id, userId);
  }
}
