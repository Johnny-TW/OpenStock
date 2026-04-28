import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
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
