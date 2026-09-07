import { describe, expect, it } from "vitest";
import { ApiError, httpStatusMessage, isAbortError, resolveErrorMessage } from "@/lib/api-error";

describe("ApiError", () => {
  it("保留 status / path / body 並繼承 Error", () => {
    const error = new ApiError(404, "找不到資料", "stock/detail", { code: "NOT_FOUND" });

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("ApiError");
    expect(error.status).toBe(404);
    expect(error.message).toBe("找不到資料");
    expect(error.path).toBe("stock/detail");
    expect(error.body).toEqual({ code: "NOT_FOUND" });
  });

  it("path 與 body 可省略", () => {
    const error = new ApiError(500, "伺服器內部錯誤");

    expect(error.path).toBe("");
    expect(error.body).toBeUndefined();
  });

  it.each([
    [400, { client: true, server: false, unauthorized: false }],
    [401, { client: true, server: false, unauthorized: true }],
    [403, { client: true, server: false, unauthorized: true }],
    [404, { client: true, server: false, unauthorized: false }],
    [500, { client: false, server: true, unauthorized: false }],
    [503, { client: false, server: true, unauthorized: false }],
    [0, { client: false, server: false, unauthorized: false }],
  ])("status %i 的分類判斷正確", (status, expected) => {
    const error = new ApiError(status, "訊息");

    expect(error.isClientError).toBe(expected.client);
    expect(error.isServerError).toBe(expected.server);
    expect(error.isUnauthorized).toBe(expected.unauthorized);
  });
});

describe("httpStatusMessage", () => {
  it.each([
    [400, "請求格式錯誤"],
    [401, "登入已過期，請重新登入"],
    [403, "沒有存取權限"],
    [404, "找不到資料"],
    [429, "請求過於頻繁，請稍後再試"],
    [500, "伺服器內部錯誤"],
    [503, "服務暫時無法使用"],
  ])("已知 status %i 對應中文訊息", (status, message) => {
    expect(httpStatusMessage(status)).toBe(message);
  });

  it("未列舉的 5xx 走伺服器錯誤模板", () => {
    expect(httpStatusMessage(599)).toBe("伺服器錯誤（599）");
  });

  it("未列舉的 4xx 走請求錯誤模板", () => {
    expect(httpStatusMessage(418)).toBe("請求錯誤（418）");
  });

  it("status 0 視為無法連線", () => {
    expect(httpStatusMessage(0)).toBe("無法連線到伺服器，請確認網路狀態");
  });

  it("其他 status 走未預期模板", () => {
    expect(httpStatusMessage(302)).toBe("未預期的回應（302）");
  });
});

describe("isAbortError", () => {
  it("辨識 AbortError 與 axios 的 CanceledError", () => {
    const abort = new Error("aborted");
    abort.name = "AbortError";
    const canceled = new Error("canceled");
    canceled.name = "CanceledError";

    expect(isAbortError(abort)).toBe(true);
    expect(isAbortError(canceled)).toBe(true);
  });

  it("一般錯誤與 null 不算中斷", () => {
    expect(isAbortError(new Error("boom"))).toBe(false);
    expect(isAbortError(null)).toBe(false);
    expect(isAbortError(undefined)).toBe(false);
  });
});

describe("resolveErrorMessage", () => {
  it("優先取 ApiError 的訊息", () => {
    expect(resolveErrorMessage(new ApiError(404, "找不到資料"), "預設")).toBe("找不到資料");
  });

  it("一般 Error 取 message", () => {
    expect(resolveErrorMessage(new Error("網路斷線"), "預設")).toBe("網路斷線");
  });

  it("空訊息或非 Error 回傳 fallback", () => {
    expect(resolveErrorMessage(new Error(""), "預設")).toBe("預設");
    expect(resolveErrorMessage("字串錯誤", "預設")).toBe("預設");
    expect(resolveErrorMessage(undefined, "預設")).toBe("預設");
  });
});
