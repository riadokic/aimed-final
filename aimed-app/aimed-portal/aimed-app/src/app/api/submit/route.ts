import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const WEBHOOK_URL = process.env.AIMED_Transcribe_WEBHOOK_URL;
const TIMEOUT_MS = 60_000;

export async function POST(request: NextRequest) {
  if (!WEBHOOK_URL) {
    return NextResponse.json(
      { success: false, error: "Webhook URL not configured" },
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
    const formData = await request.formData();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const headers: HeadersInit = {};
    if (session?.access_token) {
      headers["Authorization"] = `Bearer ${session.access_token}`;
    }

    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      body: formData,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      // Sanitize — never expose raw n8n error content to the client
      return NextResponse.json(
        { success: false, error: "Greška pri obradi zahtjeva" },
        { status: response.status }
      );
    }

    let data = await response.json();

    // Support n8n array response (default for webhooks)
    if (Array.isArray(data) && data.length > 0) {
      data = data[0];
    }

    // Structured sections: pass through directly
    if (data.sections && typeof data.sections === "object") {
      if (data.success === undefined || data.success === null) {
        data.success = true;
      }
    } else if (!data.report_text && data.sections && typeof data.sections === "object") {
      // Convert structured sections to plain text if report_text missing
      const parts = [];
      for (const [title, content] of Object.entries(data.sections)) {
        if (content && typeof content === "string") {
          parts.push(`${title.toUpperCase()}\n${content}`);
        }
      }
      data.report_text = parts.join("\n\n");
    }

    // Ensure success flag exists if we have valid content
    if ((data.report_text || data.sections) && (data.success === undefined || data.success === null)) {
      data.success = true;
    }

    return NextResponse.json(data);
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
