"use client"

import { useMemo } from "react"
import { useRouter as useNextRouter, usePathname, useSearchParams, useParams } from "next/navigation"

interface UseRouterReturn {
  router: ReturnType<typeof useNextRouter>
  pathname: string
  params: ReturnType<typeof useParams>
  query: Record<string, string | string[] | undefined>
}

const useRouter = (): UseRouterReturn => {
  const router = useNextRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const params = useParams()

  const query = useMemo(() => {
    const q: Record<string, string | string[] | undefined> = {}
    searchParams.forEach((value, key) => {
      q[key] = value
    })
    // 合併 URL params
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        q[key] = value as string | string[]
      })
    }
    return q
  }, [searchParams, params])

  return useMemo(
    () => ({
      router,
      pathname,
      params,
      query,
    }),
    [router, pathname, params, query],
  )
}

export default useRouter
