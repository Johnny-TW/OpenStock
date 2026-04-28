"use client";

import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/commons/breadcrumb";
import { Separator } from "@/components/commons/separator";
import { SidebarTrigger } from "@/components/commons/sidebar";
import { ThemeToggle } from "@/components/commons/theme-toggle";

const breadcrumbMap: Record<string, { category: string; page: string }> = {
  "/stock": { category: "市場數據", page: "當日成交總覽" },
  "/stock/market-overview": { category: "市場數據", page: "大盤總覽" },
  "/stock/valuation": { category: "市場數據", page: "本益比/殖利率" },
  "/stock/ranking": { category: "市場數據", page: "排行榜" },
  "/stock/heatmap": { category: "分析工具", page: "產業熱力圖" },
  "/stock/news": { category: "分析工具", page: "新聞" },
  "/stock/analysis": { category: "分析工具", page: "AI 分析" },
  "/post": { category: "文章", page: "文章列表" },
};

function getBreadcrumb(pathname: string) {
  // Sort by longest prefix first to avoid partial matches
  const match = Object.entries(breadcrumbMap)
    .sort((a, b) => b[0].length - a[0].length)
    .find(([prefix]) => pathname.startsWith(prefix));
  return match ? match[1] : { category: "首頁", page: "總覽" };
}

export default function AppHeader() {
  const pathname = usePathname();
  const { category, page } = getBreadcrumb(pathname);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/">{category}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>{page}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="flex items-center gap-2 px-4">
        <ThemeToggle />
      </div>
    </header>
  );
}
