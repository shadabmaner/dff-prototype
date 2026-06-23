import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    const response = await fetch("https://drpdf.onpointsoft.com/generate-invoice", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "accept": "application/pdf",
        "X-API-Key": "FxK7hDbgtkeqCgnmDmv4GC1SS9pDLYgdD1pFVmckAZM=",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("PDF service error:", text);
      return NextResponse.json({ error: "PDF service failed" }, { status: response.status });
    }

    // ✅ Stream directly — no Buffer conversion
    return new NextResponse(response.body, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline; filename=invoice.pdf",
        "Content-Length": response.headers.get("content-length") ?? "",
      },
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}