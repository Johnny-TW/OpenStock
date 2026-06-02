import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private openai: OpenAI | null = null;

  private client(): OpenAI {
    if (!this.openai) {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) throw new Error('OPENAI_API_KEY 未設定，請在 backend/.env 加入');
      this.openai = new OpenAI({ apiKey });
    }
    return this.openai;
  }

  async embed(text: string): Promise<number[]> {
    const res = await this.client().embeddings.create({
      model: 'text-embedding-3-small',
      input: text.slice(0, 8000),
    });
    return res.data[0].embedding;
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) return [];
    try {
      const res = await this.client().embeddings.create({
        model: 'text-embedding-3-small',
        input: texts.map((t) => t.slice(0, 8000)),
      });
      return res.data.map((d) => d.embedding);
    } catch (_err) {
      this.logger.warn('Batch embedding 失敗，改用逐筆模式');
      return Promise.all(texts.map((t) => this.embed(t)));
    }
  }
}
