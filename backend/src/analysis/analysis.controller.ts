import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  ApiOperation,
  ApiTags,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { AnalysisService } from './analysis.service';
import { AnalyzeMarketDto, AnalysisResultDto } from './dto/analysis.dto';

@ApiTags('AI 股票分析')
@ApiBearerAuth('bearer')
@Controller('analysis')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @ApiOperation({ summary: '取得今日快取分析結果' })
  @ApiResponse({
    status: 200,
    description: '成功取得快取分析，若無快取則回傳 null',
    type: AnalysisResultDto,
  })
  @ApiResponse({ status: 401, description: '未認證' })
  @Get('market')
  getCached(): Promise<AnalysisResultDto | null> {
    return this.analysisService.getCachedAnalysis();
  }

  @ApiOperation({ summary: 'AI 分析台股市場並推薦關注標的' })
  @ApiResponse({
    status: 201,
    description: '成功分析並回傳結果',
    type: AnalysisResultDto,
  })
  @ApiResponse({ status: 400, description: '請求參數驗證失敗' })
  @ApiResponse({ status: 401, description: '未認證' })
  @Post('market')
  analyze(@Body() dto: AnalyzeMarketDto): Promise<AnalysisResultDto> {
    return this.analysisService.analyzeMarket(dto);
  }
}
