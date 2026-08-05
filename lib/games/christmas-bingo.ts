export const CHRISTMAS_BINGO_ITEMS = [
  "Candy cane",
  "Christmas tree",
  "Snowman",
  "Stocking",
  "Wrapped gift",
  "Santa hat",
  "Reindeer",
  "Sleigh",
  "Mistletoe",
  "Gingerbread house",
  "Christmas lights",
  "Snowflake",
  "Hot chocolate",
  "Christmas cookies",
  "Wreath",
  "Jingle bells",
  "Elf",
  "Nutcracker",
  "Fireplace",
  "Ornament",
  "Christmas cracker",
  "Poinsettia",
  "Carollers",
  "North Pole",
  "Ugly sweater",
  "Toy train",
  "Snow globe",
  "Star",
  "Angel",
  "Turkey dinner",
  "Cranberry sauce",
  "Fruitcake",
  "Milk and cookies",
  "Ice skates",
  "Winter mittens",
  "Scarf",
  "Christmas card",
  "Advent calendar",
  "Chimney",
  "Rudolph's nose",
  "Tinsel",
  "Ribbon bow",
  "Christmas movie",
  "Festive socks",
  "Pine cone",
  "Cookie tray",
  "Gift tag",
  "Family photo",
  "Christmas music",
  "Paper snowflake",
  "Festive mug",
  "Plum pudding",
  "Toy soldier",
  "Icicle",
] as const;

export const FREE_SPACE = "FREE";

export function shuffled<T>(items: readonly T[], random = Math.random) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index--) {
    const swap = Math.floor(random() * (index + 1));
    [result[index], result[swap]] = [result[swap]!, result[index]!];
  }
  return result;
}

export function generateBingoCard(random = Math.random) {
  const card = shuffled(CHRISTMAS_BINGO_ITEMS, random).slice(0, 24) as string[];
  card.splice(12, 0, FREE_SPACE);
  return card;
}

export const BINGO_LINES = [
  [0, 1, 2, 3, 4],
  [5, 6, 7, 8, 9],
  [10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19],
  [20, 21, 22, 23, 24],
  [0, 5, 10, 15, 20],
  [1, 6, 11, 16, 21],
  [2, 7, 12, 17, 22],
  [3, 8, 13, 18, 23],
  [4, 9, 14, 19, 24],
  [0, 6, 12, 18, 24],
  [4, 8, 12, 16, 20],
] as const;

export function hasBingo(marked: ReadonlySet<number>) {
  return BINGO_LINES.some((line) => line.every((index) => marked.has(index)));
}
