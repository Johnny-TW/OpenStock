"use client";

import { Bot, Loader2, Send, Trash2, X } from "lucide-react";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { type ChatMessage, useStockChat } from "@/api/use-analysis-query";
import { Button } from "@/components/commons/button";
import styles from "./stock-chat.module.scss";

const MessageBubble = memo(function MessageBubble({ msg }: { msg: ChatMessage }) {
  return (
    <div
      className={`${styles.message} ${msg.role === "user" ? styles.userMsg : styles.assistantMsg}`}
    >
      <div className={styles.msgContent}>{msg.content}</div>
    </div>
  );
});

interface StockChatProps {
  stockCode: string;
  stockName: string;
}

const QUICK_QUESTIONS = [
  "這檔股票目前適合買嗎？",
  "幫我分析技術面",
  "有什麼風險需要注意？",
  "適合長期持有嗎？",
];

export function StockChat({ stockCode, stockName }: StockChatProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const { messages, isLoading, sendMessage, clearMessages } = useStockChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: messages.length 作為觸發捲動的依賴
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      const text = input.trim();
      if (!text || isLoading) return;
      setInput("");
      sendMessage(stockCode, text);
    },
    [input, isLoading, stockCode, sendMessage],
  );

  const handleQuickQuestion = useCallback(
    (q: string) => {
      if (isLoading) return;
      sendMessage(stockCode, q);
    },
    [isLoading, stockCode, sendMessage],
  );

  if (!open) {
    return (
      <button type="button" className={styles.fab} onClick={() => setOpen(true)}>
        <Bot className="size-5" />
        <span>問 AI</span>
      </button>
    );
  }

  return (
    <div className={styles.chatPanel}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <Bot className="size-4" />
          <span>AI 助手 · {stockName}</span>
        </div>
        <div className={styles.headerActions}>
          <button type="button" onClick={clearMessages} title="清除對話">
            <Trash2 className="size-3.5" />
          </button>
          <button type="button" onClick={() => setOpen(false)} title="關閉">
            <X className="size-4" />
          </button>
        </div>
      </div>

      <div className={styles.messages}>
        {messages.length === 0 && (
          <div className={styles.empty}>
            <p>
              有什麼關於 {stockName}（{stockCode}）的問題嗎？
            </p>
            <div className={styles.quickQuestions}>
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  className={styles.quickBtn}
                  onClick={() => handleQuickQuestion(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble key={`${msg.role}-${i}`} msg={msg} />
        ))}

        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className={`${styles.message} ${styles.assistantMsg}`}>
            <Loader2 className="size-4 animate-spin" />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form className={styles.inputArea} onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          placeholder={`問問關於 ${stockName} 的問題...`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
          className={styles.input}
        />
        <Button
          type="submit"
          size="sm"
          disabled={!input.trim() || isLoading}
          className={styles.sendBtn}
        >
          <Send className="size-3.5" />
        </Button>
      </form>
    </div>
  );
}
