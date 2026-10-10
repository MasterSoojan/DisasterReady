export type Choice = {
  text: string;
  next: string;
  consequences?: { health?: number; visibility?: number };
  correct?: string;
  wrong?: string;
};

export type Scenario = {
  text: string;
  choices: Choice[];
  outcome?: "win" | "loss";
};

// --- GAME DATA (Identical to your original logic) ---
export const scenarios: Record<string, Scenario> = {
  start: {
    text: "The fire alarm blares. A faint smell of smoke hangs in the air. You're in your bedroom. The door is slightly ajar.",
    choices: [
      {
        text: "Check door for heat",
        next: "check_door_heat",
        correct: "Crucial first step.",
      },
      {
        text: "Open door and peek",
        next: "hallway_check",
        wrong: "Too risky!",
      },
      { text: "Stay and call help", next: "stay_in_room" },
    ],
  },
  check_door_heat: {
    text: "The door and knob are alarmingly hot! The fire is right outside.",
    choices: [
      {
        text: "Open it anyway!",
        next: "open_hot_door_loss",
        wrong: "Instant backdraft.",
      },
      {
        text: "Keep closed & seal",
        next: "seal_door",
        correct: "Barriers save lives.",
      },
    ],
  },
  open_hot_door_loss: {
    text: "A blast of superheated air erupts into the room. You had no chance.",
    choices: [{ text: "Restart", next: "reset" }],
    outcome: "loss",
  },
  hallway_check: {
    text: "You crack the door. The hallway is a wall of black smoke. You hear crackling.",
    choices: [
      {
        text: "Crawl low",
        next: "stairs_crawl",
        consequences: { health: -10, visibility: -40 },
        correct: "Cleanest air is low.",
      },
      {
        text: "Run for stairs",
        next: "stairs_run",
        consequences: { health: -40, visibility: -80 },
        wrong: "Smoke kills faster than fire.",
      },
      { text: "Retreat & seal", next: "seal_door", correct: "Smart retreat." },
    ],
  },
  stay_in_room: {
    text: "Smoke seeps under the door. Time is running out.",
    choices: [
      {
        text: "Seal door crack",
        next: "seal_door",
        correct: "Slows the smoke.",
      },
      {
        text: "Find dog",
        next: "find_pet_loss",
        wrong: "Get out first, then tell firemen.",
      },
      {
        text: "Grab valuables",
        next: "delay",
        consequences: { health: -30, visibility: -20 },
        wrong: "Possessions are replaceable.",
      },
    ],
  },
  find_pet_loss: {
    text: "You waste seconds calling your panicked dog. The smoke overpowers you.",
    choices: [{ text: "Restart", next: "reset" }],
    outcome: "loss",
  },
  seal_door: {
    text: "Door sealed. Heat is building. You are trapped on the 3rd floor.",
    choices: [
      {
        text: "Signal from window",
        next: "signal_help",
        correct: "Best option when trapped.",
      },
      { text: "Make rope", next: "bedsheet_rope" },
      {
        text: "Smash window",
        next: "break_window_trapped",
        consequences: { health: -10 },
        wrong: "Feeds the fire oxygen.",
      },
    ],
  },
  signal_help: {
    text: "Firefighters see you! They raise a ladder. You survived!",
    choices: [{ text: "Play Again", next: "reset" }],
    outcome: "win",
  },
  stairs_crawl: {
    text: "Crawling low, heat is intense. You see the EXIT sign but hear a neighbor coughing.",
    choices: [
      {
        text: "Head for Exit",
        next: "exit_door",
        correct: "Save yourself to save others.",
      },
      {
        text: "Take Elevator",
        next: "elevator_trap_loss",
        wrong: "Elevators are coffins in fires.",
      },
      {
        text: "Help Neighbor",
        next: "help_neighbor",
        correct: "Heroic, but risky.",
      },
    ],
  },
  help_neighbor: {
    text: "You grab your disorientation neighbor and guide them.",
    choices: [{ text: "Escape together", next: "exit_door_with_neighbor" }],
  },
  exit_door_with_neighbor: {
    text: "You both burst into the fresh night air. Hero!",
    choices: [{ text: "Play Again", next: "reset" }],
    outcome: "win",
  },
  elevator_trap_loss: {
    text: "The elevator stops between floors. Smoke fills the cabin.",
    choices: [{ text: "Restart", next: "reset" }],
    outcome: "loss",
  },
  bedsheet_rope: {
    text: "You tie sheets to the bedframe. It looks sketchy.",
    choices: [
      {
        text: "Climb down",
        next: "climb_rope",
        consequences: { health: -15 },
        correct: "Desperate times.",
      },
      { text: "Wait for help", next: "signal_help", correct: "Wise choice." },
    ],
  },
  climb_rope: {
    text: "You slide down, burning your hands, but land safely on the grass.",
    choices: [{ text: "Play Again", next: "reset" }],
    outcome: "win",
  },
  exit_door: {
    text: "You push the heavy door and breathe fresh night air. Safe!",
    choices: [{ text: "Play Again", next: "reset" }],
    outcome: "win",
  },
  stairs_run: {
    text: "You stand up to run. One breath of superheated smoke knocks you out.",
    choices: [{ text: "Restart", next: "reset" }],
    outcome: "loss",
  },
  delay: {
    text: "By the time you grab your laptop, the exit is blocked.",
    choices: [{ text: "Restart", next: "reset" }],
    outcome: "loss",
  },
  break_window_trapped: {
    text: "The broken window pulls fire into the room like a vacuum.",
    choices: [{ text: "Restart", next: "reset" }],
    outcome: "loss",
  },
};
