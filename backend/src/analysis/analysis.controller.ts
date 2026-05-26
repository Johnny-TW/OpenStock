import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { AnalysisService } from './analysis.service';
import { AnalysisResultDto, AnalyzeMarketDto, ChatMessageDto } from './dto/analysis.dto';

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

  @ApiOperation({ summary: 'AI 分析台股市場並推薦關注標的（SSE 串流）' })
  @ApiResponse({ status: 200, description: 'SSE 串流回應' })
  @ApiResponse({ status: 400, description: '請求參數驗證失敗' })
  @ApiResponse({ status: 401, description: '未認證' })
  @Post('market/stream')
  async analyzeStream(@Body() dto: AnalyzeMarketDto, @Res() res: Response): Promise<void> {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    try {
      for await (const chunk of this.analysisService.analyzeMarketStream(dto)) {
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      }
      res.write('data: [DONE]\n\n');
    } catch (err) {
      res.write(
        `data: ${JSON.stringify({ error: err instanceof Error ? err.message : 'AI 分析失敗' })}\n\n`,
      );
    } finally {
      res.end();
    }
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

  @ApiOperation({ summary: '個股 AI 對話（SSE 串流）' })
  @ApiResponse({ status: 200, description: 'SSE 串流回應' })
  @Post('chat')
  async chat(@Body() dto: ChatMessageDto, @Res() res: Response): Promise<void> {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    try {
      for await (const chunk of this.analysisService.chatStream(dto)) {
        res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
      }
      res.write('data: [DONE]\n\n');
    } catch (err) {
      res.write(
        `data: ${JSON.stringify({ error: err instanceof Error ? err.message : 'AI 對話失敗' })}\n\n`,
      );
    } finally {
      res.end();
    }
  }
}
