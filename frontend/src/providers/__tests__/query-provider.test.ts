import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/api-error";
import { createQueryClient, shouldRetry, shouldSilence } from "@/providers/query-provider";

function abortError() {
  const error = new Error("aborted");
  error.name = "AbortError";
  return error;
}

describe("shouldSilence", () => {
  it("中斷請求不跳 toast", () => {
    expect(shouldSilence(abortError())).toBe(true);
  });

  it("5xx 交給 ApiErrorHandler 集中處理，不重複跳 toast", () => {
    expect(shouldSilence(new ApiError(500, "伺服器內部錯誤"))).toBe(true);
  });

  it("4xx 與一般錯誤仍會跳 toast", () => {
    expect(shouldSilence(new ApiError(404, "找不到資料"))).toBe(false);
    expect(shouldSilence(new Error("網路斷線"))).toBe(false);
  });
});

describe("shouldRetry", () => {
  it("4xx 不重試，避免無意義的重複請求", () => {
    expect(shouldRetry(0, new ApiError(400, "請求格式錯誤"))).toBe(false);
    expect(shouldRetry(0, new ApiError(401, "登入已過期，請重新登入"))).toBe(false);
    expect(shouldRetry(0, new ApiError(404, "找不到資料"))).toBe(false);
  });

  it("中斷請求不重試", () => {
    expect(shouldRetry(0, abortError())).toBe(false);
  });

  it("5xx 與未知錯誤最多再試一次", () => {
    expect(shouldRetry(0, new ApiError(500, "伺服器內部錯誤"))).toBe(true);
    expect(shouldRetry(1, new ApiError(500, "伺服器內部錯誤"))).toBe(false);
    expect(shouldRetry(0, new Error("網路斷線"))).toBe(true);
    expect(shouldRetry(1, new Error("網路斷線"))).toBe(false);
  });
});

describe("createQueryClient", () => {
  it("套用全域預設值：staleTime、關閉 focus refetch、mutation 不重試", () => {
    const options = createQueryClient().getDefaultOptions();

    expect(options.queries?.staleTime).toBe(60 * 1000);
    expect(options.queries?.refetchOnWindowFocus).toBe(false);
    expect(options.queries?.retry).toBe(shouldRetry);
    expect(options.mutations?.retry).toBe(false);
  });

  it("queryCache 與 mutationCache 都掛上全域 onError", () => {
    const client = createQueryClient();

    expect(client.getQueryCache().config.onError).toBeTypeOf("function");
    expect(client.getMutationCache().config.onError).toBeTypeOf("function");
  });
});
