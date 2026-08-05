export interface TriviaQuestion {
  question: string;
  choices: readonly string[];
  answer: string;
  explanation: string;
  category: "traditions" | "music" | "movies" | "food";
}

export const CHRISTMAS_TRIVIA: readonly TriviaQuestion[] = [
  {
    question: "Which country is widely credited with starting the Christmas tree tradition?",
    choices: ["Germany", "France", "Canada", "Italy"],
    answer: "Germany",
    explanation: "The modern decorated-tree tradition is commonly traced to Germany.",
    category: "traditions",
  },
  {
    question: "In 'The Twelve Days of Christmas,' what is given on the fifth day?",
    choices: ["Five calling birds", "Five gold rings", "Five French hens", "Five silver bells"],
    answer: "Five gold rings",
    explanation: "The famous fifth-day gift is five gold rings.",
    category: "music",
  },
  {
    question: "What red-and-white plant is strongly associated with Christmas?",
    choices: ["Poinsettia", "Tulip", "Daffodil", "Lavender"],
    answer: "Poinsettia",
    explanation:
      "Poinsettias became a popular Christmas plant because of their festive red bracts.",
    category: "traditions",
  },
  {
    question: "Which ballet features the Sugar Plum Fairy?",
    choices: ["Swan Lake", "Coppélia", "The Nutcracker", "Sleeping Beauty"],
    answer: "The Nutcracker",
    explanation: "The Sugar Plum Fairy appears in Tchaikovsky's The Nutcracker.",
    category: "music",
  },
  {
    question: "What creamy holiday drink is traditionally made with eggs, milk, and spices?",
    choices: ["Eggnog", "Mulled cider", "Hot chocolate", "Wassail"],
    answer: "Eggnog",
    explanation: "Eggnog typically combines milk or cream, eggs, sugar, and warming spices.",
    category: "food",
  },
  {
    question:
      "In Home Alone, where is the McCallister family travelling when Kevin is left behind?",
    choices: ["London", "Rome", "New York", "Paris"],
    answer: "Paris",
    explanation: "The family flies to Paris while Kevin remains at their Chicago-area home.",
    category: "movies",
  },
  {
    question: "What decoration is traditionally hung where people may share a kiss?",
    choices: ["Holly", "Mistletoe", "Ivy", "Tinsel"],
    answer: "Mistletoe",
    explanation: "Kissing beneath mistletoe is a long-standing holiday custom.",
    category: "traditions",
  },
  {
    question: "Which reindeer's name begins with the letter B?",
    choices: ["Blitzen", "Comet", "Dasher", "Vixen"],
    answer: "Blitzen",
    explanation: "Blitzen is one of the eight reindeer named in the classic poem.",
    category: "traditions",
  },
  {
    question: "What is the name of the Grinch's dog?",
    choices: ["Max", "Buddy", "Sam", "Ralph"],
    answer: "Max",
    explanation: "Max is the Grinch's loyal dog and reluctant reindeer helper.",
    category: "movies",
  },
  {
    question: "Which song begins with the instruction to decorate with holly?",
    choices: ["Jingle Bells", "Silent Night", "Deck the Halls", "O Christmas Tree"],
    answer: "Deck the Halls",
    explanation: "Deck the Halls opens by inviting everyone to decorate with holly.",
    category: "music",
  },
  {
    question: "What spice is commonly pushed into oranges to make Christmas pomanders?",
    choices: ["Nutmeg", "Cardamom", "Ginger", "Cloves"],
    answer: "Cloves",
    explanation: "Whole cloves are pressed into oranges to create fragrant pomanders.",
    category: "food",
  },
  {
    question: "In Elf, what is the first rule of the Code of Elves?",
    choices: [
      "Sing loudly for all to hear",
      "Treat every day like Christmas",
      "Always carry maple syrup",
      "Never leave the North Pole",
    ],
    answer: "Treat every day like Christmas",
    explanation: "Buddy recites this as the first rule of the Code of Elves.",
    category: "movies",
  },
  {
    question: "What sweet structure is often decorated with icing and candy at Christmas?",
    choices: ["Fruitcake tower", "Shortbread castle", "Gingerbread house", "Candy-cane cabin"],
    answer: "Gingerbread house",
    explanation: "Decorating gingerbread houses is a popular family Christmas activity.",
    category: "food",
  },
  {
    question: "Who recorded the hit song 'All I Want for Christmas Is You'?",
    choices: ["Whitney Houston", "Céline Dion", "Kelly Clarkson", "Mariah Carey"],
    answer: "Mariah Carey",
    explanation: "Mariah Carey released the modern Christmas hit in 1994.",
    category: "music",
  },
  {
    question: "What do people traditionally count down with an Advent calendar?",
    choices: [
      "The reindeer",
      "The days until Christmas",
      "The gifts under the tree",
      "The weeks until New Year",
    ],
    answer: "The days until Christmas",
    explanation: "Advent calendars reveal a small door or item each day leading up to Christmas.",
    category: "traditions",
  },
] as const;
