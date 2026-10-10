// --- TYPE DEFINITIONS ---
export interface SpotData {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  label: string;
  feedback: string;
}

export interface RoomData {
  name: string;
  themeColor: string; // Used for floor accents
  safeSpots: SpotData[];
  unsafeSpots: SpotData[];
}

// --- GAME DATA ---
export const rooms: RoomData[] = [
  {
    name: "Classroom",
    themeColor: "#4f46e5",
    safeSpots: [
      {
        x: 100,
        y: 300,
        w: 180,
        h: 120,
        color: "var(--safe-color)",
        label: "Desk",
        feedback: "✅ Correct! Drop, Cover, and Hold On under the desk.",
      },
    ],
    unsafeSpots: [
      {
        x: 550,
        y: 50,
        w: 150,
        h: 250,
        color: "var(--unsafe-color)",
        label: "Window",
        feedback: "❌ Unsafe! Glass can shatter inward explosively.",
      },
    ],
  },
  {
    name: "Kitchen",
    themeColor: "#8b5cf6",
    safeSpots: [
      {
        x: 150,
        y: 280,
        w: 220,
        h: 120,
        color: "var(--safe-color)",
        label: "Table",
        feedback: "✅ Correct! This strong table protects from falling debris.",
      },
    ],
    unsafeSpots: [
      {
        x: 500,
        y: 50,
        w: 180,
        h: 280,
        color: "var(--unsafe-color)",
        label: "Shelf",
        feedback: "❌ Unsafe! Heavy appliances and dishes will fall.",
      },
    ],
  },
  {
    name: "Playground",
    themeColor: "#10b981",
    safeSpots: [
      {
        x: 250,
        y: 200,
        w: 200,
        h: 150,
        color: "var(--safe-color)",
        label: "Open Ground",
        feedback: "✅ Correct! Stay away from buildings and power lines.",
      },
    ],
    unsafeSpots: [
      {
        x: 600,
        y: 80,
        w: 150,
        h: 250,
        color: "var(--unsafe-color)",
        label: "Wall",
        feedback: "❌ Unsafe! Exterior walls are the first to collapse.",
      },
    ],
  },
  {
    name: "Office",
    themeColor: "#64748b",
    safeSpots: [
      {
        x: 80,
        y: 300,
        w: 200,
        h: 100,
        color: "var(--safe-color)",
        label: "Sturdy Desk",
        feedback: "✅ Correct! Ideal protection against ceiling tiles.",
      },
    ],
    unsafeSpots: [
      {
        x: 650,
        y: 100,
        w: 120,
        h: 300,
        color: "var(--unsafe-color)",
        label: "Elevator",
        feedback: "❌ Unsafe! Power may fail, trapping you inside.",
      },
    ],
  },
  {
    name: "Library",
    themeColor: "#a16207",
    safeSpots: [
      {
        x: 300,
        y: 280,
        w: 200,
        h: 120,
        color: "var(--safe-color)",
        label: "Table",
        feedback: "✅ Correct! A wooden table is safer than the aisles.",
      },
    ],
    unsafeSpots: [
      {
        x: 600,
        y: 20,
        w: 140,
        h: 350,
        color: "var(--unsafe-color)",
        label: "Tall Bookshelf",
        feedback: "❌ Unsafe! Heavy books and the shelf itself will tip over.",
      },
    ],
  },
  {
    name: "Mall",
    themeColor: "#0891b2",
    safeSpots: [
      {
        x: 100,
        y: 200,
        w: 200,
        h: 200,
        color: "var(--safe-color)",
        label: "Against Interior Wall",
        feedback:
          "✅ Correct! Structural interior walls are safer than glass fronts.",
      },
    ],
    unsafeSpots: [
      {
        x: 550,
        y: 80,
        w: 200,
        h: 280,
        color: "var(--unsafe-color)",
        label: "Store Entrance",
        feedback: "❌ Unsafe! Falling signage and shattering glass are deadly.",
      },
    ],
  },
  {
    name: "Car",
    themeColor: "#be185d",
    safeSpots: [
      {
        x: 150,
        y: 250,
        w: 450,
        h: 140,
        color: "var(--safe-color)",
        label: "Pulled Over, Inside Car",
        feedback:
          "✅ Correct! The metal frame offers protection. Use parking brake.",
      },
    ],
    unsafeSpots: [
      {
        x: 680,
        y: 50,
        w: 100,
        h: 350,
        color: "var(--unsafe-color)",
        label: "Under an Overpass",
        feedback: "❌ Unsafe! Bridges and overpasses are high collapse risks.",
      },
    ],
  },
  {
    name: "Bus",
    themeColor: "#f97316",
    safeSpots: [
      {
        x: 250,
        y: 250,
        w: 250,
        h: 150,
        color: "var(--safe-color)",
        label: "Between Seats",
        feedback: "✅ Correct! Crouch below window level to avoid glass.",
      },
    ],
    unsafeSpots: [
      {
        x: 600,
        y: 80,
        w: 120,
        h: 320,
        color: "var(--unsafe-color)",
        label: "Window",
        feedback: "❌ Unsafe! Large windows are the main hazard here.",
      },
    ],
  },
];
