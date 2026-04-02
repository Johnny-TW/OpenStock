"use client"

import { useEffect, useState, useMemo } from "react"
import { Loader2, ExternalLink, Newspaper } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux"
import { PageHeader } from "@/components/commons/page-header"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/commons/table"
import type { NewsDto, AllNewsResponse } from "@/type/stock"
import styles from "./page.module.scss"

type TabKey = "twStock" | "usStock" | "international" | "twse"

const TABS: { key: TabKey; label: string; }[] = [
  { key: "twStock", label: "台股新聞",},
  { key: "usStock", label: "美股新聞",},
  { key: "international", label: "國際財經"},
  { key: "twse", label: "證交所公告",},
]

export default function NewsClient() {
  const dispatch = useAppDispatch()
  const allNews = useAppSelector(
    (state) => (state as any).news?.allNews
  ) as AllNewsResponse | null
  const [activeTab, setActiveTab] = useState<TabKey>("twStock")
  const [keyword, setKeyword] = useState("")

  useEffect(() => {
    dispatch({ type: "GET_ALL_NEWS" })
  }, [dispatch])

  const currentList: NewsDto[] = useMemo(() => {
    if (!allNews) return []
    return allNews[activeTab]?.data ?? []
  }, [allNews, activeTab])

  const filtered = useMemo(() => {
    if (!keyword) return currentList
    const kw = keyword.toLowerCase()
    return currentList.filter(
      (n) =>
        n.title.toLowerCase().includes(kw) ||
        (n.summary && n.summary.toLowerCase().includes(kw))
    )
  }, [currentList, keyword])

  if (!allNews) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">載入新聞資料中...</span>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <PageHeader
        title="財經新聞中心"
        subtitle={
          <>
            台股、美股、國際財經即時新聞彙整
            <span className={styles.totalBadge}>
              共 {filtered.length} 則
            </span>
          </>
        }
        controls={
          <input
            type="text"
            placeholder="搜尋新聞標題..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className={styles.searchInput}
          />
        }
      />

      <div className={styles.tabBar}>
        {TABS.map((tab) => {
          const count = allNews[tab.key]?.total ?? 0
          return (
            <button
              key={tab.key}
              className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ""}`}
              onClick={() => {
                setActiveTab(tab.key)
                setKeyword("")
              }}
            >
              <span>{tab.label}</span>
              <span className={styles.tabCount}>{count}</span>
            </button>
          )
        })}
      </div>

      <div className={styles.tableWrapper}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-28">日期</TableHead>
              <TableHead>標題</TableHead>
              {activeTab !== "twse" && (
                <TableHead className="w-24">來源</TableHead>
              )}
              <TableHead className="w-16 text-center">連結</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((row, i) => (
              <TableRow key={`${row.url}-${i}`} className={styles.newsRow}>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {row.date}
                </TableCell>
                <TableCell>
                  <div className={styles.newsTitle}>{row.title}</div>
                  {row.summary && (
                    <div className={styles.newsSummary}>{row.summary}</div>
                  )}
                </TableCell>
                {activeTab !== "twse" && (
                  <TableCell className="text-muted-foreground text-xs">
                    {row.source}
                  </TableCell>
                )}
                <TableCell className="text-center">
                  <a
                    href={row.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.linkIcon}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={activeTab !== "twse" ? 4 : 3}
                  className="text-center text-muted-foreground py-12"
                >
                  <Newspaper className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  找不到符合的新聞
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
