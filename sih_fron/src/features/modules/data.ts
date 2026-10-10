// --- TYPES ---
type Step = { title: string; description: string };
type QuizQuestion = { question: string; options: string[]; answer: number }; // New Quiz Type
export type Module = {
  id: string;
  name: string;
  color: string;
  steps: Step[];
  quiz: QuizQuestion;
};

// --- DATA ---
export const modules: Module[] = [
  {
    id: "earthquake",
    name: "Earthquake Safety",
    color: "bg-amber-600",
    steps: [
      {
        title: "Drop, Cover, Hold",
        description:
          "Drop down, take cover under a sturdy table, and hold on tight!",
      },
      {
        title: "Stay Away from Glass",
        description:
          "Keep away from windows and heavy furniture that might tip over.",
      },
      {
        title: "Don't Rush Outside",
        description:
          "Stay inside until the shaking stops. It is safer indoors during the quake.",
      },
    ],
    quiz: {
      question: "What is the first thing you should do when the ground shakes?",
      options: [
        "Run outside fast",
        "Drop, Cover, and Hold",
        "Stand near a window",
      ],
      answer: 1, // Index of correct answer
    },
  },
  {
    id: "fire",
    name: "Fire Safety",
    color: "bg-red-600",
    steps: [
      {
        title: "Stop, Drop, and Roll",
        description:
          "If your clothes catch fire: Stop moving, Drop to the ground, and Roll over.",
      },
      {
        title: "Crawl Low",
        description:
          "Smoke rises up. Stay low to the floor where the air is cleaner.",
      },
      {
        title: "Don't Hide",
        description:
          "Don't hide under beds. Firefighters need to find you quickly!",
      },
    ],
    quiz: {
      question: "If there is smoke in the room, what should you do?",
      options: [
        "Crawl low on the floor",
        "Stand up and run",
        "Hide in the closet",
      ],
      answer: 0,
    },
  },
  {
    id: "flood",
    name: "Flood Safety",
    color: "bg-blue-600",
    steps: [
      {
        title: "Move to High Ground",
        description:
          "If water starts rising, get to the highest floor or a hill nearby.",
      },
      {
        title: "Turn Off Power",
        description:
          "Ask an adult to turn off the main power switch immediately.",
      },
      {
        title: "Don't Walk in Water",
        description: "Flood water moves fast and can be dirty. Stay out of it!",
      },
    ],
    quiz: {
      question: "Why should you avoid walking in flood water?",
      options: [
        "It is too cold",
        "It moves fast and can be dirty",
        "It ruins your shoes",
      ],
      answer: 1,
    },
  },
  {
    id: "cyclone",
    name: "Cyclone Safety",
    color: "bg-teal-600",
    steps: [
      {
        title: "Secure the House",
        description:
          "Help parents close windows and bring outdoor toys inside.",
      },
      {
        title: "Emergency Kit",
        description:
          "Make sure you have flashlights, batteries, and water ready.",
      },
      {
        title: "Stay Indoors",
        description:
          "Do not go outside, even if it looks calm. The wind can return suddenly.",
      },
    ],
    quiz: {
      question: "Where should you stay during a cyclone?",
      options: ["On the roof", "In the garden", "Indoors away from windows"],
      answer: 2,
    },
  },
];
