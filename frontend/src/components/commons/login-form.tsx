"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/commons/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/commons/card";
import { azure_ad, google } from "@/images";
import { cn } from "@/lib/utils";

const ERROR_MAP: Record<string, string> = {
  Callback: "登入過程發生錯誤，請嘗試使用其他帳號。",
  OAuthSignin: "無法啟動 OAuth 登入流程，請稍後再試。",
  OAuthCallback: "OAuth 回呼發生錯誤，請稍後再試。",
  default: "登入時發生未知錯誤，請重新嘗試。",
};

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const errorMessage = error ? (ERROR_MAP[error] ?? ERROR_MAP.default) : null;

  const handleAzureLogin = () => {
    signIn("azure-ad", { callbackUrl: "/stock" });
  };

  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: "/stock" });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">系統登入</CardTitle>
          <CardDescription>使用 Microsoft 或 Google 帳號登入</CardDescription>
        </CardHeader>
        <CardContent>
          {errorMessage && (
            <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {errorMessage}
            </div>
          )}
          <div className="flex flex-col gap-6">
            <Button
              type="button"
              variant="outline"
              className="w-full gap-3"
              onClick={handleAzureLogin}
            >
              <Image src={azure_ad} alt="Azure AD" width={24} height={24} />
              使用 Microsoft 帳號登入
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full gap-3"
              onClick={handleGoogleLogin}
            >
              <Image src={google} alt="Google" width={20} height={20} />
              使用 Google 帳號登入
            </Button>
          </div>
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
  );
}
