const STOP_WORDS = new Set([
  "and",
  "the",
  "for",
  "with",
  "that",
  "this",
  "would",
  "like",
  "want",
  "some",
  "from",
  "gift",
  "gifts",
  "size",
  "color",
  "colour",
]);

export type WishlistSignal = {
  auth_user_id: string;
  item_text: string;
  notes?: string | null;
};
export type HeartSignal = { auth_user_id: string; product_slug: string };

export function signalWords(text: string) {
  return [
    ...new Set(
      text
        .toLowerCase()
        .match(/[a-z0-9]+/g)
        ?.filter((word) => word.length >= 3 && !STOP_WORDS.has(word)) ?? [],
    ),
  ].slice(0, 30);
}

/** A group signal is public only after two distinct users independently supplied it. */
export function aggregateAnonymousGroupSignals(
  items: WishlistSignal[],
  hearts: HeartSignal[],
) {
  const themeUsers = new Map<string, Set<string>>();
  for (const item of items) {
    for (const word of signalWords(`${item.item_text} ${item.notes ?? ""}`)) {
      const users = themeUsers.get(word) ?? new Set<string>();
      users.add(item.auth_user_id);
      themeUsers.set(word, users);
    }
  }

  const themes = [...themeUsers]
    .filter(([, users]) => users.size >= 2)
    .map(([label, users]) => ({ label, count: users.size }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, 8);

  const slugUsers = new Map<string, Set<string>>();
  for (const heart of hearts) {
    const users = slugUsers.get(heart.product_slug) ?? new Set<string>();
    users.add(heart.auth_user_id);
    slugUsers.set(heart.product_slug, users);
  }
  const preferredSlugs = [...slugUsers]
    .filter(([, users]) => users.size >= 2)
    .map(([slug]) => slug);
  const contributingPlayers = new Set([
    ...items.map((item) => item.auth_user_id),
    ...hearts.map((heart) => heart.auth_user_id),
  ]).size;

  return { themes, preferredSlugs, contributingPlayers };
}
