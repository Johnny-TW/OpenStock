"use client";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

interface ExtendedSession {
  accessToken?: string;
  error?: string;
  user?: Record<string, unknown>;
}

//  AuthSync - 同步 NextAuth session 到 Redux store
//  這個組件只負責同步認證狀態,不包含 UI

const AuthSync = () => {
  const dispatch = useDispatch();
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const extSession = session as ExtendedSession | null;

  useEffect(() => {
    // 載入中,不處理
    if (status === "loading" || pathname === "/forbidden") return;

    const isPublic = pathname.startsWith("/login") || pathname.startsWith("/auth");

    // 未認證：公開頁面不處理，其他頁面導向 /login 讓使用者選擇登入方式
    if (status === "unauthenticated" || !extSession?.accessToken) {
      if (!isPublic) {
        router.push("/login");
      }
      return;
    }

    // 同步 session 到 Redux
    dispatch({
      type: "AUTH_RESULT",
      data: { session: extSession },
    });

    // 處理登入錯誤
    if (extSession?.error) {
      dispatch({
        type: "SET_API_ERROR",
        data: {
          message: extSession.error,
          action: () => {
            signOut();
            dispatch({ type: "LOGOUT" });
          },
        },
      });
    }
  }, [status, dispatch, pathname, extSession, router.push]);

  return null;
};

export default AuthSync;
