export interface WishListItem {
  id: string;
  name: string;
  url?: string;
  priceCents?: number;
}

function base(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Xmas Goat</title>
</head>
<body style="margin:0;padding:0;background:#0f5132;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0f5132;padding:40px 16px;">
  <tr><td align="center">
    <table width="100%" style="max-width:520px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.18);">
      <tr><td style="padding:36px 32px 28px;">
        <p style="margin:0 0 8px;font-size:13px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#a4161a;">Xmas Goat 🎄</p>
        ${content}
        <p style="margin:32px 0 0;font-size:12px;color:#94a3b8;border-top:1px solid #f1f5f9;padding-top:20px;">
          You're receiving this because someone invited you to a Kris Kringle exchange on
          <a href="https://xmasgoat.com" style="color:#0f5132;">xmasgoat.com</a>.
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

function ctaButton(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;margin-top:24px;background:#a4161a;color:#ffffff;font-weight:800;font-size:16px;text-decoration:none;padding:14px 28px;border-radius:14px;border:none;">
    ${label}
  </a>`;
}

export function inviteEmail(opts: {
  hostName: string;
  exchangeName: string;
  partyDate?: string;
  budget?: string;
  joinUrl: string;
}): string {
  const dateLine = opts.partyDate
    ? `<p style="margin:8px 0 0;color:#475569;font-size:15px;">📅 Party date: <strong>${opts.partyDate}</strong></p>`
    : "";
  const budgetLine = opts.budget
    ? `<p style="margin:8px 0 0;color:#475569;font-size:15px;">💰 Budget: <strong>${opts.budget}</strong></p>`
    : "";

  return base(`
    <div style="font-size:48px;margin-bottom:16px;">🎄</div>
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:900;color:#0f2418;">You're invited!</h1>
    <p style="margin:0;color:#334155;font-size:16px;line-height:1.6;">
      <strong>${opts.hostName}</strong> has invited you to join
      <strong>${opts.exchangeName}</strong> — a Kris Kringle gift exchange.
    </p>
    ${dateLine}
    ${budgetLine}
    <p style="margin:20px 0 0;color:#334155;font-size:15px;">
      Click below to join and add your wish list so your secret santa knows what to get you.
    </p>
    ${ctaButton(opts.joinUrl, "Join the exchange →")}
  `);
}

export function secretSantaEmail(opts: {
  recipientName: string;
  gifteeName: string;
  wishList: WishListItem[];
  budget?: string;
  partyDate?: string;
}): string {
  const budgetLine = opts.budget
    ? `<p style="margin:8px 0 0;color:#475569;font-size:15px;">💰 Budget: <strong>${opts.budget}</strong></p>`
    : "";
  const dateLine = opts.partyDate
    ? `<p style="margin:8px 0 0;color:#475569;font-size:15px;">📅 Party date: <strong>${opts.partyDate}</strong></p>`
    : "";

  const wishListHtml =
    opts.wishList.length === 0
      ? `<p style="color:#64748b;font-size:14px;margin:12px 0 0;">They haven't added any wish list items yet — surprise them!</p>`
      : `<ul style="margin:12px 0 0;padding:0;list-style:none;">
          ${opts.wishList
            .map(
              (item) => `
            <li style="display:flex;align-items:flex-start;gap:8px;padding:10px 0;border-bottom:1px solid #f1f5f9;">
              <span style="font-size:18px;">🎁</span>
              <span>
                <strong style="color:#1e293b;">${item.name}</strong>
                ${item.priceCents ? `<span style="color:#64748b;font-size:13px;margin-left:6px;">~$${(item.priceCents / 100).toFixed(2)}</span>` : ""}
                ${item.url ? `<br/><a href="${item.url}" style="color:#0f5132;font-size:13px;">View item →</a>` : ""}
              </span>
            </li>
          `,
            )
            .join("")}
        </ul>`;

  return base(`
    <div style="font-size:48px;margin-bottom:16px;">🎅</div>
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:900;color:#0f2418;">Ho ho ho, ${opts.recipientName}!</h1>
    <p style="margin:0;color:#334155;font-size:16px;line-height:1.6;">
      Your Secret Santa assignment is in. This is strictly between you and the elves — don't tell anyone!
    </p>
    <div style="margin:24px 0 0;background:#f0fdf4;border-radius:16px;padding:20px;">
      <p style="margin:0;font-size:13px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#166534;">Your giftee</p>
      <p style="margin:8px 0 0;font-size:28px;font-weight:900;color:#14532d;">${opts.gifteeName}</p>
      ${budgetLine}
      ${dateLine}
    </div>
    <div style="margin:24px 0 0;">
      <p style="margin:0;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#475569;">${opts.gifteeName}'s wish list</p>
      ${wishListHtml}
    </div>
  `);
}

export function partyNightEmail(opts: {
  exchangeName: string;
  joinUrl: string;
  partyDate?: string;
}): string {
  const dateLine = opts.partyDate
    ? `<p style="margin:8px 0 0;color:#475569;font-size:15px;">📅 Tonight: <strong>${opts.partyDate}</strong></p>`
    : "";

  return base(`
    <div style="font-size:48px;margin-bottom:16px;">🥳</div>
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:900;color:#0f2418;">Tonight's the night!</h1>
    <p style="margin:0;color:#334155;font-size:16px;line-height:1.6;">
      <strong>${opts.exchangeName}</strong> is happening! Make sure you have your gift and you're ready to play.
    </p>
    ${dateLine}
    <p style="margin:20px 0 0;color:#334155;font-size:15px;">
      The host will launch the game when everyone's together. Bookmark this link so you can join instantly.
    </p>
    ${ctaButton(opts.joinUrl, "Open Xmas Goat →")}
  `);
}
