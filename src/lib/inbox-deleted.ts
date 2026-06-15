import { promises as fs } from "fs";
import path from "path";

function getDataDir(): string {
  if (process.env.INBOX_DATA_DIR?.trim()) {
    return process.env.INBOX_DATA_DIR.trim();
  }

  // Vercel/Lambda only allow writes under /tmp, not the project directory.
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return path.join("/tmp", "maildesk-data");
  }

  return path.join(process.cwd(), "data");
}

function getDeletedFile(): string {
  return path.join(getDataDir(), "inbox-deleted.json");
}

async function ensureStore(): Promise<string[]> {
  const deletedFile = getDeletedFile();

  try {
    await fs.mkdir(getDataDir(), { recursive: true });
    const raw = await fs.readFile(deletedFile, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

export async function getDeletedInboxIds(): Promise<Set<string>> {
  const ids = await ensureStore();
  return new Set(ids);
}

export async function markInboxEmailDeleted(id: string): Promise<void> {
  const deletedFile = getDeletedFile();

  try {
    const ids = await ensureStore();
    if (!ids.includes(id)) {
      ids.push(id);
      await fs.writeFile(deletedFile, JSON.stringify(ids, null, 2), "utf8");
    }
  } catch {
    // Inbox still works if local delete state cannot be persisted.
  }
}
