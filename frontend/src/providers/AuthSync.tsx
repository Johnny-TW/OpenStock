"use client";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useEffect } from "react";
import { toast } from "sonner";
import { setAccessToken } from "@/lib/api-client";

interface ExtendedSession {
  accessToken?: string;
  error?: string;
  user?: Record<string, unknown>;
}

const AuthSync = () => {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const extSession = session as ExtendedSession | null;

  useEffect(() => {
    setAccessToken(extSession?.accessToken ?? null);
  }, [extSession?.accessToken]);

  useEffect(() => {
    if (status === "loading" || pathname === "/forbidden") return;

    const isPublic = pathname.startsWith("/login") || pathname.startsWith("/auth");

    if (status === "unauthenticated" || !extSession?.accessToken) {
      if (!isPublic) {
        router.push("/login");
      }
      return;
    }

    if (extSession?.error) {
      toast.error(extSession.error);
      signOut();
    }
  }, [status, pathname, extSession, router]);

  return null;
};

export default AuthSync;
