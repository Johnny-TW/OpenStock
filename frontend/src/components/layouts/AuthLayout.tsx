"use client"

import { useSession } from "next-auth/react"
import { SidebarInset, SidebarProvider } from "@/components/commons/sidebar"
import { Header, Sidebar, Footer } from "@/components/layouts"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { status } = useSession()

  if (status === "unauthenticated") {
    return <>{children}</>
  }

  return (
    <SidebarProvider>
      <Sidebar />
      <SidebarInset>
        <Header />
        <main className="main-content">
          <div className="flex-1 pb-16">{children}</div>
        </main>
        <Footer />
      </SidebarInset>
    </SidebarProvider>
  )
}
