import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AnalysisService } from './analysis.service';
import { AnalyzeMarketDto, AnalysisResultDto } from './dto/analysis.dto';

@ApiTags('AI 股票分析')
@Controller('analysis')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @ApiOperation({ summary: 'AI 分析台股市場並推薦關注標的' })
  @Post('market')
  analyze(@Body() dto: AnalyzeMarketDto): Promise<AnalysisResultDto> {
    return this.analysisService.analyzeMarket(dto);
  }
}
