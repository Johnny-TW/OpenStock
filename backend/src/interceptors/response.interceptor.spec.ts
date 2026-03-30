import {
  LoggingInterceptor,
  ResponseInterceptor,
} from './response.interceptor';
import { ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { of } from 'rxjs';

function createMockContext(method = 'GET', url = '/test'): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ method, url }),
    }),
  } as unknown as ExecutionContext;
}

function createMockHandler(data: unknown): CallHandler {
  return { handle: () => of(data) };
}

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;

  beforeEach(() => {
    interceptor = new LoggingInterceptor();
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
  });

  it('應記錄請求方法、路徑及耗時', (done) => {
    const ctx = createMockContext('POST', '/api/watchlist');
    const handler = createMockHandler({ id: 1 });
    const logSpy = jest.spyOn(Logger.prototype, 'log');

    interceptor.intercept(ctx, handler).subscribe({
      next: () => {
        expect(logSpy).toHaveBeenCalledWith(
          expect.stringContaining('POST /api/watchlist'),
        );
      },
      complete: done,
    });
  });

  it('應正常回傳原始資料', (done) => {
    const ctx = createMockContext();
    const handler = createMockHandler({ ok: true });

    interceptor.intercept(ctx, handler).subscribe({
      next: (val) => {
        expect(val).toEqual({ ok: true });
      },
      complete: done,
    });
  });
});

describe('ResponseInterceptor', () => {
  let interceptor: ResponseInterceptor;

  beforeEach(() => {
    interceptor = new ResponseInterceptor();
  });

  it('應包裝回應為統一格式', (done) => {
    const ctx = createMockContext();
    const handler = createMockHandler({ id: 1, name: 'test' });

    interceptor.intercept(ctx, handler).subscribe({
      next: (val) => {
        const result = val as {
          success: boolean;
          data: unknown;
          timestamp: string;
        };
        expect(result).toEqual(
          expect.objectContaining({
            success: true,
            data: { id: 1, name: 'test' },
          }),
        );
        expect(result.timestamp).toBeDefined();
      },
      complete: done,
    });
  });

  it('應處理 null 資料', (done) => {
    const ctx = createMockContext();
    const handler = createMockHandler(null);

    interceptor.intercept(ctx, handler).subscribe({
      next: (val) => {
        const result = val as { success: boolean; data: unknown };
        expect(result.success).toBe(true);
        expect(result.data).toBeNull();
      },
      complete: done,
    });
  });

  it('應處理陣列資料', (done) => {
    const ctx = createMockContext();
    const handler = createMockHandler([1, 2, 3]);

    interceptor.intercept(ctx, handler).subscribe({
      next: (val) => {
        const result = val as { success: boolean; data: unknown };
        expect(result.success).toBe(true);
        expect(result.data).toEqual([1, 2, 3]);
      },
      complete: done,
    });
  });
});
