import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import api, {
  API_BASE_URL,
  apiUrl,
  deleteAPI,
  fetchAPI,
  getAccessToken,
  patchAPI,
  postAPI,
  setAccessToken,
} from "@/lib/api-client";
import { ApiError } from "@/lib/api-error";

interface MockResult {
  status: number;
  data: unknown;
}

let respondWith: (config: InternalAxiosRequestConfig) => MockResult;
let lastConfig: InternalAxiosRequestConfig | null = null;

beforeEach(() => {
  lastConfig = null;
  respondWith = () => ({ status: 200, data: { success: true, data: null } });

  api.defaults.adapter = async (config) => {
    lastConfig = config as InternalAxiosRequestConfig;
    const { status, data } = respondWith(config as InternalAxiosRequestConfig);
    const response = {
      data,
      status,
      statusText: "",
      headers: {},
      config,
    } as AxiosResponse;

    if (status >= 200 && status < 300) return response;

    throw new AxiosError(
      `Request failed with status code ${status}`,
      AxiosError.ERR_BAD_RESPONSE,
      config as InternalAxiosRequestConfig,
      null,
      response,
    );
  };
});

afterEach(() => {
  setAccessToken(null);
});

describe("API_BASE_URL / apiUrl", () => {
  it("瀏覽器環境走同源 /api/ 代理，避免 CORS", () => {
    expect(API_BASE_URL).toBe("/api/");
  });

  it("apiUrl 會正規化斜線", () => {
    expect(apiUrl("stock/daily-all")).toBe("/api/stock/daily-all");
    expect(apiUrl("/stock/daily-all")).toBe("/api/stock/daily-all");
  });
});

describe("token 注入", () => {
  it("setAccessToken 後請求自動帶 Authorization", async () => {
    setAccessToken("token-abc");
    respondWith = () => ({ status: 200, data: { success: true, data: [] } });

    await fetchAPI("watchlist");

    expect(getAccessToken()).toBe("token-abc");
    expect(lastConfig?.headers.Authorization).toBe("Bearer token-abc");
  });

  it("沒有 token 時不帶 Authorization", async () => {
    await fetchAPI("stock/daily-all");

    expect(lastConfig?.headers.Authorization).toBeUndefined();
  });
});

describe("回應解包", () => {
  it("fetchAPI 取出 data.data 並帶上 query params", async () => {
    respondWith = () => ({ status: 200, data: { success: true, data: [{ code: "2330" }] } });

    const result = await fetchAPI<{ code: string }[]>("stock/detail", { symbol: "2330" });

    expect(result).toEqual([{ code: "2330" }]);
    expect(lastConfig?.params).toEqual({ symbol: "2330" });
    expect(lastConfig?.method).toBe("get");
  });

  it("postAPI / patchAPI / deleteAPI 使用正確的 HTTP method", async () => {
    respondWith = () => ({ status: 200, data: { success: true, data: "ok" } });

    await postAPI("watchlist", { stockNo: "2330" });
    expect(lastConfig?.method).toBe("post");

    await patchAPI("watchlist/1/group", { groupName: "科技" });
    expect(lastConfig?.method).toBe("patch");

    await deleteAPI("watchlist/1");
    expect(lastConfig?.method).toBe("delete");
  });
});

describe("錯誤攔截器", () => {
  it("將 axios error 轉成 ApiError，並保留 status 與 path", async () => {
    respondWith = () => ({ status: 404, data: {} });

    const error = (await fetchAPI("stock/detail").catch((e) => e)) as ApiError;

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(404);
    expect(error.path).toBe("stock/detail");
    expect(error.isClientError).toBe(true);
  });

  it("後端有回傳 message 時優先採用", async () => {
    respondWith = () => ({ status: 409, data: { message: "此股票已在自選股中" } });

    const error = (await postAPI("watchlist", {}).catch((e) => e)) as ApiError;

    expect(error.message).toContain("此股票已在自選股中");
  });

  it("後端沒有 message 時退回中文狀態碼訊息", async () => {
    respondWith = () => ({ status: 503, data: {} });

    const error = (await fetchAPI("analysis/market").catch((e) => e)) as ApiError;

    expect(error.message).toContain("服務暫時無法使用");
    expect(error.isServerError).toBe(true);
  });
});
