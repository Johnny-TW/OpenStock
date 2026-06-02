import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { EmbeddingModule } from '../embedding/embedding.module';
import { StockModule } from '../stock/stock.module';
import { AnalysisController } from './analysis.controller';
import { AnalysisService } from './analysis.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 60000,
      maxRedirects: 3,
    }),
    StockModule,
    EmbeddingModule,
  ],
  controllers: [AnalysisController],
  providers: [AnalysisService],
})
export class AnalysisModule {}
