import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWatchlistDto } from './dto/watchlist.dto';

@Injectable()
export class WatchlistService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.watchlist.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreateWatchlistDto) {
    const exists = await this.prisma.watchlist.findUnique({
      where: { userId_stockNo: { userId: dto.userId, stockNo: dto.stockNo } },
    });
    if (exists) throw new ConflictException('該股票已在自選清單中');
    return this.prisma.watchlist.create({ data: dto });
  }

  async remove(id: number, userId: string) {
    const item = await this.prisma.watchlist.findFirst({ where: { id, userId } });
    if (!item) throw new NotFoundException('找不到該自選股紀錄');
    return this.prisma.watchlist.delete({ where: { id } });
  }
}
