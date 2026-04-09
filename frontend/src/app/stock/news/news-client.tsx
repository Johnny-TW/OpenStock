"use client"

import { useEffect, useState, useMemo } from "react"
import Image from "next/image"
import { Loader2, ExternalLink, Newspaper, ChevronLeft, ChevronRight } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux"
import { PageHeader } from "@/components/commons/page-header"
import type { NewsDto } from "@/type/stock"
import styles from "./page.module.scss"

const PAGE_SIZE = 10

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
    (state) => state.news?.allNews ?? null
  )
  const [activeTab, setActiveTab] = useState<TabKey>("twStock")
  const [keyword, setKeyword] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

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

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, currentPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab, keyword])

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

      <div className={styles.newsList}>
        {paged.map((row, i) => (
          <a
            key={`${row.url}-${i}`}
            href={row.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.newsCard}
          >
            {row.image && (
              <div className={styles.newsImageWrapper}>
                <Image
                  src={row.image}
                  alt=""
                  className={styles.newsImage}
                  width={120}
                  height={80}
                  unoptimized
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none"
                  }}
                />
              </div>
            )}
            <div className={styles.newsContent}>
              <div className={styles.newsMeta}>
                <span className={styles.newsDate}>{row.date}</span>
                {row.source && (
                  <span className={styles.newsSource}>{row.source}</span>
                )}
              </div>
              <div className={styles.newsTitle}>{row.title}</div>
              {row.summary && (
                <div className={styles.newsSummary}>{row.summary}</div>
              )}
            </div>
            <ExternalLink className={styles.newsLinkIcon} />
          </a>
        ))}
        {filtered.length === 0 && (
          <div className={styles.emptyState}>
            <Newspaper className="h-8 w-8 opacity-40" />
            <span>找不到符合的新聞</span>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`${styles.pageBtn} ${currentPage === page ? styles.pageBtnActive : ""}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
          <button
            className={styles.pageBtn}
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}
