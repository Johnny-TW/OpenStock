import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StockModule } from './stock/stock.module';
import { PrismaModule } from './prisma/prisma.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { WatchlistModule } from './watchlist/watchlist.module';

@Module({
  imports: [PrismaModule, StockModule, PortfolioModule, WatchlistModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
