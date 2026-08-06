interface SendEmailOpts {
  to: { email: string; name?: string };
  subject: string;
  html: string;
  fromEmail?: string;
  fromName?: string;
}

export async function sendEmail(opts: SendEmailOpts): Promise<boolean> {
  const apiKey = process.env.SENDER_API_KEY;
  if (!apiKey) {
    console.error("[sendEmail] SENDER_API_KEY not set");
    return false;
  }

  const fromEmail = opts.fromEmail ?? process.env.SENDER_FROM_EMAIL ?? "info@naturelion.ca";
  const fromName = opts.fromName ?? process.env.SENDER_FROM_NAME ?? "Game Goat";

  try {
    const res = await fetch("https://api.sender.net/v2/message/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        from: { email: fromEmail, name: fromName },
        to: [{ email: opts.to.email, name: opts.to.name ?? opts.to.email }],
        subject: opts.subject,
        html: opts.html,
        domain_id: "bkZWwJ",
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "(unreadable)");
      console.error(`[sendEmail] Sender.net error ${res.status}: ${body}`);
      return false;
    }

    return true;
  } catch (err) {
    console.error("[sendEmail] fetch failed:", err);
    return false;
  }
}
