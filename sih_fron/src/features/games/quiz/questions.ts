// --- TYPES ---
export type Question = {
  question: string;
  options: string[];
  answer: string;
};

// --- DATA ---
export const quizData: Question[] = [
  {
    question: "🌍 Which natural disaster is measured using the Richter scale?",
    options: ["Flood", "Earthquake", "Cyclone", "Tsunami"],
    answer: "Earthquake",
  },
  {
    question: "🏛️ What does NDMA stand for?",
    options: [
      "National Disaster Management Authority",
      "National Defence Management Agency",
      "Natural Disaster Monitoring Association",
      "National Data Management Authority",
    ],
    answer: "National Disaster Management Authority",
  },
  {
    question: "🌡️ Which gas is responsible for global warming?",
    options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Helium"],
    answer: "Carbon Dioxide",
  },
  {
    question: "💨 Which instrument is used to measure wind speed?",
    options: ["Thermometer", "Seismograph", "Anemometer", "Barometer"],
    answer: "Anemometer",
  },
  {
    question: "🏠 What should you do during an earthquake?",
    options: [
      "Stand under a tree",
      "Run outside immediately",
      "Take cover under sturdy furniture",
      "Use the elevator",
    ],
    answer: "Take cover under sturdy furniture",
  },
  {
    question: "🌊 Cyclones in the Pacific Ocean are called?",
    options: ["Typhoons", "Hurricanes", "Tornadoes", "Storms"],
    answer: "Typhoons",
  },
  {
    question: "🚑 What is the full form of SDRF?",
    options: [
      "State Disaster Response Force",
      "State Defence Rescue Force",
      "Severe Disaster Relief Fund",
      "Statewide Disaster Relief Force",
    ],
    answer: "State Disaster Response Force",
  },
  {
    question:
      "☔ Which natural disaster is caused by heavy rainfall and overflow of rivers?",
    options: ["Earthquake", "Flood", "Landslide", "Volcano"],
    answer: "Flood",
  },
  {
    question: "🌀 Which scale measures the intensity of cyclones?",
    options: [
      "Richter Scale",
      "Saffir-Simpson Scale",
      "Beaufort Scale",
      "Mercalli Scale",
    ],
    answer: "Saffir-Simpson Scale",
  },
  {
    question: "🌊 Tsunamis are usually caused by?",
    options: [
      "Volcanic eruptions",
      "Earthquakes under the sea",
      "Heavy rainfall",
      "Landslides",
    ],
    answer: "Earthquakes under the sea",
  },
];
