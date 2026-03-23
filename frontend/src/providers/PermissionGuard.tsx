"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";

const PUBLIC_PATHS = ["/login", "/auth"];

// PermissionGuard - 檢查是否已登入
// 未登入的使用者會被導向 /login
const PermissionGuard = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "loading") return;

    const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

    if (!session && !isPublic) {
      router.push("/login");
    }
  }, [session, status, pathname, router]);

  return <>{children}</>;
};

export default PermissionGuard;
