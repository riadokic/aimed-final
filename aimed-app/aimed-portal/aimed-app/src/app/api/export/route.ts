import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const EXPORT_URL = process.env.AIMED_Export_WEBHOOK_URL;
const TIMEOUT_MS = 60_000;

export async function POST(request: NextRequest) {
  if (!EXPORT_URL) {
    return NextResponse.json(
      { success: false, error: "Export Webhook URL not configured" },
      { status: 500 }
    );
  }

  // Verify authenticated session
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Get access token to forward to n8n
  const {
    data: { session },
  } = await supabase.auth.getSession();

  try {
    const body = await request.json();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (session?.access_token) {
      headers["Authorization"] = `Bearer ${session.access_token}`;
    }

    const response = await fetch(EXPORT_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      // Sanitize — never expose raw n8n error content to the client
      return NextResponse.json(
        { success: false, error: "Greška pri kreiranju dokumenta" },
        { status: response.status }
      );
    }

    // Check content type to handle binary (PDF) vs JSON (Word/HTML)
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const data = await response.json();
      return NextResponse.json(data);
    } else {
      // For PDF blobs
      const blob = await response.blob();
      return new NextResponse(blob, {
        headers: {
          "Content-Type": contentType,
          "Content-Disposition":
            response.headers.get("content-disposition") ||
            'attachment; filename="document.pdf"',
        },
      });
    }
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return NextResponse.json(
        { success: false, error: "Timeout" },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Greška pri komunikaciji sa serverom" },
      { status: 502 }
    );
  }
}
