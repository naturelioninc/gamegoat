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

  // ── Batch 2 ──────────────────────────────────────────────────────────────

  {
    question: "Which country has gifted London's Trafalgar Square a Christmas tree every year since 1947?",
    choices: ["Norway", "Sweden", "Denmark", "Finland"],
    answer: "Norway",
    explanation: "Norway sends the Trafalgar Square tree annually as a gesture of gratitude for Britain's support during the Second World War.",
    category: "traditions",
  },
  {
    question: "What is December 26th called in Canada and the United Kingdom?",
    choices: ["Boxing Day", "Twelfth Night", "Epiphany", "St. Nick's Day"],
    answer: "Boxing Day",
    explanation: "Boxing Day is a public holiday on December 26th celebrated in Canada, the UK, Australia, and other Commonwealth nations.",
    category: "traditions",
  },
  {
    question: "In which decade did it become common to send Christmas cards?",
    choices: ["1840s", "1880s", "1920s", "1960s"],
    answer: "1840s",
    explanation: "The first commercial Christmas card was designed in 1843 in England, and card-sending spread widely from the 1840s onward.",
    category: "traditions",
  },
  {
    question: "Which two decorations are most commonly placed at the very top of a Christmas tree?",
    choices: ["A star or an angel", "A Santa or a snowman", "Tinsel or lights", "A bow or a ribbon"],
    answer: "A star or an angel",
    explanation: "A star representing the Star of Bethlehem and an angel representing the heavenly announcement are both classic tree toppers.",
    category: "traditions",
  },
  {
    question: "Which song features the lyric 'Later on, we'll conspire, as we dream by the fire'?",
    choices: ["Winter Wonderland", "Let It Snow", "White Christmas", "Baby, It's Cold Outside"],
    answer: "Winter Wonderland",
    explanation: "'Winter Wonderland' by Felix Bernard includes the line 'Later on, we'll conspire, as we dream by the fire, to face unafraid, the plans that we've made.'",
    category: "music",
  },
  {
    question: "Which pop duo released 'Last Christmas' in 1984?",
    choices: ["Wham!", "Duran Duran", "Pet Shop Boys", "Hall & Oates"],
    answer: "Wham!",
    explanation: "'Last Christmas' was released by Wham! (George Michael and Andrew Ridgeley) in December 1984 and has become a perennial holiday hit.",
    category: "music",
  },
  {
    question: "Who composed 'Jingle Bells', originally published in 1857?",
    choices: ["James Lord Pierpont", "Franz Gruber", "George Frideric Handel", "Irving Berlin"],
    answer: "James Lord Pierpont",
    explanation: "'Jingle Bells' was written by James Lord Pierpont and originally published as 'The One Horse Open Sleigh.' It was not written as a Christmas song.",
    category: "music",
  },
  {
    question: "In 'Rudolph the Red-Nosed Reindeer', why do the other reindeer exclude Rudolph?",
    choices: [
      "His nose glows red",
      "He is too small to fly",
      "He arrives late every year",
      "He cannot sing carols",
    ],
    answer: "His nose glows red",
    explanation: "The other reindeer laughed and called him names because of his unusual glowing red nose — until it proved invaluable on a foggy Christmas Eve.",
    category: "music",
  },
  {
    question: "What is the main ingredient that gives Christmas pudding most of its bulk and sweetness?",
    choices: ["Dried fruit", "Fresh plums", "Chocolate", "Honey"],
    answer: "Dried fruit",
    explanation: "Christmas pudding (historically called plum pudding) is loaded with dried fruits — raisins, currants, and sultanas. Despite the name, it rarely contains actual plums.",
    category: "food",
  },
  {
    question: "Which spice is NOT typically found in traditional gingerbread?",
    choices: ["Turmeric", "Ginger", "Cinnamon", "Nutmeg"],
    answer: "Turmeric",
    explanation: "Classic gingerbread is spiced with ginger, cinnamon, cloves, and nutmeg. Turmeric is not part of the traditional recipe.",
    category: "food",
  },
  {
    question: "In North America, what do children traditionally leave out for Santa on Christmas Eve?",
    choices: ["Milk and cookies", "Carrot sticks", "Mince pies", "Hot chocolate"],
    answer: "Milk and cookies",
    explanation: "Leaving milk and cookies for Santa — and sometimes carrots for the reindeer — is a beloved North American Christmas tradition.",
    category: "food",
  },
  {
    question: "In 'A Christmas Story', what gift does Ralphie desperately want?",
    choices: ["A BB gun", "A bicycle", "A chemistry set", "A baseball mitt"],
    answer: "A BB gun",
    explanation: "Ralphie wants a Red Ryder Carbine Action 200-shot Range Model air rifle, but every adult warns him 'you'll shoot your eye out.'",
    category: "movies",
  },
  {
    question: "In 'The Polar Express', what is the first gift of Christmas that the boy receives?",
    choices: [
      "A bell from Santa's sleigh",
      "A golden ticket",
      "A snow globe",
      "A ride on the train",
    ],
    answer: "A bell from Santa's sleigh",
    explanation: "Santa gives the boy a bell from his sleigh as the first gift of Christmas — one that only believers can hear ring.",
    category: "movies",
  },
  {
    question: "In 'Love Actually', how does Mark confess his feelings to Juliet at her door?",
    choices: [
      "Handwritten cue cards",
      "A singing telegram",
      "A letter slipped under the door",
      "A phone call",
    ],
    answer: "Handwritten cue cards",
    explanation: "Mark (Andrew Lincoln) stands at Juliet's door holding a series of handwritten cue cards to silently declare his love in one of the film's most iconic scenes.",
    category: "movies",
  },
  {
    question: "What year was the movie 'Home Alone' first released?",
    choices: ["1990", "1988", "1992", "1994"],
    answer: "1990",
    explanation: "Home Alone was released in November 1990 and became one of the highest-grossing comedy films ever made, launching Macaulay Culkin to stardom.",
    category: "movies",
  },
] as const;
