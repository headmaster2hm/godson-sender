import AppHeader from "@/components/AppHeader";
import EmailHistory from "@/components/EmailHistory";

export default function HistoryPage() {
  return (
    <div className="page-bg min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <AppHeader
          title="Maildesk"
          subtitle="Send history from Resend"
          active="history"
        />
        <EmailHistory />
      </div>
    </div>
  );
}
