export const GAME_LIST = [
  {
    href: "/kris-kringle",
    icon: "white-elephant",
    name: "Kris Kringle",
    subtitle: "White Elephant",
    description: "Open and steal gifts · live game board",
    iconBg: "#a4161a",
    tag: "main",
  },
  {
    href: "/secret-santa",
    icon: "secret-santa",
    name: "Secret Santa",
    subtitle: "Name draw",
    description: "Draw names · pass & reveal privately",
    iconBg: "#0f5132",
    tag: "main",
  },
  {
    href: "/trivia",
    icon: "trivia",
    name: "Trivia",
    subtitle: "15 questions",
    description: "Traditions, music, movies & food",
    iconBg: "#0284c7",
    tag: "warmup",
  },
  {
    href: "/charades",
    icon: "charades",
    name: "Charades",
    subtitle: "60 seconds",
    description: "Act it out · no words or sounds",
    iconBg: "#7c3aed",
    tag: "warmup",
  },
  {
    href: "/bingo",
    icon: "bingo",
    name: "Bingo",
    subtitle: "Random cards",
    description: "Mark squares · auto bingo detection",
    iconBg: "#0d9488",
    tag: "warmup",
  },
] as const;

export type Game = (typeof GAME_LIST)[number];
export const MAIN_GAMES = GAME_LIST.filter((g) => g.tag === "main");
export const WARMUP_GAMES = GAME_LIST.filter((g) => g.tag === "warmup");
