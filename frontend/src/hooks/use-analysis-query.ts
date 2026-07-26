import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { fetchAPI, getAccessToken, postAPI } from "@/lib/api-client";

export function useCachedAnalysis() {
  return useQuery({
    queryKey: ["analysis", "market"],
    queryFn: () => fetchAPI<unknown>("analysis/market"),
    staleTime: 10 * 60 * 1000,
  });
}

export function useAnalyzeMarket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { stockCodes?: string[] }) => postAPI<unknown>("analysis/market", data),
    onSuccess: (data) => {
      queryClient.setQueryData(["analysis", "market"], data);
      toast.success("AI 分析完成");
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "AI 分析失敗";
      toast.error(msg);
    },
  });
}

interface StreamState {
  isStreaming: boolean;
  statusText: string;
  result: unknown | null;
  error: string | null;
}

export function useAnalyzeMarketStream() {
  const queryClient = useQueryClient();
  const [state, setState] = useState<StreamState>({
    isStreaming: false,
    statusText: "",
    result: null,
    error: null,
  });
  const abortRef = useRef<AbortController | null>(null);

  const analyze = useCallback(
    async (data: { stockCodes?: string[] }) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setState({ isStreaming: true, statusText: "連線中...", result: null, error: null });

      try {
        const baseURL = (process.env.NEXT_PUBLIC_API_HOST || "").replace(/\/$/, "");
        const token = getAccessToken();
        const useToolsMode = !data.stockCodes || data.stockCodes.length === 0;
        const url = useToolsMode
          ? `${baseURL}/analysis/market/tools/stream`
          : `${baseURL}/analysis/market/stream`;
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: useToolsMode ? "{}" : JSON.stringify(data),
          signal: controller.signal,
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const reader = res.body?.getReader();
        if (!reader) throw new Error("無法讀取串流");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const payload = line.slice(6).trim();
            if (payload === "[DONE]") break;

            try {
              const parsed = JSON.parse(payload);
              if (parsed.error) {
                setState((s) => ({ ...s, isStreaming: false, error: parsed.error }));
                toast.error(parsed.error);
                return;
              }
              if (parsed.text) {
                setState((s) => ({ ...s, statusText: parsed.text }));
              }
              if (parsed.result) {
                setState((s) => ({ ...s, result: parsed.result }));
                queryClient.setQueryData(["analysis", "market"], parsed.result);
              }
            } catch (err) {
              console.warn("SSE 片段解析失敗，已略過", payload, err);
            }
          }
        }

        setState((s) => ({ ...s, isStreaming: false, statusText: "" }));
        toast.success("AI 分析完成");
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        const msg = err instanceof Error ? err.message : "AI 分析失敗";
        setState((s) => ({ ...s, isStreaming: false, error: msg }));
        toast.error(msg);
      }
    },
    [queryClient],
  );

  const abort = useCallback(() => {
    abortRef.current?.abort();
    setState((s) => ({ ...s, isStreaming: false, statusText: "" }));
  }, []);

  return { ...state, analyze, abort };
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function useStockChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const messagesRef = useRef<ChatMessage[]>([]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const sendMessage = useCallback(async (stockCode: string, message: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const userMsg: ChatMessage = { role: "user", content: message };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const baseURL = (process.env.NEXT_PUBLIC_API_HOST || "").replace(/\/$/, "");
      const token = getAccessToken();
      const history = messagesRef.current.slice(-10);

      const res = await fetch(`${baseURL}/analysis/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ stockCode, message, history }),
        signal: controller.signal,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const reader = res.body?.getReader();
      if (!reader) throw new Error("無法讀取串流");

      const decoder = new TextDecoder();
      let buffer = "";
      let assistantText = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (payload === "[DONE]") break;

          try {
            const parsed = JSON.parse(payload);
            if (parsed.error) {
              toast.error(parsed.error);
              break;
            }
            if (parsed.text) {
              assistantText += parsed.text;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: "assistant", content: assistantText };
                return updated;
              });
            }
          } catch (err) {
            console.warn("SSE 片段解析失敗，已略過", payload, err);
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      toast.error("AI 對話失敗");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearMessages = useCallback(() => setMessages([]), []);

  return { messages, isLoading, sendMessage, clearMessages };
}
