import { Resend } from "resend";

let resendClient: Resend | null = null;

export function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY is not configured. Add it to .env.local in the project root and restart the dev server.",
    );
  }

  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }

  return resendClient;
}

export function formatResendError(
  message: string,
  context: "receiving" | "sending" = "sending",
): string {
  const restrictedToSend = message
    .toLowerCase()
    .includes("restricted to only send");

  if (restrictedToSend && context === "receiving") {
    return (
      'Your Resend API key has "Sending access" only. The inbox needs a "Full access" key to read incoming mail. Create one at https://resend.com/api-keys and update RESEND_API_KEY in Vercel (then redeploy).'
    );
  }

  if (restrictedToSend && context === "sending") {
    return (
      'Your Resend API key cannot send from this address. Use a "Full access" key or a "Sending access" key scoped to your domain.'
    );
  }

  return message;
}
