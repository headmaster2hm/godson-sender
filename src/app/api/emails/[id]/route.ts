import { NextRequest, NextResponse } from "next/server";
import { validateFromDomain } from "@/lib/email-utils";
import { getResendClient } from "@/lib/resend";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const resend = getResendClient();

    const { data, error } = await resend.emails.get(id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }

    if (!data) {
      return NextResponse.json({ error: "Email not found" }, { status: 404 });
    }

    const allowedDomain = process.env.ALLOWED_FROM_DOMAIN?.trim() || "";
    const fromDomainError = validateFromDomain(data.from, allowedDomain);
    if (fromDomainError) {
      return NextResponse.json({ error: "Email not found" }, { status: 404 });
    }

    return NextResponse.json({ email: data });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to load email details";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
