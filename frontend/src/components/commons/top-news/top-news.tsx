"use client";

import { ArrowRight, ExternalLink, Flame } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { useAllNews } from "@/hooks/use-stock-query";
import type { NewsDto } from "@/type/stock";
import styles from "./top-news.module.scss";

const TOP_COUNT = 5;

export function TopNews() {
  const { data: allNews } = useAllNews();

  const topList: NewsDto[] = useMemo(() => {
    if (!allNews) return [];
    const merged = [
      ...(allNews.twStock?.data ?? []),
      ...(allNews.usStock?.data ?? []),
      ...(allNews.international?.data ?? []),
    ];
    merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return merged.slice(0, TOP_COUNT);
  }, [allNews]);

  if (!allNews || topList.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <Flame className={styles.fireIcon} />
          <h2 className={styles.title}>熱門新聞</h2>
        </div>
        <Link href="/stock/news" className={styles.moreLink}>
          查看更多 <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className={styles.list}>
        {topList.map((news, idx) => (
          <a
            key={`${news.url}-${idx}`}
            href={news.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.card}
          >
            <span className={styles.rank}>{idx + 1}</span>

            <div className={styles.content}>
              <div className={styles.meta}>
                <span className={styles.date}>{news.date}</span>
                {news.source && <span className={styles.source}>{news.source}</span>}
              </div>
              <div className={styles.newsTitle}>{news.title}</div>
            </div>

            <ExternalLink className={styles.linkIcon} />
          </a>
        ))}
      </div>
    </section>
  );
}
