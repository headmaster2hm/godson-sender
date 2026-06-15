export type EmailEvent =
  | "bounced"
  | "canceled"
  | "clicked"
  | "complained"
  | "delivered"
  | "delivery_delayed"
  | "failed"
  | "opened"
  | "queued"
  | "scheduled"
  | "sent"
  | "suppressed";

export type EmailHistoryItem = {
  id: string;
  to: string[];
  from: string;
  created_at: string;
  subject: string;
  bcc: string[] | null;
  cc: string[] | null;
  reply_to: string[] | null;
  last_event: EmailEvent;
  scheduled_at: string | null;
};

export type EmailHistoryListResponse = {
  emails: EmailHistoryItem[];
  has_more: boolean;
};

export type EmailDetail = EmailHistoryItem & {
  html: string | null;
  text: string | null;
};

export function formatRecipients(emails: string[] | null): string {
  if (!emails || emails.length === 0) return "—";
  return emails.join(", ");
}

export function formatDateTime(value: string | null): string {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatEventLabel(event: EmailEvent): string {
  return event
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getEventTone(
  event: EmailEvent,
): "success" | "warning" | "danger" | "neutral" {
  if (["delivered", "opened", "clicked"].includes(event)) return "success";
  if (["bounced", "failed", "complained", "suppressed", "canceled"].includes(event)) {
    return "danger";
  }
  if (["delivery_delayed", "queued", "scheduled"].includes(event)) return "warning";
  return "neutral";
}
