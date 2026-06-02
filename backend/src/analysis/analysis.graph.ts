import type Anthropic from '@anthropic-ai/sdk';
import {
  Annotation,
  BaseCheckpointSaver,
  END,
  MemorySaver,
  START,
  StateGraph,
} from '@langchain/langgraph';
import type { AnalysisResultDto, StockSnapshotDto } from './dto/analysis.dto';

// Message 格式（與 Anthropic SDK 對齊）
type AntMessage = { role: 'user' | 'assistant'; content: unknown };

// Graph State
const AnalysisAnnotation = Annotation.Root({
  // 對話紀錄：每次 node 回傳的 messages 都「追加」到尾端
  messages: Annotation<AntMessage[]>({
    reducer: (prev, next) => [...prev, ...next],
    default: () => [],
  }),

  // 技術指標快取：用 spread 合併，讓新結果覆蓋舊值（同 stock code 時）
  technicalsCache: Annotation<Record<string, unknown>>({
    reducer: (prev, next) => ({ ...prev, ...next }),
    default: () => ({}),
  }),

  // 股票行情快取：同上
  stockDataCache: Annotation<Record<string, StockSnapshotDto>>({
    reducer: (prev, next) => ({ ...prev, ...next }),
    default: () => ({}),
  }),

  // 模型呼叫次數：每次 callModel 節點 +1，用來防止無限迴圈
  iteration: Annotation<number>({
    reducer: (prev, next) => prev + next,
    default: () => 0,
  }),

  // 進度文字：每次由最新 node 覆寫
  progressText: Annotation<string | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),

  // 最終分析結果：parseResult 節點寫入
  finalResult: Annotation<AnalysisResultDto | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),
});

export type AnalysisGraphState = typeof AnalysisAnnotation.State;

// Context（從 AnalysisService 注入）
export interface AnalysisGraphContext {
  anthropic: Anthropic;
  systemPrompt: string;
  userMessage: string;
  analysisTools: unknown[];
  checkpointer?: BaseCheckpointSaver;
  runTool: (
    toolName: string,
    input: Record<string, string>,
    stockDataCache: Map<string, StockSnapshotDto>,
    technicalsCache: Map<string, unknown>,
  ) => Promise<unknown>;
  buildResult: (parsed: unknown, technicalsCache: Map<string, unknown>) => AnalysisResultDto;
  extractJson: (rawText: string) => string;
}

// Graph Factory
export function createAnalysisGraph(ctx: AnalysisGraphContext) {
  const MAX_ITERATIONS = 15;
  const BATCH_SIZE = 5;

  // callModel
  async function callModel(state: AnalysisGraphState) {
    const response = await ctx.anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 16384,
      system: [
        {
          type: 'text',
          text: ctx.systemPrompt,
          cache_control: { type: 'ephemeral' },
        },
      ],
      tools: ctx.analysisTools as Parameters<typeof ctx.anthropic.messages.create>[0]['tools'],
      messages: state.messages as Parameters<typeof ctx.anthropic.messages.create>[0]['messages'],
    });

    return {
      messages: [{ role: 'assistant' as const, content: response.content }],
      iteration: 1,
      progressText: null,
    };
  }

  // executeTools
  async function executeTools(state: AnalysisGraphState) {
    const lastMsg = state.messages[state.messages.length - 1];
    const toolUseBlocks = (lastMsg.content as unknown[]).filter(
      (b) => (b as { type: string }).type === 'tool_use',
    ) as {
      type: 'tool_use';
      id: string;
      name: string;
      input: Record<string, string>;
    }[];

    const technicalsCache = new Map<string, unknown>(Object.entries(state.technicalsCache));
    const stockDataCache = new Map<string, StockSnapshotDto>(Object.entries(state.stockDataCache));

    const toolResults: { type: 'tool_result'; tool_use_id: string; content: string }[] = [];

    for (let i = 0; i < toolUseBlocks.length; i += BATCH_SIZE) {
      if (i > 0) await new Promise((r) => setTimeout(r, 300));
      const batch = toolUseBlocks.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map(async (block) => {
          const result = await ctx.runTool(
            block.name,
            block.input,
            stockDataCache,
            technicalsCache,
          );
          return {
            type: 'tool_result' as const,
            tool_use_id: block.id,
            content: JSON.stringify(result),
          };
        }),
      );
      toolResults.push(...batchResults);
    }

    return {
      messages: [{ role: 'user' as const, content: toolResults }],
      technicalsCache: Object.fromEntries(technicalsCache),
      stockDataCache: Object.fromEntries(stockDataCache),
      progressText: `AI 正在查詢市場資料（${toolUseBlocks.length} 項）...`,
    };
  }

  // parseResult
  function parseResult(state: AnalysisGraphState) {
    const lastMsg = state.messages[state.messages.length - 1];
    const textBlock = (lastMsg.content as unknown[]).find(
      (b) => (b as { type: string }).type === 'text',
    );
    const rawText =
      textBlock && 'text' in (textBlock as object)
        ? (textBlock as { type: string; text: string }).text
        : '{}';

    const parsed = JSON.parse(ctx.extractJson(rawText)) as unknown;
    const technicalsCache = new Map<string, unknown>(Object.entries(state.technicalsCache));

    return { finalResult: ctx.buildResult(parsed, technicalsCache) };
  }

  // Conditional Edge
  function shouldContinue(state: AnalysisGraphState): 'executeTools' | 'parseResult' | typeof END {
    if (state.iteration >= MAX_ITERATIONS) return END;

    const lastMsg = state.messages[state.messages.length - 1];
    const hasToolUse =
      Array.isArray(lastMsg.content) &&
      (lastMsg.content as unknown[]).some((b) => (b as { type: string }).type === 'tool_use');

    return hasToolUse ? 'executeTools' : 'parseResult';
  }

  return new StateGraph(AnalysisAnnotation)
    .addNode('callModel', callModel)
    .addNode('executeTools', executeTools)
    .addNode('parseResult', parseResult)
    .addEdge(START, 'callModel')
    .addConditionalEdges('callModel', shouldContinue)
    .addEdge('executeTools', 'callModel')
    .addEdge('parseResult', END)
    .compile({ checkpointer: ctx.checkpointer });
}

export { MemorySaver };
