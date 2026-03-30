import { Test, TestingModule } from '@nestjs/testing';
import { WatchlistService } from './watchlist.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('WatchlistService', () => {
  let service: WatchlistService;
  let prisma: {
    watchlist: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      watchlist: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WatchlistService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<WatchlistService>(WatchlistService);
  });

  describe('findAll', () => {
    it('應回傳使用者的自選股清單', async () => {
      const mockData = [
        { id: 1, userId: 'u1', stockNo: '2330', stockName: '台積電' },
      ];
      prisma.watchlist.findMany.mockResolvedValue(mockData);

      const result = await service.findAll('u1');

      expect(result).toEqual(mockData);
      expect(prisma.watchlist.findMany).toHaveBeenCalledWith({
        where: { userId: 'u1' },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('create', () => {
    const dto = {
      userId: 'u1',
      stockNo: '2330',
      stockName: '台積電',
      groupName: '科技業',
    };

    it('應成功新增自選股', async () => {
      prisma.watchlist.findUnique.mockResolvedValue(null);
      prisma.watchlist.create.mockResolvedValue({ id: 1, ...dto });

      const result = await service.create(dto);

      expect(result).toEqual({ id: 1, ...dto });
      expect(prisma.watchlist.create).toHaveBeenCalledWith({
        data: {
          userId: 'u1',
          stockNo: '2330',
          stockName: '台積電',
          groupName: '科技業',
        },
      });
    });

    it('應在股票已存在時拋出 ConflictException', async () => {
      prisma.watchlist.findUnique.mockResolvedValue({ id: 1 });

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });

    it('應在未指定群組時預設為「未分類」', async () => {
      prisma.watchlist.findUnique.mockResolvedValue(null);
      prisma.watchlist.create.mockResolvedValue({ id: 2 });

      await service.create({
        userId: 'u1',
        stockNo: '2317',
        stockName: '鴻海',
      });

      expect(prisma.watchlist.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ groupName: '未分類' }) as object,
      });
    });
  });

  describe('updateGroup', () => {
    it('應成功更新群組名稱', async () => {
      prisma.watchlist.findFirst.mockResolvedValue({ id: 1, userId: 'u1' });
      prisma.watchlist.update.mockResolvedValue({
        id: 1,
        groupName: '金融業',
      });

      const result = await service.updateGroup(1, 'u1', '金融業');

      expect(result.groupName).toBe('金融業');
      expect(prisma.watchlist.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { groupName: '金融業' },
      });
    });

    it('應在找不到紀錄時拋出 NotFoundException', async () => {
      prisma.watchlist.findFirst.mockResolvedValue(null);

      await expect(service.updateGroup(99, 'u1', '金融業')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('應成功刪除自選股', async () => {
      prisma.watchlist.findFirst.mockResolvedValue({ id: 1, userId: 'u1' });
      prisma.watchlist.delete.mockResolvedValue({ id: 1 });

      const result = await service.remove(1, 'u1');

      expect(result).toEqual({ id: 1 });
      expect(prisma.watchlist.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('應在找不到紀錄時拋出 NotFoundException', async () => {
      prisma.watchlist.findFirst.mockResolvedValue(null);

      await expect(service.remove(99, 'u1')).rejects.toThrow(NotFoundException);
    });
  });
});
