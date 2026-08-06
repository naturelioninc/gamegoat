export type CharadesCategory = "people" | "actions" | "movies and songs" | "things";

export interface CharadesPrompt {
  prompt: string;
  category: CharadesCategory;
}

export const CHRISTMAS_CHARADES: readonly CharadesPrompt[] = [
  // People
  { prompt: "Santa Claus", category: "people" },
  { prompt: "The Grinch", category: "people" },
  { prompt: "A Christmas elf", category: "people" },
  { prompt: "Rudolph", category: "people" },
  { prompt: "A snowman", category: "people" },
  { prompt: "Scrooge", category: "people" },
  { prompt: "The Sugar Plum Fairy", category: "people" },
  { prompt: "A carol singer", category: "people" },
  { prompt: "Mrs. Claus", category: "people" },
  { prompt: "Jack Frost", category: "people" },
  { prompt: "Buddy the Elf", category: "people" },
  { prompt: "A shepherd", category: "people" },
  // Actions
  { prompt: "Wrapping a present", category: "actions" },
  { prompt: "Decorating a Christmas tree", category: "actions" },
  { prompt: "Building a snowman", category: "actions" },
  { prompt: "Hanging Christmas lights", category: "actions" },
  { prompt: "Shovelling snow", category: "actions" },
  { prompt: "Opening a disappointing gift", category: "actions" },
  { prompt: "Catching Santa", category: "actions" },
  { prompt: "Drinking hot chocolate", category: "actions" },
  { prompt: "Making a snow angel", category: "actions" },
  { prompt: "Getting tangled in lights", category: "actions" },
  { prompt: "Sitting on Santa's lap", category: "actions" },
  { prompt: "Ice skating", category: "actions" },
  { prompt: "Eating too many Christmas cookies", category: "actions" },
  { prompt: "Writing a letter to Santa", category: "actions" },
  { prompt: "Sledding down a hill", category: "actions" },
  // Movies and songs
  { prompt: "Home Alone", category: "movies and songs" },
  { prompt: "Jingle Bells", category: "movies and songs" },
  { prompt: "The Nutcracker", category: "movies and songs" },
  { prompt: "Elf", category: "movies and songs" },
  { prompt: "Frosty the Snowman", category: "movies and songs" },
  { prompt: "The Polar Express", category: "movies and songs" },
  { prompt: "Silent Night", category: "movies and songs" },
  { prompt: "How the Grinch Stole Christmas", category: "movies and songs" },
  { prompt: "White Christmas", category: "movies and songs" },
  { prompt: "Love Actually", category: "movies and songs" },
  { prompt: "A Christmas Carol", category: "movies and songs" },
  { prompt: "It's a Wonderful Life", category: "movies and songs" },
  { prompt: "Rudolph the Red-Nosed Reindeer", category: "movies and songs" },
  // Things
  { prompt: "A candy cane", category: "things" },
  { prompt: "A gingerbread house", category: "things" },
  { prompt: "Mistletoe", category: "things" },
  { prompt: "An ugly Christmas sweater", category: "things" },
  { prompt: "A stocking", category: "things" },
  { prompt: "A sleigh", category: "things" },
  { prompt: "A snow globe", category: "things" },
  { prompt: "A lump of coal", category: "things" },
  { prompt: "A Christmas cracker", category: "things" },
  { prompt: "A plate of cookies", category: "things" },
  { prompt: "Wrapping paper", category: "things" },
  { prompt: "A reindeer antler headband", category: "things" },
  { prompt: "An Advent calendar", category: "things" },
  { prompt: "A Christmas turkey", category: "things" },
  { prompt: "A partridge in a pear tree", category: "things" },
  { prompt: "A star on top of the tree", category: "things" },
] as const;

export function nextCharadesIndex(length: number, previous: number, random = Math.random) {
  if (length < 2) throw new Error("Charades needs at least two prompts.");
  const candidate = Math.floor(random() * (length - 1));
  return candidate >= previous ? candidate + 1 : candidate;
}
