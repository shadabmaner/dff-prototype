import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page = searchParams.get("page") ?? "1"
  const limit = searchParams.get("limit") ?? "10"

  try {
    const res = await fetch(
      `https://dev-api.drapp.onpointsoft.com/api/v1/payments/transactions?page=${page}&limit=${limit}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    )

    const json = await res.json()
    return NextResponse.json(json, { status: res.status })
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
  }
}