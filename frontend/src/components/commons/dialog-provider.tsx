"use client"

import { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/commons/alert-dialog"
import { Loading } from "@/components/commons/loading"

interface ApiState {
  loading: number
  error: { message?: string; statusCode?: number; action?: () => void } | null
  success: { message?: string; action?: () => void } | null
  deleted: { message?: string; action?: () => void } | null
}

export default function DialogProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch()
  const { loading, error, success, deleted } = useSelector(
    (state: any) => (state.api ?? {}) as ApiState,
  )

  // Success: 自動 2 秒後關閉
  useEffect(() => {
    if (!success) return
    const timer = setTimeout(() => {
      success?.action?.()
      dispatch({ type: "CLEAR_API_SUCCESS" })
    }, 2000)
    return () => clearTimeout(timer)
  }, [success, dispatch])

  // Error: 自動 5 秒後關閉
  useEffect(() => {
    if (!error) return
    const timer = setTimeout(() => {
      error?.action?.()
      dispatch({ type: "CLEAR_API_ERROR" })
    }, 5000)
    return () => clearTimeout(timer)
  }, [error, dispatch])

  return (
    <>
      {children}

      {/* Success Dialog */}
      <AlertDialog open={!!success}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-green-600">Success</AlertDialogTitle>
            <AlertDialogDescription>
              {success?.message ?? "操作成功"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                success?.action?.()
                dispatch({ type: "CLEAR_API_SUCCESS" })
              }}
            >
              確認
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Error Dialog */}
      <AlertDialog open={!!error}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              {error?.statusCode ? `${error.statusCode} ` : ""}Error
            </AlertDialogTitle>
            <AlertDialogDescription>
              {error?.message ?? "發生錯誤，請再試一次"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                error?.action?.()
                dispatch({ type: "CLEAR_API_ERROR" })
              }}
            >
              關閉
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirm Dialog */}
      <AlertDialog open={!!deleted}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確認刪除</AlertDialogTitle>
            <AlertDialogDescription>
              {deleted?.message ?? "確定要刪除嗎？此操作無法復原。"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => dispatch({ type: "CLEAR_API_DELETE" })}
            >
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => {
                deleted?.action?.()
                dispatch({ type: "CLEAR_API_DELETE" })
              }}
            >
              確認刪除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
