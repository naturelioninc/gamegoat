export type CharadesCategory = "people" | "actions" | "movies and songs" | "things";

export interface CharadesPrompt {
  prompt: string;
  category: CharadesCategory;
}

export const CHRISTMAS_CHARADES: readonly CharadesPrompt[] = [
  { prompt: "Santa Claus", category: "people" },
  { prompt: "The Grinch", category: "people" },
  { prompt: "A Christmas elf", category: "people" },
  { prompt: "Rudolph", category: "people" },
  { prompt: "A snowman", category: "people" },
  { prompt: "Scrooge", category: "people" },
  { prompt: "The Sugar Plum Fairy", category: "people" },
  { prompt: "A carol singer", category: "people" },
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
  { prompt: "Home Alone", category: "movies and songs" },
  { prompt: "Jingle Bells", category: "movies and songs" },
  { prompt: "The Nutcracker", category: "movies and songs" },
  { prompt: "Elf", category: "movies and songs" },
  { prompt: "Frosty the Snowman", category: "movies and songs" },
  { prompt: "The Polar Express", category: "movies and songs" },
  { prompt: "Silent Night", category: "movies and songs" },
  { prompt: "How the Grinch Stole Christmas", category: "movies and songs" },
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
] as const;

export function nextCharadesIndex(length: number, previous: number, random = Math.random) {
  if (length < 2) throw new Error("Charades needs at least two prompts.");
  const candidate = Math.floor(random() * (length - 1));
  return candidate >= previous ? candidate + 1 : candidate;
}
