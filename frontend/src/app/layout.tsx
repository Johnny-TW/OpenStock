/* eslint-disable @next/next/no-page-custom-font */
/* eslint-disable @next/next/google-font-display */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../styles/globals.css";
import { SidebarInset, SidebarProvider } from "@/components/commons/sidebar";
import { Header, Sidebar, Footer } from "@/components/layouts";
import ReduxProvider from "@/providers/ReduxProvider";
import QueryProvider from "@/providers/QueryProvider";
import DialogProvider from "@/components/commons/dialog-provider";
import SessionProvider from "@/providers/SessionProvider";
import PermissionGuard from "@/providers/PermissionGuard";
import AuthSync from "@/providers/AuthSync";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Next.js Course",
    template: "Next.js Course | %s",
  },
  description: "Next.js Course Application",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Icons"
          rel="stylesheet"
        />
        <link rel="icon" href="/enbglogo.svg" />
        <link rel="shortcut icon" href="/enbglogo.svg" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
        suppressHydrationWarning
      >
        <SessionProvider>
          <QueryProvider>
            <ReduxProvider>
              <AuthSync />
              <DialogProvider>
                <PermissionGuard>
                  <SidebarProvider>
                  <Sidebar />
                  <SidebarInset>
                    <Header />
                    <main className="main-content">
                      <div className="flex-1 pb-16">{children}</div>
                    </main>
                    {/* Footer */}
                    <Footer />
                  </SidebarInset>
                </SidebarProvider>
                </PermissionGuard>
              </DialogProvider>
            </ReduxProvider>
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
