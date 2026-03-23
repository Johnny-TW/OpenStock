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
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PortfolioService } from './portfolio.service';
import { CreatePortfolioDto, UpdatePortfolioDto } from './dto/portfolio.dto';

@ApiTags('持股管理')
@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @ApiOperation({ summary: '取得我的持股清單' })
  @ApiQuery({ name: 'userId', description: '使用者 ID' })
  @Get()
  findAll(@Query('userId') userId: string) {
    return this.portfolioService.findAll(userId);
  }

  @ApiOperation({ summary: '取得單筆持股紀錄' })
  @ApiQuery({ name: 'userId', description: '使用者 ID' })
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('userId') userId: string,
  ) {
    return this.portfolioService.findOne(id, userId);
  }

  @ApiOperation({ summary: '新增持股紀錄' })
  @Post()
  create(@Body() dto: CreatePortfolioDto) {
    return this.portfolioService.create(dto);
  }

  @ApiOperation({ summary: '更新持股紀錄' })
  @ApiQuery({ name: 'userId', description: '使用者 ID' })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Query('userId') userId: string,
    @Body() dto: UpdatePortfolioDto,
  ) {
    return this.portfolioService.update(id, userId, dto);
  }

  @ApiOperation({ summary: '刪除持股紀錄' })
  @ApiQuery({ name: 'userId', description: '使用者 ID' })
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Query('userId') userId: string,
  ) {
    return this.portfolioService.remove(id, userId);
  }
}
