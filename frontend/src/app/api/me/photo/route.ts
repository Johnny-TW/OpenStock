import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const tokenCookie = cookieStore.get(process.env.SESSION_TOKEN_NAME ?? "")

    if (!tokenCookie?.value) {
      return new NextResponse(null, { status: 401 })
    }

    const decoded = jwt.verify(tokenCookie.value, process.env.SECRET!) as {
      azureAccessToken?: string
      provider?: string
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
      const errorBody = await photoRes.text().catch(() => "")
      console.error(
        `[photo] Graph API error: ${photoRes.status}`,
        errorBody.slice(0, 500)
      )
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
