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

export class TechnicalIndicatorsDto {
  @ApiProperty() ma5: number;
  @ApiProperty() ma10: number;
  @ApiProperty() ma20: number;
  @ApiProperty() ma60: number;
  @ApiProperty() rsi14: number;
  @ApiProperty() kValue: number;
  @ApiProperty() dValue: number;
  @ApiProperty() macdLine: number;
  @ApiProperty() signalLine: number;
  @ApiProperty() macdHistogram: number;
  @ApiProperty() bollingerUpper: number;
  @ApiProperty() bollingerMiddle: number;
  @ApiProperty() bollingerLower: number;
  @ApiProperty() volumeRatio: number;
  @ApiProperty() high20: number;
  @ApiProperty() low20: number;
  @ApiProperty() trend: string;
  @ApiProperty() recentCloses: number[];
}

export class ScoresDto {
  @ApiProperty({ description: '基本面分數 0-100' }) fundamental: number;
  @ApiProperty({ description: '技術面分數 0-100' }) technical: number;
  @ApiProperty({ description: '籌碼面分數 0-100' }) chip: number;
  @ApiProperty({ description: '新聞面分數 0-100' }) news: number;
  @ApiProperty({ description: '戰略面分數 0-100' }) strategic: number;
  @ApiProperty({ description: '綜合評分 0-100' }) total: number;
}

export class AnalysisFactorDto {
  @ApiProperty({ description: '分類：題材 / 基本 / 技術 / 籌碼 / 新聞' })
  category: string;
  @ApiProperty({ description: '因素描述' }) description: string;
  @ApiProperty({ description: '重要程度：重要 / 一般' }) importance: string;
}

export class TopPickDto {
  @ApiProperty({ description: '股票代號' }) code: string;
  @ApiProperty({ description: '股票名稱' }) name: string;
  @ApiProperty({ description: '推薦理由' }) reason: string;
  @ApiProperty({ description: '建議進場價' }) entryPrice: string;
  @ApiProperty({ description: '建議停損價' }) stopLoss: string;
  @ApiProperty({ description: '目標價位' }) targetPrice: string;
  @ApiProperty({
    description: '方向：偏多 / 中性 / 偏空',
  })
  direction: string;
  @ApiProperty({
    description: '訊號強度：強烈買進 / 買進 / 觀望 / 賣出 / 強烈賣出',
  })
  signal: string;
  @ApiProperty({ description: '時間框架：短線 / 波段 / 長期' })
  timeframe: string;
  @ApiProperty({ description: '技術面摘要' }) technicalSummary: string;
  @ApiProperty({ description: '多維度評分', type: ScoresDto })
  scores: ScoresDto;
  @ApiProperty({
    description: '看多因素',
    type: [AnalysisFactorDto],
  })
  bullishFactors: AnalysisFactorDto[];
  @ApiProperty({
    description: '看空因素',
    type: [AnalysisFactorDto],
  })
  bearishFactors: AnalysisFactorDto[];
  @ApiPropertyOptional({
    description: '技術指標原始數據',
    type: TechnicalIndicatorsDto,
  })
  indicators?: TechnicalIndicatorsDto;
}

export class AnalysisResultDto {
  @ApiProperty() marketOverview: string;
  @ApiProperty({ type: [TopPickDto] }) topPicks: TopPickDto[];
  @ApiProperty() risks: string;
  @ApiProperty() newsImpact: string;
  @ApiProperty() technicalOutlook: string;
  @ApiProperty() generatedAt: string;
}
