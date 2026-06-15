import { NextRequest, NextResponse } from "next/server";
import type { EmailHistoryItem } from "@/lib/email-history";
import { getResendClient } from "@/lib/resend";

export const runtime = "nodejs";

function filterByAllowedDomain(
  emails: EmailHistoryItem[],
  allowedDomain: string,
): EmailHistoryItem[] {
  if (!allowedDomain) return emails;

  const suffix = `@${allowedDomain.toLowerCase()}`;
  return emails.filter((email) => email.from.toLowerCase().includes(suffix));
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = Number.parseInt(searchParams.get("limit") || "20", 10);
    const limit = Number.isNaN(limitParam)
      ? 20
      : Math.min(100, Math.max(1, limitParam));
    const after = searchParams.get("after") || undefined;
    const before = searchParams.get("before") || undefined;

    const resend = getResendClient();

    const { data, error } = await resend.emails.list({
      limit,
      ...(after ? { after } : before ? { before } : {}),
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }

    const allowedDomain = process.env.ALLOWED_FROM_DOMAIN?.trim().toLowerCase() || "";
    const emails = filterByAllowedDomain(data?.data ?? [], allowedDomain);

    return NextResponse.json({
      emails,
      has_more: data?.has_more ?? false,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to load email history";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
