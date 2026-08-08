import { describe, expect, it } from "vitest";
import { aggregateAnonymousGroupSignals } from "./gift-insights";

describe("anonymous group gift insights", () => {
  it("does not expose a signal supplied by only one person", () => {
    const result = aggregateAnonymousGroupSignals(
      [{ auth_user_id: "alice", item_text: "iPhone case", notes: null }],
      [{ auth_user_id: "alice", product_slug: "cozy-socks" }],
    );
    expect(result.themes).toEqual([]);
    expect(result.preferredSlugs).toEqual([]);
  });

  it("publishes overlap from two distinct users", () => {
    const result = aggregateAnonymousGroupSignals(
      [
        { auth_user_id: "alice", item_text: "iPhone case" },
        { auth_user_id: "bob", item_text: "A case for my iPhone" },
      ],
      [
        { auth_user_id: "alice", product_slug: "cozy-socks" },
        { auth_user_id: "bob", product_slug: "cozy-socks" },
      ],
    );
    expect(result.themes).toEqual([
      { label: "case", count: 2 },
      { label: "iphone", count: 2 },
    ]);
    expect(result.preferredSlugs).toEqual(["cozy-socks"]);
  });

  it("does not let one user inflate a count with repeated entries", () => {
    const result = aggregateAnonymousGroupSignals(
      [
        { auth_user_id: "alice", item_text: "coffee coffee" },
        { auth_user_id: "alice", item_text: "more coffee" },
      ],
      [],
    );
    expect(result.themes).toEqual([]);
    expect(result.contributingPlayers).toBe(1);
  });
});
