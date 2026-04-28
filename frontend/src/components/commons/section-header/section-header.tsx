import type { ReactNode } from "react";
import styles from "./section-header.module.scss";

interface SectionHeaderProps {
  title: string;
  subtitle?: ReactNode;
  controls?: ReactNode;
}

export function SectionHeader({ title, subtitle, controls }: SectionHeaderProps) {
  return (
    <div className={styles.header}>
      <div>
        <h2 className={styles.title}>
          <span className={styles.titleBar} />
          {title}
        </h2>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {controls && <div className={styles.controls}>{controls}</div>}
    </div>
  );
}
