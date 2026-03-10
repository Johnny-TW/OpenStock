/**
 * Login handler placeholder
 * 實際登入邏輯請依專案需求實作
 */
export function login() {
  // 預設導向 Next-Auth 登入
  if (typeof window !== "undefined") {
    window.location.href = "/api/auth/signin"
  }
}
