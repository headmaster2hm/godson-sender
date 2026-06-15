import { promises as fs } from "fs";
import path from "path";

let memoryDeletedIds: Set<string> | null = null;

function isServerlessRuntime(): boolean {
  const cwd = process.cwd();

  return Boolean(
    process.env.VERCEL ||
      process.env.VERCEL_ENV ||
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
      cwd === "/var/task" ||
      cwd.startsWith("/var/task/"),
  );
}

function getMemoryStore(): Set<string> {
  if (!memoryDeletedIds) {
    memoryDeletedIds = new Set();
  }

  return memoryDeletedIds;
}

function getDataDir(): string {
  if (process.env.INBOX_DATA_DIR?.trim()) {
    return process.env.INBOX_DATA_DIR.trim();
  }

  if (isServerlessRuntime()) {
    return path.join("/tmp", "maildesk-data");
  }

  return path.join(process.cwd(), "data");
}

function getDeletedFile(): string {
  return path.join(getDataDir(), "inbox-deleted.json");
}

async function readFileStore(): Promise<string[]> {
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

async function writeFileStore(ids: string[]): Promise<void> {
  const deletedFile = getDeletedFile();

  try {
    await fs.mkdir(getDataDir(), { recursive: true });
    await fs.writeFile(deletedFile, JSON.stringify(ids, null, 2), "utf8");
  } catch {
    // Ignore write failures on read-only filesystems.
  }
}

export async function getDeletedInboxIds(): Promise<Set<string>> {
  if (isServerlessRuntime()) {
    return new Set(getMemoryStore());
  }

  return new Set(await readFileStore());
}

export async function markInboxEmailDeleted(id: string): Promise<void> {
  if (isServerlessRuntime()) {
    getMemoryStore().add(id);
    return;
  }

  const ids = await readFileStore();
  if (!ids.includes(id)) {
    await writeFileStore([...ids, id]);
  }
}
