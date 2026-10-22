/* eslint-disable @next/next/no-page-custom-font */
/* eslint-disable @next/next/google-font-display */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "../styles/globals.css";
import DialogProvider from "@/components/commons/dialog-provider";
import AuthLayout from "@/components/layouts/auth-layout";
import AuthSync from "@/providers/auth-sync";
import PermissionGuard from "@/providers/permission-guard";
import QueryProvider from "@/providers/query-provider";
import SessionProvider from "@/providers/session-provider";

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
    default: "SS01 - StockSmart System",
    template: "SS01 - StockSmart System | %s",
  },
  description: "SS01 - StockSmart System Application",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Icons" rel="stylesheet" />
        <link rel="icon" href="/enbglogo.svg" />
        <link rel="shortcut icon" href="/enbglogo.svg" />
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('stocksmart-theme');var d=t?t==='dark':true;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
        suppressHydrationWarning
      >
        <SessionProvider>
          <QueryProvider>
            <AuthSync />
            <DialogProvider>
              <PermissionGuard>
                <AuthLayout>{children}</AuthLayout>
              </PermissionGuard>
            </DialogProvider>
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
