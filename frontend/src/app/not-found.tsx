import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center">
      <span className="text-8xl font-bold text-muted-foreground/30">404</span>
      <h1 className="text-2xl font-semibold">找不到此頁面</h1>
      <p className="text-muted-foreground">你要找的頁面不存在或已被移除。</p>
      <Link href="/stock" className="mt-2 text-sm text-primary hover:underline underline-offset-4">
        回到股市總覽 →
      </Link>
    </div>
  );
}
