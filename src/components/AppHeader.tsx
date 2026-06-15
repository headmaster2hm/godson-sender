import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

type AppHeaderProps = {
  title: string;
  subtitle: string;
  active: "compose" | "history";
};

export default function AppHeader({ title, subtitle, active }: AppHeaderProps) {
  return (
    <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)] shadow-md shadow-[var(--accent-glow)]">
          <svg
            className="h-5 w-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.75}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
            />
          </svg>
        </div>
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">
            {title}
          </h1>
          <p className="text-sm text-[var(--text-muted)]">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <nav className="flex rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1 text-sm">
          <Link
            href="/"
            className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
              active === "compose"
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            Compose
          </Link>
          <Link
            href="/history"
            className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
              active === "history"
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            History
          </Link>
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
