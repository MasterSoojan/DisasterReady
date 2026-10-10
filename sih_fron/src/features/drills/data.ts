/* ---------- TYPES ---------- */
export type Step = { text: string; correct: boolean; hint: string };
export type Drill = {
  id: string;
  name: string;
  description: string;
  icon: "fire" | "earthquake" | "flood";
  steps: Step[];
  color: string;
  bgSound: string;
  difficulty: number;
};

/* ---------- DATA ---------- */
export const drills: Drill[] = [
  {
    id: "fire",
    name: "Operation: Inferno",
    description: "Escape a burning building safely.",
    color: "bg-red-600",
    bgSound: "/sounds/siren.mp3",
    difficulty: 3,
    icon: "fire",
    steps: [
      {
        text: "Activate the Fire Alarm",
        correct: true,
        hint: "Alert everyone first!",
      },
      {
        text: "Use the Elevator",
        correct: false,
        hint: "Elevators can trap you!",
      },
      {
        text: "Crawl low under smoke",
        correct: true,
        hint: "Air is cleaner near the floor.",
      },
      {
        text: "Check door handles for heat",
        correct: true,
        hint: "Fire might be on the other side.",
      },
      {
        text: "Open windows to breathe",
        correct: false,
        hint: "Oxygen feeds the fire!",
      },
    ],
  },
  {
    id: "earthquake",
    name: "Operation: Tremor",
    description: "Survive a magnitude 8.0 quake.",
    color: "bg-yellow-600",
    bgSound: "/sounds/rumble.mp3",
    difficulty: 2,
    icon: "earthquake",
    steps: [
      {
        text: "Drop, Cover, and Hold On",
        correct: true,
        hint: "Protect your head!",
      },
      {
        text: "Run outside immediately",
        correct: false,
        hint: "Falling glass is dangerous outside.",
      },
      {
        text: "Stay away from windows",
        correct: true,
        hint: "Glass can shatter inward.",
      },
      {
        text: "Stand in a doorway",
        correct: false,
        hint: "Doorways are not stronger anymore.",
      },
      {
        text: "Wait for shaking to stop",
        correct: true,
        hint: "Patience saves lives.",
      },
    ],
  },
  {
    id: "flood",
    name: "Operation: High Tide",
    description: "Evacuate rising floodwaters.",
    color: "bg-blue-600",
    bgSound: "/sounds/water.mp3",
    difficulty: 4,
    icon: "flood",
    steps: [
      {
        text: "Move to higher ground",
        correct: true,
        hint: "Water flows downhill.",
      },
      {
        text: "Walk through the water",
        correct: false,
        hint: "6 inches of water can knock you down!",
      },
      {
        text: "Turn off main power",
        correct: true,
        hint: "Prevent electrocution.",
      },
      {
        text: "Drink tap water",
        correct: false,
        hint: "It might be contaminated.",
      },
      {
        text: "Listen to emergency radio",
        correct: true,
        hint: "Stay informed.",
      },
    ],
  },
];
