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
import { WatchlistService } from './watchlist.service';
import {
  CreateWatchlistDto,
  UpdateWatchlistGroupDto,
} from './dto/watchlist.dto';

@ApiTags('自選股')
@ApiBearerAuth('bearer')
@Controller('watchlist')
export class WatchlistController {
  constructor(private readonly watchlistService: WatchlistService) {}

  @ApiOperation({ summary: '取得我的自選股清單' })
  @ApiQuery({ name: 'userId', description: '使用者 ID' })
  @ApiResponse({ status: 200, description: '成功取得自選股清單' })
  @ApiResponse({ status: 401, description: '未認證' })
  @Get()
  findAll(@Query('userId') userId: string) {
    return this.watchlistService.findAll(userId);
  }

  @ApiOperation({ summary: '加入自選股' })
  @ApiResponse({ status: 201, description: '成功加入自選股' })
  @ApiResponse({ status: 400, description: '請求參數驗證失敗' })
  @ApiResponse({ status: 401, description: '未認證' })
  @ApiResponse({ status: 409, description: '自選股已存在' })
  @Post()
  create(@Body() dto: CreateWatchlistDto) {
    return this.watchlistService.create(dto);
  }

  @ApiOperation({ summary: '更新自選股群組' })
  @ApiParam({ name: 'id', description: '自選股 ID', type: Number })
  @ApiResponse({ status: 200, description: '成功更新群組' })
  @ApiResponse({ status: 401, description: '未認證' })
  @ApiResponse({ status: 404, description: '自選股不存在' })
  @Patch(':id/group')
  updateGroup(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateWatchlistGroupDto,
  ) {
    return this.watchlistService.updateGroup(id, dto.userId, dto.groupName);
  }

  @ApiOperation({ summary: '移除自選股' })
  @ApiParam({ name: 'id', description: '自選股 ID', type: Number })
  @ApiQuery({ name: 'userId', description: '使用者 ID' })
  @ApiResponse({ status: 200, description: '成功移除自選股' })
  @ApiResponse({ status: 401, description: '未認證' })
  @ApiResponse({ status: 404, description: '自選股不存在' })
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Query('userId') userId: string,
  ) {
    return this.watchlistService.remove(id, userId);
  }
}
