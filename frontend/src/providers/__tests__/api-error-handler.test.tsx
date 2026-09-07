import { QueryClient, QueryClientProvider, useMutation, useQuery } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api-error";
import ApiErrorHandler from "@/providers/api-error-handler";

function createClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

function renderWithClient(ui: React.ReactNode, client = createClient()) {
  return {
    client,
    ...render(
      <QueryClientProvider client={client}>
        <ApiErrorHandler>{ui}</ApiErrorHandler>
      </QueryClientProvider>,
    ),
  };
}

function FailingQuery({ error }: { error: unknown }) {
  useQuery({
    queryKey: ["test"],
    queryFn: () => Promise.reject(error),
  });
  return <div>頁面內容</div>;
}

function FailingMutation({ error }: { error: unknown }) {
  const mutation = useMutation({ mutationFn: () => Promise.reject(error) });
  return (
    <button type="button" onClick={() => mutation.mutate()}>
      送出
    </button>
  );
}

describe("ApiErrorHandler", () => {
  it("正常情況只渲染 children", () => {
    renderWithClient(<div>頁面內容</div>);

    expect(screen.getByText("頁面內容")).toBeInTheDocument();
    expect(screen.queryByText("伺服器暫時無法回應")).not.toBeInTheDocument();
  });

  it("query 發生 5xx 時顯示集中錯誤畫面並帶出狀態碼", async () => {
    renderWithClient(<FailingQuery error={new ApiError(503, "服務暫時無法使用")} />);

    expect(await screen.findByText("伺服器暫時無法回應")).toBeInTheDocument();
    expect(screen.getByText("服務暫時無法使用")).toBeInTheDocument();
    expect(screen.getByText("錯誤代碼：503")).toBeInTheDocument();
  });

  it("mutation 發生 5xx 時同樣觸發集中錯誤畫面", async () => {
    renderWithClient(<FailingMutation error={new ApiError(500, "伺服器內部錯誤")} />);

    await userEvent.click(screen.getByRole("button", { name: "送出" }));

    expect(await screen.findByText("伺服器暫時無法回應")).toBeInTheDocument();
  });

  it("4xx 與一般錯誤不觸發集中錯誤畫面", async () => {
    renderWithClient(<FailingQuery error={new ApiError(404, "找不到資料")} />);

    await waitFor(() => expect(screen.getByText("頁面內容")).toBeInTheDocument());
    expect(screen.queryByText("伺服器暫時無法回應")).not.toBeInTheDocument();
  });

  it("錯誤畫面出現時 children 仍保留在畫面上", async () => {
    renderWithClient(<FailingQuery error={new ApiError(500, "伺服器內部錯誤")} />);

    expect(await screen.findByText("伺服器暫時無法回應")).toBeInTheDocument();
    expect(screen.getByText("頁面內容")).toBeInTheDocument();
  });

  it("點「重新載入資料」會關閉錯誤畫面並重新抓取 active queries", async () => {
    const client = createClient();
    const refetchSpy = vi.spyOn(client, "refetchQueries").mockResolvedValue(undefined);
    renderWithClient(<FailingQuery error={new ApiError(500, "伺服器內部錯誤")} />, client);

    await userEvent.click(await screen.findByRole("button", { name: "重新載入資料" }));

    expect(refetchSpy).toHaveBeenCalledWith({ type: "active" });
    await waitFor(() => expect(screen.queryByText("伺服器暫時無法回應")).not.toBeInTheDocument());
  });

  it("點「繼續瀏覽」可關閉錯誤畫面", async () => {
    renderWithClient(<FailingQuery error={new ApiError(500, "伺服器內部錯誤")} />);

    await userEvent.click(await screen.findByRole("button", { name: "繼續瀏覽" }));

    await waitFor(() => expect(screen.queryByText("伺服器暫時無法回應")).not.toBeInTheDocument());
  });
});
