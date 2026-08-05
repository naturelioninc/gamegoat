import { mulberry32, randomSeed } from "./prng";

export interface Assignment {
  giverId: string;
  recipientId: string;
}

export type DrawResult =
  | { ok: true; assignments: Assignment[]; seed: number }
  | { ok: false; reason: string };

export function draw(members: string[], exclusions: [string, string][] = []): DrawResult {
  if (members.length < 2) return { ok: false, reason: "Need at least 2 participants." };

  const ids = new Set(members);
  if (ids.size !== members.length) return { ok: false, reason: "Duplicate names found." };

  const seed = randomSeed();
  const prng = mulberry32(seed);
  const n = members.length;
  const indexById = new Map(members.map((id, i) => [id, i]));

  const adj: boolean[][] = Array.from({ length: n }, () => new Array<boolean>(n).fill(true));
  for (let i = 0; i < n; i++) adj[i]![i] = false;
  for (const [giver, recipient] of exclusions) {
    const g = indexById.get(giver);
    const r = indexById.get(recipient);
    if (g !== undefined && r !== undefined) adj[g]![r] = false;
  }

  const giverOrder = prng.shuffle(Array.from({ length: n }, (_, i) => i));
  const candidatesByGiver: number[][] = Array.from({ length: n }, (_, g) => {
    const cands: number[] = [];
    for (let r = 0; r < n; r++) if (adj[g]![r]) cands.push(r);
    return prng.shuffle(cands);
  });

  const matchedGiverOf = new Array<number | -1>(n).fill(-1);
  const tryAssign = (g: number, visited: boolean[]): boolean => {
    for (const r of candidatesByGiver[g]!) {
      if (visited[r]) continue;
      visited[r] = true;
      if (matchedGiverOf[r] === -1 || tryAssign(matchedGiverOf[r]!, visited)) {
        matchedGiverOf[r] = g;
        return true;
      }
    }
    return false;
  };

  let matched = 0;
  for (const g of giverOrder) {
    if (tryAssign(g, new Array<boolean>(n).fill(false))) matched++;
  }

  if (matched !== n) {
    return {
      ok: false,
      reason: "The exclusions make a valid draw impossible. Try removing some.",
    };
  }

  const assignments: Assignment[] = new Array(n);
  for (let r = 0; r < n; r++) {
    const g = matchedGiverOf[r]!;
    assignments[g] = { giverId: members[g]!, recipientId: members[r]! };
  }
  return { ok: true, assignments, seed };
}
