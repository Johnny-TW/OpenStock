export class ApiError extends Error {
  readonly status: number;
  readonly path: string;
  readonly body: unknown;

  constructor(status: number, message: string, path = "", body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.path = path;
    this.body = body;
  }

  get isServerError() {
    return this.status >= 500;
  }

  get isClientError() {
    return this.status >= 400 && this.status < 500;
  }

  get isUnauthorized() {
    return this.status === 401 || this.status === 403;
  }
}

const STATUS_MESSAGE: Record<number, string> = {
  400: "請求格式錯誤",
  401: "登入已過期，請重新登入",
  403: "沒有存取權限",
  404: "找不到資料",
  408: "請求逾時",
  409: "資料已存在或發生衝突",
  422: "資料驗證失敗",
  429: "請求過於頻繁，請稍後再試",
  500: "伺服器內部錯誤",
  502: "後端服務無回應",
  503: "服務暫時無法使用",
  504: "伺服器回應逾時",
};

export function httpStatusMessage(status: number): string {
  const known = STATUS_MESSAGE[status];
  if (known) return known;
  if (status >= 500) return `伺服器錯誤（${status}）`;
  if (status >= 400) return `請求錯誤（${status}）`;
  if (status === 0) return "無法連線到伺服器，請確認網路狀態";
  return `未預期的回應（${status}）`;
}

export function isAbortError(error: unknown): boolean {
  const name = (error as Error | null)?.name;
  return name === "AbortError" || name === "CanceledError";
}

export function resolveErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
