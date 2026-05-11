import axios from "axios";

let cachedToken: string | null = null;

export function setAccessToken(token: string | null) {
  cachedToken = token;
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_HOST,
  timeout: 300000,
});

api.interceptors.request.use((config) => {
  if (cachedToken) {
    config.headers.Authorization = `Bearer ${cachedToken}`;
  }
  return config;
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
