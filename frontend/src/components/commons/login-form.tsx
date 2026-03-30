"use client"

import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import { azure_ad } from "@/images"
import { cn } from "@/lib/utils"
import { Button } from "@/components/commons/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/commons/card"
import { Input } from "@/components/commons/input"
import { Label } from "@/components/commons/label"

const ERROR_MAP: Record<string, string> = {
  Callback: "登入過程發生錯誤，請嘗試使用其他帳號。",
  OAuthSignin: "無法啟動 OAuth 登入流程，請稍後再試。",
  OAuthCallback: "OAuth 回呼發生錯誤，請稍後再試。",
  default: "登入時發生未知錯誤，請重新嘗試。",
}

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")
  const errorMessage = error ? (ERROR_MAP[error] ?? ERROR_MAP.default) : null

  const handleAzureLogin = () => {
    signIn("azure-ad", { callbackUrl: "/" })
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">系統登入</CardTitle>
          <CardDescription>
            使用電子郵件或 Microsoft 帳號登入
          </CardDescription>
        </CardHeader>
        <CardContent>
          {errorMessage && (
            <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {errorMessage}
            </div>
          )}
          <form>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">電子郵件</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">密碼</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    忘記密碼？
                  </a>
                </div>
                <Input id="password" type="password" required />
              </div>
              <Button type="submit" className="w-full">
                登入
              </Button>
              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 bg-card px-2 text-muted-foreground">
                  或使用以下方式
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full gap-3"
                onClick={handleAzureLogin}
              >
                <Image src={azure_ad} alt="Azure AD" width={20} height={20} />
                使用 Azure AD 登入
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground text-center text-xs text-balance">
        點擊登入即表示您同意我們的{" "}
        <a href="#" className="underline underline-offset-4 hover:text-primary">
          服務條款
        </a>{" "}
        與{" "}
        <a href="#" className="underline underline-offset-4 hover:text-primary">
          隱私權政策
        </a>
        。
      </div>
    </div>
  )
}
