import { type CacheManagerOptions, CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheableMemory } from 'cacheable';
import { Keyv } from 'keyv';
import { AnalysisModule } from './analysis/analysis.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserThrottlerGuard } from './auth/user-throttler.guard';
import { PortfolioModule } from './portfolio/portfolio.module';
import { PrismaModule } from './prisma/prisma.module';
import { StockModule } from './stock/stock.module';
import { WatchlistModule } from './watchlist/watchlist.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 300 }]),
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

        return { stores } as unknown as CacheManagerOptions;
      },
    }),
    PrismaModule,
    StockModule,
    PortfolioModule,
    WatchlistModule,
    AnalysisModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: UserThrottlerGuard }],
})
export class AppModule {}
