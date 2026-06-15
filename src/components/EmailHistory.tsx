"use client";

import { useCallback, useEffect, useState } from "react";
import {
  type EmailDetail,
  type EmailHistoryItem,
  type EmailHistoryListResponse,
  formatDateTime,
  formatEventLabel,
  formatRecipients,
  getEventTone,
} from "@/lib/email-history";

const EVENT_STYLES = {
  success:
    "border-[var(--success-border)] bg-[var(--success-bg)] text-[var(--success-text)]",
  warning: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
  danger:
    "border-[var(--error-border)] bg-[var(--error-bg)] text-[var(--error-text)]",
  neutral:
    "border-[var(--border)] bg-[var(--panel-bg)] text-[var(--text-secondary)]",
} as const;

function StatusBadge({ event }: { event: EmailHistoryItem["last_event"] }) {
  const tone = getEventTone(event);
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${EVENT_STYLES[tone]}`}
    >
      {formatEventLabel(event)}
    </span>
  );
}

function EmailRow({
  email,
  expanded,
  onToggle,
  detail,
  detailLoading,
}: {
  email: EmailHistoryItem;
  expanded: boolean;
  onToggle: () => void;
  detail: EmailDetail | null;
  detailLoading: boolean;
}) {
  return (
    <div className="border-b border-[var(--border)] last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full flex-col gap-3 px-5 py-4 text-left transition hover:bg-[var(--surface-hover)] sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="min-w-0 flex-1 space-y-1">
          <p className="truncate font-medium text-[var(--text-primary)]">
            {email.subject || "(No subject)"}
          </p>
          <p className="truncate text-sm text-[var(--text-muted)]">
            To: {formatRecipients(email.to)}
          </p>
          <p className="truncate text-xs text-[var(--text-muted)]">
            From: {email.from}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-3 sm:justify-end">
          <StatusBadge event={email.last_event} />
          <span className="text-xs text-[var(--text-muted)]">
            {formatDateTime(email.created_at)}
          </span>
          <svg
            className={`h-4 w-4 text-[var(--text-muted)] transition-transform ${expanded ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-[var(--border)] bg-[var(--panel-bg)] px-5 py-4">
          {detailLoading && (
            <p className="text-sm text-[var(--text-muted)]">Loading details…</p>
          )}
          {!detailLoading && detail && (
            <div className="space-y-4 text-sm">
              <dl className="grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                    Email ID
                  </dt>
                  <dd className="mt-1 break-all font-mono text-xs text-[var(--text-primary)]">
                    {detail.id}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                    Scheduled
                  </dt>
                  <dd className="mt-1 text-[var(--text-primary)]">
                    {formatDateTime(detail.scheduled_at)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                    Cc
                  </dt>
                  <dd className="mt-1 text-[var(--text-primary)]">
                    {formatRecipients(detail.cc)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                    Bcc
                  </dt>
                  <dd className="mt-1 text-[var(--text-primary)]">
                    {formatRecipients(detail.bcc)}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                    Reply-To
                  </dt>
                  <dd className="mt-1 text-[var(--text-primary)]">
                    {formatRecipients(detail.reply_to)}
                  </dd>
                </div>
              </dl>

              {detail.text && (
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                    Plain text
                  </p>
                  <pre className="max-h-48 overflow-auto rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-xs whitespace-pre-wrap text-[var(--text-primary)]">
                    {detail.text}
                  </pre>
                </div>
              )}

              {detail.html && (
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                    HTML preview
                  </p>
                  <div
                    className="max-h-64 overflow-auto rounded-lg border border-[var(--border)] bg-white p-4 text-sm text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100"
                    dangerouslySetInnerHTML={{ __html: detail.html }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function EmailHistory() {
  const [emails, setEmails] = useState<EmailHistoryItem[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<EmailDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchHistory = useCallback(async (after?: string) => {
    const params = new URLSearchParams({ limit: "20" });
    if (after) params.set("after", after);

    const response = await fetch(`/api/emails?${params.toString()}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to load history");
    }

    return data as EmailHistoryListResponse;
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchHistory();
        if (!cancelled) {
          setEmails(data.emails);
          setHasMore(data.has_more);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load history");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [fetchHistory]);

  const loadMore = async () => {
    if (!hasMore || loadingMore || emails.length === 0) return;

    setLoadingMore(true);
    setError(null);

    try {
      const lastId = emails[emails.length - 1]?.id;
      const data = await fetchHistory(lastId);
      setEmails((prev) => [...prev, ...data.emails]);
      setHasMore(data.has_more);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load more emails");
    } finally {
      setLoadingMore(false);
    }
  };

  const toggleExpanded = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      setDetail(null);
      return;
    }

    setExpandedId(id);
    setDetail(null);
    setDetailLoading(true);

    try {
      const response = await fetch(`/api/emails/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load email details");
      }

      setDetail(data.email);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load email details");
      setExpandedId(null);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="compose-card overflow-hidden rounded-2xl border">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
        <div>
          <h2 className="font-semibold text-[var(--text-primary)]">Send history</h2>
          <p className="text-sm text-[var(--text-muted)]">
            Emails sent from your Resend account
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
        >
          Refresh
        </button>
      </div>

      {loading && (
        <div className="px-6 py-12 text-center text-sm text-[var(--text-muted)]">
          Loading send history…
        </div>
      )}

      {error && (
        <div className="mx-6 mt-4 rounded-lg border border-[var(--error-border)] bg-[var(--error-bg)] px-4 py-3 text-sm text-[var(--error-text)]">
          {error}
        </div>
      )}

      {!loading && !error && emails.length === 0 && (
        <div className="px-6 py-12 text-center">
          <p className="text-sm font-medium text-[var(--text-primary)]">
            No emails sent yet
          </p>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Sent messages will appear here once you send from Compose.
          </p>
        </div>
      )}

      {!loading && emails.length > 0 && (
        <div>
          {emails.map((email) => (
            <EmailRow
              key={email.id}
              email={email}
              expanded={expandedId === email.id}
              onToggle={() => toggleExpanded(email.id)}
              detail={expandedId === email.id ? detail : null}
              detailLoading={expandedId === email.id && detailLoading}
            />
          ))}
        </div>
      )}

      {!loading && hasMore && (
        <div className="border-t border-[var(--border)] px-6 py-4 text-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={loadingMore}
            className="rounded-lg bg-[var(--accent)] px-5 py-2 text-sm font-medium text-white transition hover:bg-[var(--accent-hover)] disabled:opacity-60"
          >
            {loadingMore ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
