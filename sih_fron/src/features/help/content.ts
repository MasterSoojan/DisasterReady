// Emergency-resource scope/source checked October 10, 2026. Do not infer live availability.
export const emergencyResource = {
  region: "India",
  phone: "112",
  source:
    "https://www.mha.gov.in/en/commoncontent/emergency-response-support-system-erss",
  checked: "2026-10-10",
} as const;

export const helpTopics = [
  {
    question: "How do I attempt the quiz?",
    answer:
      "Open Quiz Challenge from Games. Each question accepts one answer; View results shows the current attempt. Leaving or reloading resets it, and it does not update account statistics.",
    href: "/games/quiz",
    label: "Open Quiz Challenge",
  },
  {
    question: "Where can I see my ranking?",
    answer:
      "The leaderboard is a teacher demo view of editable records on this device, not verified performance. Only stored quiz attempts and scores are ranked. New accounts without results stay unranked; playing the current quiz does not add results.",
    href: "/leaderboard",
    label: "Open demo leaderboard",
  },
  {
    question: "How do I start a drill?",
    answer:
      "Choose a scenario on Drills. Complete its expected choices before the countdown ends, or retry. Results are temporary practice feedback, not an emergency qualification.",
    href: "/drills",
    label: "Browse drills",
  },
  {
    question: "Can I change my avatar?",
    answer:
      "Open your demo profile and choose Edit profile. Use a PNG, JPEG or WebP up to 256 KiB and 4096 × 4096 pixels. Save changes keeps it in this browser; Cancel discards the draft.",
    href: "/account/dashboard",
    label: "Open demo profile",
  },
  {
    question: "Is chat a live support service?",
    answer:
      "No. Without a configured backend it shows a local demo reply. With a backend it uses keyword-based educational replies and stores submitted messages. It is not generative AI, a staffed adviser or an emergency channel.",
    href: "/chat",
    label: "Open study chat",
  },
  {
    question: "Does DisasterReady send alerts or emergency help?",
    answer:
      "No. This prototype has no location-based warning system, responder dispatch or monitored feedback form. For an actual emergency use the appropriate official service where you are.",
    href: "#emergency-resources",
    label: "Read emergency resource information",
  },
] as const;
