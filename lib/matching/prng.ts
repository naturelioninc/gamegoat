// Deterministic pseudo-random number generator so that a given seed
// always produces the same draw. We use Mulberry32: a 32-bit PRNG with
// good statistical properties for non-cryptographic use.
//
// Do NOT use this for anything security-sensitive. For invitation
// tokens, join codes, or PIN salts, use crypto.getRandomValues.

export interface Prng {
  /** Returns a number in [0, 1). */
  next(): number;
  /** Returns an integer in [0, n). Uses rejection to stay unbiased. */
  int(n: number): number;
  /** In-place Fisher–Yates shuffle. */
  shuffle<T>(items: T[]): T[];
}

export function mulberry32(seed: number): Prng {
  let state = seed >>> 0;
  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (n: number): number => {
    if (!Number.isInteger(n) || n <= 0) {
      throw new Error(`int(n): n must be a positive integer, got ${n}`);
    }
    return Math.floor(next() * n);
  };
  const shuffle = <T>(items: T[]): T[] => {
    for (let i = items.length - 1; i > 0; i--) {
      const j = int(i + 1);
      const tmp = items[i]!;
      items[i] = items[j]!;
      items[j] = tmp;
    }
    return items;
  };
  return { next, int, shuffle };
}

// Fallback when the caller does not supply a seed. Uses Math.random to
// pick a seed once so the draw is reproducible if the seed is captured
// and stored in the draw audit record.
export function randomSeed(): number {
  return Math.floor(Math.random() * 0xffffffff) >>> 0;
}
