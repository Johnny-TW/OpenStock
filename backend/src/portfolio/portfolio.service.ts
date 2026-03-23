import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePortfolioDto, UpdatePortfolioDto } from './dto/portfolio.dto';

@Injectable()
export class PortfolioService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.portfolio.findMany({
      where: { userId },
      orderBy: { buyDate: 'desc' },
    });
  }

  async findOne(id: number, userId: string) {
    const item = await this.prisma.portfolio.findFirst({
      where: { id, userId },
    });
    if (!item) throw new NotFoundException('找不到該持股紀錄');
    return item;
  }

  async create(dto: CreatePortfolioDto) {
    return this.prisma.portfolio.create({
      data: {
        ...dto,
        buyDate: new Date(dto.buyDate),
      },
    });
  }

  async update(id: number, userId: string, dto: UpdatePortfolioDto) {
    await this.findOne(id, userId);
    const { buyDate, ...rest } = dto;
    return this.prisma.portfolio.update({
      where: { id },
      data: {
        ...rest,
        ...(buyDate && { buyDate: new Date(buyDate) }),
      },
    });
  }

  async remove(id: number, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.portfolio.delete({ where: { id } });
  }
}
