"use client"
import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { useSession, signOut, signIn } from "next-auth/react"
import { usePathname } from "next/navigation"

interface ExtendedSession {
  accessToken?: string
  error?: string
  user?: Record<string, unknown>
}

//  AuthSync - 同步 NextAuth session 到 Redux store
//  這個組件只負責同步認證狀態,不包含 UI

const AuthSync = () => {
  const dispatch = useDispatch()
  // 使用 useSession 取得 NextAuth session 和認證狀態
  const { data: session, status } = useSession()
  const pathname = usePathname()
  // TypeScript 強制類型轉換,因為 NextAuth 的 session 可能包含自定義欄位
  const extSession = session as ExtendedSession | null

  useEffect(() => {
    // 載入中,不處理
    if (status === "loading" || pathname === "/forbidden") return

    // 未認證,不處理(middleware 會處理重定向)
    if (status === "unauthenticated" || !extSession?.accessToken) {
      signIn("azure-ad")
      return
    }

    // 同步 session 到 Redux
    dispatch({
      type: "AUTH_RESULT",
      data: { session: extSession },
    })

    // 處理登入錯誤
    if (extSession?.error) {
      dispatch({
        type: "SET_API_ERROR",
        data: {
          message: extSession.error,
          action: () => {
            signOut()
            dispatch({ type: "LOGOUT" })
          },
        },
      })
    }
  }, [session, status, dispatch, pathname, extSession])

  return null
}

export default AuthSync
