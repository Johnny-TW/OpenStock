import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { CacheableMemory } from 'cacheable';
import { Keyv } from 'keyv';
import { AnalysisModule } from './analysis/analysis.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PortfolioModule } from './portfolio/portfolio.module';
import { PrismaModule } from './prisma/prisma.module';
import { StockModule } from './stock/stock.module';
import { WatchlistModule } from './watchlist/watchlist.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '3h' },
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        const stores: Keyv[] = [
          new Keyv({
            store: new CacheableMemory({ ttl: 60000, lruSize: 5000 }),
          }),
        ];

        if (process.env.REDIS_HOST) {
          const { createKeyv } = await import('@keyv/redis');
          stores.push(
            createKeyv(
              `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT || 6379}`,
            ) as unknown as Keyv,
          );
        }

        return { stores };
      },
    }),
    PrismaModule,
    StockModule,
    PortfolioModule,
    WatchlistModule,
    AnalysisModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
