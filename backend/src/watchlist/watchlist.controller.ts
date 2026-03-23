import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { WatchlistService } from './watchlist.service';
import { CreateWatchlistDto } from './dto/watchlist.dto';

@ApiTags('自選股')
@Controller('watchlist')
export class WatchlistController {
  constructor(private readonly watchlistService: WatchlistService) {}

  @ApiOperation({ summary: '取得我的自選股清單' })
  @ApiQuery({ name: 'userId', description: '使用者 ID' })
  @Get()
  findAll(@Query('userId') userId: string) {
    return this.watchlistService.findAll(userId);
  }

  @ApiOperation({ summary: '加入自選股' })
  @Post()
  create(@Body() dto: CreateWatchlistDto) {
    return this.watchlistService.create(dto);
  }

  @ApiOperation({ summary: '移除自選股' })
  @ApiQuery({ name: 'userId', description: '使用者 ID' })
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Query('userId') userId: string,
  ) {
    return this.watchlistService.remove(id, userId);
  }
}
