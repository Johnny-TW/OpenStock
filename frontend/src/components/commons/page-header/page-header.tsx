import type { ReactNode } from "react"
import styles from "./page-header.module.scss"

interface PageHeaderProps {
  title: string
  subtitle: ReactNode
  controls?: ReactNode
}

export function PageHeader({ title, subtitle, controls }: PageHeaderProps) {
  return (
    <div className={styles.header}>
      <div>
        <h1 className={styles.title}>
          <span className={styles.titleBar} />
          {title}
        </h1>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>
      {controls && <div className={styles.controls}>{controls}</div>}
    </div>
  )
}
