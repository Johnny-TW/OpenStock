import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class AnalyzeMarketDto {
  @ApiPropertyOptional({
    description: '指定分析的股票代號清單',
    example: ['2330', '2317'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  stockCodes?: string[];
}

export class StockSnapshotDto {
  @ApiProperty() code: string;
  @ApiProperty() name: string;
  @ApiProperty() closingPrice: string;
  @ApiProperty() change: string;
  @ApiProperty() tradeVolume: string;
  @ApiProperty() peRatio?: string;
  @ApiProperty() dividendYield?: string;
}

export class TopPickDto {
  @ApiProperty() code: string;
  @ApiProperty() name: string;
  @ApiProperty() reason: string;
}

export class AnalysisResultDto {
  @ApiProperty() marketOverview: string;
  @ApiProperty({ type: [TopPickDto] }) topPicks: TopPickDto[];
  @ApiProperty() risks: string;
  @ApiProperty() newsImpact: string;
  @ApiProperty() generatedAt: string;
}
