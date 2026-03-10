import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../styles/globals.css";
import { SidebarInset, SidebarProvider } from "@/components/commons/sidebar";
import { Header, Sidebar, Footer } from "@/components/layouts";
import ReduxProvider from "@/providers/ReduxProvider";
import QueryProvider from "@/providers/QueryProvider";
import DialogProvider from "@/components/commons/dialog-provider";
// TODO: next-auth 的 /api/auth/[...nextauth] route 設定完成後再啟用
// import SessionProvider from "@/providers/SessionProvider";

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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <QueryProvider>
          <ReduxProvider>
            <DialogProvider>
            <SidebarProvider>
              <Sidebar />
              <SidebarInset>
                <Header />
                {children}
                <Footer />
              </SidebarInset>
            </SidebarProvider>
            </DialogProvider>
          </ReduxProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
