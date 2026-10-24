import type { QuizQuestion } from "../lib/quiz.js";
import { getDb } from "../db/index.js";
import { lessons as lessonsTable, subjects as subjectsTable } from "../db/schema.js";

export const SCIENCE_SUBJECT_ID = "11111111-1111-4111-8111-111111111111";
export const READING_SUBJECT_ID = "22222222-2222-4222-8222-222222222222";

export interface SeedSubject {
  id: string;
  slug: string;
  title: string;
  isActive: boolean;
}

export interface SeedLesson {
  id: string;
  subjectId: string;
  title: string;
  contentMd: string;
  readingMinutes: number;
  version: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const seededAt = (day: number, hour = 9): string =>
  `2026-01-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:00:00.000Z`;

export const seedSubjects: SeedSubject[] = [
  {
    id: SCIENCE_SUBJECT_ID,
    slug: "science",
    title: "Science Explorers",
    isActive: true,
  },
  {
    id: READING_SUBJECT_ID,
    slug: "reading",
    title: "Reading Detectives",
    isActive: true,
  },
];

export const seedLessons: SeedLesson[] = [
  {
    id: "b1b1b1b1-1111-4111-8111-111111111111",
    subjectId: SCIENCE_SUBJECT_ID,
    title: "The Water Cycle",
    readingMinutes: 3,
    version: 1,
    isActive: true,
    createdAt: seededAt(2, 9),
    updatedAt: seededAt(2, 9),
    contentMd: `## The journey of a raindrop

Water on Earth is always moving. The Sun heats water in oceans, lakes, and rivers. The water turns into an invisible gas called **water vapor**. This is called **evaporation**.

As the vapor rises, it cools down and turns back into tiny droplets. Those droplets gather to make **clouds**. This is called **condensation**.

When the droplets get heavy, they fall as **precipitation** — rain, snow, sleet, or hail. Some water sinks into the ground, and some flows downhill into streams and rivers. Eventually, much of it returns to the ocean, and the journey starts again.

This loop is called the **water cycle**. It keeps Earth's fresh water moving and helps plants, animals, and people get the water they need.`,
  },
  {
    id: "b1b1b1b1-2222-4222-8222-222222222222",
    subjectId: SCIENCE_SUBJECT_ID,
    title: "How Plants Make Food",
    readingMinutes: 3,
    version: 1,
    isActive: true,
    createdAt: seededAt(2, 10),
    updatedAt: seededAt(2, 10),
    contentMd: `## Green kitchens

Plants make their own food using sunlight, water, and air. This process is called **photosynthesis**.

Leaves contain a green pigment called **chlorophyll**. Chlorophyll captures energy from sunlight. Inside the leaf, the plant takes in carbon dioxide from the air and water from the soil. It uses the Sun's energy to turn them into a sugar called **glucose**. Oxygen is released as a by-product.

The plant uses glucose for energy and stores extra sugar as starch. Roots soak up water and minerals, while the stem carries them upward to the leaves.

Photosynthesis happens mostly in the leaves, which is one reason leaves are flat and wide — they need as much sunlight as possible.`,
  },
  {
    id: "b1b1b1b1-3333-4333-8333-333333333333",
    subjectId: SCIENCE_SUBJECT_ID,
    title: "Why the Moon Changes Shape",
    readingMinutes: 2,
    version: 1,
    isActive: true,
    createdAt: seededAt(2, 11),
    updatedAt: seededAt(2, 11),
    contentMd: `## Why the Moon changes shape

The Moon does not make its own light. It shines because it reflects light from the Sun.

As the Moon travels around Earth, we see different amounts of its sunlit side. These changing shapes are called **phases**. A **new moon** happens when the lit side faces away from Earth. A **full moon** happens when the whole lit side faces Earth.

The Moon takes about 29.5 days to go through all its phases. The phases repeat in the same order: new moon, crescent, quarter, gibbous, then full moon, and back again.

The Moon's shape does not really change. Only our view of its bright side changes.`,
  },
  {
    id: "b2b2b2b2-1111-4111-8111-111111111111",
    subjectId: READING_SUBJECT_ID,
    title: "Finding the Main Idea",
    readingMinutes: 2,
    version: 1,
    isActive: true,
    createdAt: seededAt(3, 9),
    updatedAt: seededAt(3, 9),
    contentMd: `## Finding the main idea

The **main idea** is the most important point in a paragraph or story. Every other sentence should help explain or support it.

To find the main idea, ask: *What is this mostly about?* Look at the title, the first sentence, and the last sentence. Notice which idea appears again and again.

Supporting details are the facts, examples, and reasons that explain the main idea. A good summary includes the main idea and only the most important details.

Try this: read a short paragraph, cover it, and say the main point in one sentence. If your sentence matches the paragraph's big idea, you have found it.`,
  },
  {
    id: "b2b2b2b2-2222-4222-8222-222222222222",
    subjectId: READING_SUBJECT_ID,
    title: "Where a Story Happens",
    readingMinutes: 2,
    version: 1,
    isActive: true,
    createdAt: seededAt(3, 10),
    updatedAt: seededAt(3, 10),
    contentMd: `## Where a story happens

The **setting** is where and when a story takes place. It can be a real place, like a kitchen, or an imaginary one, like a castle in the clouds.

Setting includes more than location. It also includes time — morning or midnight, summer or winter, long ago or far in the future. Weather, sounds, and smells help readers picture the place.

Writers use setting to create mood. A dark, stormy forest feels different from a sunny beach. Setting can also shape what characters can do. A story on a small boat has different possibilities than a story in a busy city.

As you read, ask: *Where are we? When are we? How does this place make the characters feel?*`,
  },
  {
    id: "b2b2b2b2-3333-4333-8333-333333333333",
    subjectId: READING_SUBJECT_ID,
    title: "Be a Word Detective",
    readingMinutes: 3,
    version: 1,
    isActive: true,
    createdAt: seededAt(3, 11),
    updatedAt: seededAt(3, 11),
    contentMd: `## Be a word detective

When you meet an unfamiliar word, you do not always need a dictionary. **Context clues** are hints in the sentences around the word.

One kind of clue is a **definition**. The sentence may explain the word right after using it: "The pupa, or resting stage, was hidden under a leaf."

Another kind is an **example**. "She felt famished — so hungry she could eat a whole pot of soup." The example explains what *famished* means.

**Contrast** clues show the opposite: "The trail was rugged, not smooth or easy." Antonyms and nearby descriptive words can also help.

Slow down, read the whole sentence, and make a guess. Then check whether your guess makes sense in the rest of the paragraph.`,
  },
];

/**
 * Offline provider bank used only when AI_PROVIDER=stub (the default when no AI
 * key is present). Every question is grounded in the approved lesson above and
 * goes through the same structural validation as a live model response.
 */
export const offlineQuizBank: Record<string, QuizQuestion[]> = {
  "b1b1b1b1-1111-4111-8111-111111111111": [
    {
      prompt: "What happens during evaporation?",
      options: [
        "Water freezes into solid ice.",
        "Water turns into an invisible gas called water vapor.",
        "Clouds fall to the ground as rain.",
        "Water sinks deep into the soil.",
      ],
      correctIndex: 1,
      explanation: "The Sun heats water and turns it into water vapor. That process is evaporation.",
    },
    {
      prompt: "How do clouds form?",
      options: [
        "Water vapor cools and tiny droplets gather together.",
        "Raindrops freeze together high in the sky.",
        "Wind pushes water up from the ocean.",
        "The Sun makes clouds out of dust.",
      ],
      correctIndex: 0,
      explanation: "Cooling vapor turns into tiny droplets that gather into clouds, which is condensation.",
    },
    {
      prompt: "Which of these is an example of precipitation?",
      options: ["Snow falling from a cloud", "Water turning into vapor", "Vapor cooling into droplets", "Water flowing in a river"],
      correctIndex: 0,
      explanation: "Precipitation is water falling from clouds as rain, snow, sleet, or hail.",
    },
    {
      prompt: "Which order matches the water cycle?",
      options: [
        "Precipitation, then evaporation, then condensation",
        "Evaporation, then condensation, then precipitation",
        "Condensation, then precipitation, then evaporation",
        "Evaporation, then precipitation, then condensation",
      ],
      correctIndex: 1,
      explanation: "Water evaporates, condenses into clouds, and then falls as precipitation.",
    },
    {
      prompt: "Why is the water cycle important?",
      options: [
        "It keeps Earth's fresh water moving for living things.",
        "It stops the ocean from ever changing.",
        "It makes new water appear from nowhere.",
        "It keeps clouds in one place forever.",
      ],
      correctIndex: 0,
      explanation: "The cycle moves fresh water around so plants, animals, and people can use it.",
    },
  ],
  "b1b1b1b1-2222-4222-8222-222222222222": [
    {
      prompt: "What is photosynthesis?",
      options: [
        "The way plants soak up minerals from soil.",
        "The process plants use to make food from sunlight, water, and air.",
        "The way leaves lose water on a hot day.",
        "The process of seeds traveling on the wind.",
      ],
      correctIndex: 1,
      explanation: "Photosynthesis is how plants use sunlight, water, and air to make their own food.",
    },
    {
      prompt: "What does chlorophyll do?",
      options: [
        "It carries water up the stem.",
        "It captures energy from sunlight.",
        "It releases oxygen into the soil.",
        "It turns glucose back into sunlight.",
      ],
      correctIndex: 1,
      explanation: "Chlorophyll is the green pigment in leaves that captures energy from sunlight.",
    },
    {
      prompt: "Which gas do plants take in from the air?",
      options: ["Oxygen", "Nitrogen", "Carbon dioxide", "Water vapor"],
      correctIndex: 2,
      explanation: "Plants take in carbon dioxide from the air to help make glucose.",
    },
    {
      prompt: "What is released as a by-product of photosynthesis?",
      options: ["Sugar", "Starch", "Carbon dioxide", "Oxygen"],
      correctIndex: 3,
      explanation: "Oxygen is released as a by-product while the plant makes glucose.",
    },
    {
      prompt: "Why are leaves usually flat and wide?",
      options: [
        "To catch as much sunlight as possible.",
        "To store extra water for winter.",
        "To keep insects from landing on them.",
        "To help the plant move toward the Sun.",
      ],
      correctIndex: 0,
      explanation: "Flat, wide leaves give the plant a large surface for catching sunlight.",
    },
  ],
  "b1b1b1b1-3333-4333-8333-333333333333": [
    {
      prompt: "Why does the Moon shine?",
      options: [
        "It makes its own light from inside.",
        "It is covered in glowing rocks.",
        "It reflects light from the Sun.",
        "It catches light from Earth's cities.",
      ],
      correctIndex: 2,
      explanation: "The Moon has no light of its own. We see sunlight reflected from its surface.",
    },
    {
      prompt: "What causes the Moon's phases?",
      options: [
        "Clouds passing in front of the Moon.",
        "We see different amounts of its sunlit side as it travels around Earth.",
        "Earth's shadow covers the whole Moon each week.",
        "The Moon spins faster at night.",
      ],
      correctIndex: 1,
      explanation: "As the Moon orbits Earth, we see changing amounts of its sunlit side, creating phases.",
    },
    {
      prompt: "What happens during a new moon?",
      options: [
        "The lit side of the Moon faces away from Earth.",
        "The whole lit side of the Moon faces Earth.",
        "The Moon stops moving for one night.",
        "The Moon turns completely dark inside.",
      ],
      correctIndex: 0,
      explanation: "At a new moon, the sunlit side faces away from Earth, so we see very little of it.",
    },
    {
      prompt: "How long does the Moon take to complete all its phases?",
      options: ["About 7 days", "About 14 days", "About 365 days", "About 29.5 days"],
      correctIndex: 3,
      explanation: "The Moon goes through its full cycle of phases in about 29.5 days.",
    },
    {
      prompt: "Does the Moon's actual shape change during the month?",
      options: [
        "Yes, it grows and shrinks like a balloon.",
        "Yes, pieces of the Moon break off each night.",
        "No, only our view of its bright side changes.",
        "No, it disappears completely every week.",
      ],
      correctIndex: 2,
      explanation: "The Moon's shape stays the same. The phases come from our changing view of its lit side.",
    },
  ],
  "b2b2b2b2-1111-4111-8111-111111111111": [
    {
      prompt: "What is the main idea of a paragraph?",
      options: [
        "The longest sentence in the paragraph.",
        "The most important point the paragraph makes.",
        "The first word of the title.",
        "A small detail that appears once.",
      ],
      correctIndex: 1,
      explanation: "The main idea is the most important point. The other sentences should support it.",
    },
    {
      prompt: "What should a good summary include?",
      options: [
        "The main idea and only the most important details.",
        "Every word from the original paragraph.",
        "Only your opinion about the paragraph.",
        "As many small details as possible.",
      ],
      correctIndex: 0,
      explanation: "A summary keeps the main idea and the most important supporting details.",
    },
    {
      prompt: "Which question helps you find the main idea?",
      options: [
        "How many sentences are there?",
        "What is the longest word?",
        "What is this mostly about?",
        "Who wrote the paragraph?",
      ],
      correctIndex: 2,
      explanation: "Asking what the text is mostly about points you toward the main idea.",
    },
    {
      prompt: "What are supporting details?",
      options: [
        "The title and author of the story.",
        "Words that are difficult to read.",
        "The last sentence only.",
        "Facts, examples, and reasons that explain the main idea.",
      ],
      correctIndex: 3,
      explanation: "Supporting details are facts, examples, and reasons that explain the main idea.",
    },
    {
      prompt: "Which strategy does the lesson suggest?",
      options: [
        "Read only the title and skip the paragraph.",
        "Cover the paragraph and say its main point in one sentence.",
        "Copy every sentence into a notebook.",
        "Count how many times each word appears.",
      ],
      correctIndex: 1,
      explanation: "Covering the text and stating the main point in one sentence checks your understanding.",
    },
  ],
  "b2b2b2b2-2222-4222-8222-222222222222": [
    {
      prompt: "What does setting include?",
      options: [
        "Where and when a story takes place.",
        "Only the main character's name.",
        "The problem the character must solve.",
        "The lesson the story teaches.",
      ],
      correctIndex: 0,
      explanation: "Setting is where and when a story happens, including time, weather, and surroundings.",
    },
    {
      prompt: "Which detail is part of a story's setting?",
      options: [
        "The hero's favourite colour.",
        "The surprise at the end of the story.",
        "Midnight in a snowy village.",
        "The lesson the hero learns.",
      ],
      correctIndex: 2,
      explanation: "Midnight and a snowy village describe both the time and place, which are setting details.",
    },
    {
      prompt: "How can setting affect the mood of a story?",
      options: [
        "It changes the number of pages in the book.",
        "A dark, stormy forest feels different from a sunny beach.",
        "It decides who the author is.",
        "It makes every story feel exactly the same.",
      ],
      correctIndex: 1,
      explanation: "Writers use setting to create mood, and a stormy forest feels different from a sunny beach.",
    },
    {
      prompt: "How can setting shape what happens in a story?",
      options: [
        "It has no effect on the characters.",
        "It only matters in stories about weather.",
        "It tells the reader the author's name.",
        "It affects what characters can do and what is possible.",
      ],
      correctIndex: 3,
      explanation: "A small boat and a busy city allow different actions, so setting shapes the story.",
    },
    {
      prompt: "Which question should you ask about setting?",
      options: [
        "Where and when are we, and how does this place feel?",
        "How many characters are in the story?",
        "What is the main idea of the story?",
        "Which word is the longest?",
      ],
      correctIndex: 0,
      explanation: "The lesson suggests asking where and when the story happens and how the place feels.",
    },
  ],
  "b2b2b2b2-3333-4333-8333-333333333333": [
    {
      prompt: "What are context clues?",
      options: [
        "Pictures printed next to a word.",
        "The letters at the start of a word.",
        "Hints in the nearby words and sentences.",
        "A list of words at the end of a book.",
      ],
      correctIndex: 2,
      explanation: "Context clues are hints in the surrounding text that help you work out a word's meaning.",
    },
    {
      prompt: "Which sentence uses a definition clue?",
      options: [
        "The trail was rugged, not smooth or easy.",
        'The pupa, or resting stage, was hidden under a leaf.',
        "She felt famished after the long walk.",
        "The wind howled through the trees.",
      ],
      correctIndex: 1,
      explanation: "The sentence explains the word pupa right after using it, which is a definition clue.",
    },
    {
      prompt: "Which sentence uses an example clue?",
      options: [
        "She felt famished — so hungry she could eat a whole pot of soup.",
        "The pupa, or resting stage, was hidden under a leaf.",
        "The trail was rugged, not smooth or easy.",
        "The library was quiet.",
      ],
      correctIndex: 0,
      explanation: "The example of eating a whole pot of soup explains what famished means.",
    },
    {
      prompt: "Which sentence uses a contrast clue?",
      options: [
        "The pupa, or resting stage, was hidden under a leaf.",
        "She felt famished after the long walk.",
        "The library was warm and bright.",
        "The trail was rugged, not smooth or easy.",
      ],
      correctIndex: 3,
      explanation: "The phrase not smooth or easy contrasts with rugged, helping explain the word.",
    },
    {
      prompt: "What should you do when you meet an unknown word?",
      options: [
        "Skip the rest of the paragraph.",
        "Ask someone to read it for you.",
        "Read the whole sentence, make a guess, and check that it makes sense.",
        "Close the book and choose another one.",
      ],
      correctIndex: 2,
      explanation: "The lesson suggests slowing down, reading the sentence, guessing, and checking the meaning.",
    },
  ],
};

/**
 * Idempotent seed. Re-running updates the approved lesson text while keeping
 * lesson ids and versions stable, so cached quizzes remain tied to a version.
 */
export async function seedDatabase(): Promise<void> {
  const db = await getDb();

  for (const subject of seedSubjects) {
    await db
      .insert(subjectsTable)
      .values(subject)
      .onConflictDoUpdate({
        target: subjectsTable.id,
        set: {
          slug: subject.slug,
          title: subject.title,
          isActive: subject.isActive,
        },
      });
  }

  for (const lesson of seedLessons) {
    await db
      .insert(lessonsTable)
      .values(lesson)
      .onConflictDoUpdate({
        target: lessonsTable.id,
        set: {
          subjectId: lesson.subjectId,
          title: lesson.title,
          contentMd: lesson.contentMd,
          readingMinutes: lesson.readingMinutes,
          version: lesson.version,
          isActive: lesson.isActive,
          updatedAt: lesson.updatedAt,
        },
      });
  }

  console.log(
    `Seed complete: ${seedSubjects.length} subjects and ${seedLessons.length} lessons are ready.`,
  );
}
