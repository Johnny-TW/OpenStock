import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 3,
    }),
  ],
  controllers: [StockController],
  providers: [StockService],
})
export class StockModule {}
