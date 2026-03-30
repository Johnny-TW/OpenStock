import { LoginForm } from "@/components/commons/login-form"

export default function LoginPage() {
  return (
    <div className="fixed inset-0 z-9999 flex min-h-svh w-full items-center justify-center bg-muted/50 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  )
}
