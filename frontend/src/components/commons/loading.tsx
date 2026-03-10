"use client"

import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingProps {
  /** 是否全螢幕覆蓋（預設 true），false 則只覆蓋父容器 */
  full?: boolean
  /** 顯示文字 */
  text?: string
  className?: string
}

export function Loading({ full = true, text = "Loading...", className }: LoadingProps) {
  return (
    <div
      className={cn(
        "z-50 flex flex-col items-center justify-center bg-black/50",
        full ? "fixed inset-0" : "absolute inset-0",
        className,
      )}
    >
      <Loader2 className="h-8 w-8 animate-spin text-white" />
      {text && <p className="mt-2 text-sm text-white">{text}</p>}
    </div>
  )
}
