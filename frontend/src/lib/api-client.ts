import axios, { type AxiosError } from "axios";
import { ApiError, httpStatusMessage } from "@/lib/api-error";

const RAW_BACKEND_URL = (
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_API_HOST ||
  ""
).replace(/\/+$/, "");

const INTERNAL_API_URL = /^https?:\/\//.test(RAW_BACKEND_URL)
  ? RAW_BACKEND_URL
  : "http://localhost:3004";

export const API_BASE_URL = typeof window === "undefined" ? `${INTERNAL_API_URL}/` : "/api/";

export function apiUrl(path: string): string {
  return `${API_BASE_URL.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

let cachedToken: string | null = null;

export function setAccessToken(token: string | null) {
  cachedToken = token;
}

export function getAccessToken(): string | null {
  return cachedToken;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000,
});

api.interceptors.request.use((config) => {
  if (cachedToken) {
    config.headers.Authorization = `Bearer ${cachedToken}`;
  }
  return config;
});

api.interceptors.response.use(undefined, (error: AxiosError<{ message?: string }>) => {
  if (axios.isCancel(error)) return Promise.reject(error);

  const status = error.response?.status ?? 0;
  const path = error.config?.url ?? "";
  const backendMessage = error.response?.data?.message;
  const message = backendMessage || httpStatusMessage(status);

  return Promise.reject(
    new ApiError(status, path ? `${message}（${path}）` : message, path, error.response?.data),
  );
});

export async function fetchAPI<T>(path: string, params?: Record<string, unknown>): Promise<T> {
  const { data } = await api.get<{ success: boolean; data: T }>(path, { params });
  return data.data;
}

export async function postAPI<T>(
  path: string,
  body?: unknown,
  params?: Record<string, unknown>,
): Promise<T> {
  const { data } = await api.post<{ success: boolean; data: T }>(path, body, { params });
  return data.data;
}

export async function patchAPI<T>(
  path: string,
  body?: unknown,
  params?: Record<string, unknown>,
): Promise<T> {
  const { data } = await api.patch<{ success: boolean; data: T }>(path, body, { params });
  return data.data;
}

export async function deleteAPI<T>(path: string, params?: Record<string, unknown>): Promise<T> {
  const { data } = await api.delete<{ success: boolean; data: T }>(path, { params });
  return data.data;
}

export default api;
