/**
 * Sends email through Resend. Never throws: returns { ok, error } so a failed email
 * never breaks signup or student creation.
 *
 * Note: on Resend's free plan without a verified domain, emails can only be sent to the
 * address that owns the Resend account. Verify a domain in Resend to email anyone.
 */
export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) return { ok: false, error: "Email is not configured (RESEND_API_KEY / EMAIL_FROM)." };

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], subject, html }),
    });
    if (!response.ok) {
      const detail = await response.text();
      console.error("RESEND ERROR:", response.status, detail);
      return { ok: false, error: detail };
    }
    return { ok: true, error: null };
  } catch (error) {
    console.error("RESEND ERROR:", error instanceof Error ? error.message : error);
    return { ok: false, error: "Network error while sending email." };
  }
}

export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
