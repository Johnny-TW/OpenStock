/* eslint-disable @next/next/no-page-custom-font */
/* eslint-disable @next/next/google-font-display */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../styles/globals.css";
import DialogProvider from "@/components/commons/dialog-provider";
import AuthLayout from "@/components/layouts/AuthLayout";
import AuthSync from "@/providers/AuthSync";
import PermissionGuard from "@/providers/PermissionGuard";
import QueryProvider from "@/providers/QueryProvider";
import ReduxProvider from "@/providers/ReduxProvider";
import SessionProvider from "@/providers/SessionProvider";

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
    default: "EE39 StockSmart System",
    template: "EE39 StockSmart System | %s",
  },
  description: "EE39 StockSmart System Application",
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Icons" rel="stylesheet" />
        <link rel="icon" href="/enbglogo.svg" />
        <link rel="shortcut icon" href="/enbglogo.svg" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('stocksmart-theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
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
                  <AuthLayout>{children}</AuthLayout>
                </PermissionGuard>
              </DialogProvider>
            </ReduxProvider>
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
