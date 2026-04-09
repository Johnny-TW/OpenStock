import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

function getSessionToken(
  cookieStore: Awaited<ReturnType<typeof cookies>>
): string | undefined {
  const baseName = process.env.SESSION_TOKEN_NAME ?? "next-auth.session-token"

  const single = cookieStore.get(baseName)
  if (single?.value) return single.value

  const chunks: string[] = []
  for (let i = 0; ; i++) {
    const chunk = cookieStore.get(`${baseName}.${i}`)
    if (!chunk?.value) break
    chunks.push(chunk.value)
  }

  return chunks.length > 0 ? chunks.join("") : undefined
}

export async function GET() {
  try {
    const cookieStore = await cookies()
    const tokenValue = getSessionToken(cookieStore)

    if (!tokenValue) {
      return new NextResponse(null, { status: 401 })
    }

    let decoded: { azureAccessToken?: string; provider?: string }

    try {
      decoded = jwt.verify(tokenValue, process.env.SECRET!) as typeof decoded
    } catch {
      return new NextResponse(null, { status: 401 })
    }

    if (decoded?.provider === "google" || !decoded?.azureAccessToken) {
      return new NextResponse(null, { status: 404 })
    }

    const photoRes = await fetch(
      "https://graph.microsoft.com/v1.0/me/photo/$value",
      {
        headers: { Authorization: `Bearer ${decoded.azureAccessToken}` },
      }
    )

    if (!photoRes.ok) {
      return new NextResponse(null, {
        status: photoRes.status === 404 ? 404 : 502,
      })
    }

    const arrayBuffer = await photoRes.arrayBuffer()

    return new NextResponse(Buffer.from(arrayBuffer), {
      headers: {
        "Content-Type":
          photoRes.headers.get("Content-Type") ?? "image/jpeg",
        "Cache-Control": "private, max-age=3600",
      },
    })
  } catch {
    return new NextResponse(null, { status: 500 })
  }
}
