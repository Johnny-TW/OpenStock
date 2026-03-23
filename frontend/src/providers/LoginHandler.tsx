import { signIn, signOut } from "next-auth/react"

export function login(): void {
  signIn("azure-ad", { callbackUrl: "/" })
}

export function logout(): void {
  const postLogoutUrl = typeof window !== "undefined" ? window.location.origin : ""
  signOut({ callbackUrl: "/" }).then(() => {
    const azureLogoutUrl = process.env.NEXT_PUBLIC_AZURE_LOGOUT_URL
    if (azureLogoutUrl) {
      window.location.href = `${azureLogoutUrl}?post_logout_redirect_uri=${encodeURIComponent(postLogoutUrl)}`
    }
  })
}
