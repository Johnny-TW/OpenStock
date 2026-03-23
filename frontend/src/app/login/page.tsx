"use client"

import { signIn } from "next-auth/react"
import Image from "next/image"
import { azure_ad } from "@/images"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/commons/card"
import { Button } from "@/components/commons/button"

export default function LoginPage() {
  const handleLogin = () => {
    signIn("azure-ad", { callbackUrl: "/" })
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-muted/50">
      <Card className="w-[400px]">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">系統登入</CardTitle>
          <CardDescription>使用 Microsoft 帳號登入以繼續</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <Button variant="outline" size="lg" onClick={handleLogin} className="w-full gap-3">
            <Image src={azure_ad} alt="Azure AD" width={20} height={20} />
            使用 Azure AD 登入
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
