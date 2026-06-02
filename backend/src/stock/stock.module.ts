import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 3,
    }),
  ],
  controllers: [StockController],
  providers: [StockService],
  exports: [StockService],
})
export class StockModule {}
