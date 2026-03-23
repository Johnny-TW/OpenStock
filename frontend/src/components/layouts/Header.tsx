"use client";

import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/commons/sidebar";
import { Separator } from "@/components/commons/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/commons/breadcrumb";

const breadcrumbMap: Record<string, { category: string; page: string }> = {
  "/stock": { category: "股票資訊", page: "當日成交總覽" },
  "/stock/valuation": { category: "股票資訊", page: "本益比/殖利率" },
  "/stock/market-index": { category: "股票資訊", page: "大盤指數" },
  "/stock/top-volume": { category: "股票資訊", page: "成交排行" },
  "/stock/intraday": { category: "股票資訊", page: "盤中走勢" },
  "/stock/index-history": { category: "股票資訊", page: "指數歷史" },
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
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
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
    </header>
  );
}
