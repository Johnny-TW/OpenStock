"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global-error]", error);
  }, [error]);

  return (
    <html lang="zh-TW">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          textAlign: "center",
          padding: "24px",
          fontFamily: "system-ui, -apple-system, 'Noto Sans TC', sans-serif",
          background: "#0b0f19",
          color: "#e5e7eb",
        }}
      >
        <span style={{ fontSize: "56px" }}>💥</span>
        <h1 style={{ fontSize: "24px", fontWeight: 600, margin: 0 }}>應用程式發生嚴重錯誤</h1>
        <p style={{ fontSize: "14px", maxWidth: "480px", color: "#9ca3af", margin: 0 }}>
          {error.message || "請重新整理頁面，若問題持續發生請聯絡系統管理員。"}
        </p>
        {error.digest && (
          <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>
            錯誤識別碼：{error.digest}
          </p>
        )}
        <button
          type="button"
          onClick={reset}
          style={{
            padding: "8px 20px",
            fontSize: "14px",
            fontWeight: 600,
            color: "#0b0f19",
            background: "#e5e7eb",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          重新載入
        </button>
      </body>
    </html>
  );
}
