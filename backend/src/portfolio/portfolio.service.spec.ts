import { Test, TestingModule } from '@nestjs/testing';
import { PortfolioService } from './portfolio.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('PortfolioService', () => {
  let service: PortfolioService;
  let prisma: {
    portfolio: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      portfolio: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PortfolioService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<PortfolioService>(PortfolioService);
  });

  describe('findAll', () => {
    it('應回傳使用者的持股清單', async () => {
      const mockData = [
        { id: 1, userId: 'u1', stockNo: '2330', buyPrice: 950, shares: 100 },
      ];
      prisma.portfolio.findMany.mockResolvedValue(mockData);

      const result = await service.findAll('u1');

      expect(result).toEqual(mockData);
      expect(prisma.portfolio.findMany).toHaveBeenCalledWith({
        where: { userId: 'u1' },
        orderBy: { buyDate: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('應回傳單筆持股紀錄', async () => {
      const mockItem = { id: 1, userId: 'u1', stockNo: '2330' };
      prisma.portfolio.findFirst.mockResolvedValue(mockItem);

      const result = await service.findOne(1, 'u1');
      expect(result).toEqual(mockItem);
    });

    it('應在找不到紀錄時拋出 NotFoundException', async () => {
      prisma.portfolio.findFirst.mockResolvedValue(null);

      await expect(service.findOne(99, 'u1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('應成功建立持股紀錄', async () => {
      const dto = {
        userId: 'u1',
        stockNo: '2330',
        stockName: '台積電',
        buyPrice: 950,
        buyDate: '2024-01-15',
        shares: 100,
      };
      const mockResult = { id: 1, ...dto, buyDate: new Date('2024-01-15') };
      prisma.portfolio.create.mockResolvedValue(mockResult);

      const result = await service.create(dto);

      expect(result).toEqual(mockResult);
      expect(prisma.portfolio.create).toHaveBeenCalledWith({
        data: {
          ...dto,
          buyDate: new Date('2024-01-15'),
        },
      });
    });
  });

  describe('update', () => {
    it('應成功更新持股紀錄', async () => {
      prisma.portfolio.findFirst.mockResolvedValue({ id: 1, userId: 'u1' });
      prisma.portfolio.update.mockResolvedValue({
        id: 1,
        shares: 200,
      });

      const result = await service.update(1, 'u1', { shares: 200 });

      expect(result.shares).toBe(200);
    });

    it('應正確處理 buyDate 更新', async () => {
      prisma.portfolio.findFirst.mockResolvedValue({ id: 1, userId: 'u1' });
      prisma.portfolio.update.mockResolvedValue({ id: 1 });

      await service.update(1, 'u1', { buyDate: '2024-06-01' });

      expect(prisma.portfolio.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          buyDate: new Date('2024-06-01'),
        }) as object,
      });
    });

    it('應在找不到紀錄時拋出 NotFoundException', async () => {
      prisma.portfolio.findFirst.mockResolvedValue(null);

      await expect(service.update(99, 'u1', { shares: 200 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('應成功刪除持股紀錄', async () => {
      prisma.portfolio.findFirst.mockResolvedValue({ id: 1, userId: 'u1' });
      prisma.portfolio.delete.mockResolvedValue({ id: 1 });

      const result = await service.remove(1, 'u1');
      expect(result).toEqual({ id: 1 });
    });

    it('應在找不到紀錄時拋出 NotFoundException', async () => {
      prisma.portfolio.findFirst.mockResolvedValue(null);

      await expect(service.remove(99, 'u1')).rejects.toThrow(NotFoundException);
    });
  });
});
