import {
  FiBookOpen,
  FiClock,
  FiGrid,
  FiMessageSquare,
  FiUsers,
  FiAward,
} from "react-icons/fi";

// Describe shipped routes, not impact metrics or planned capabilities.
export const homeFeatures = [
  {
    title: "Learning modules",
    description:
      "Read the authored fire, flood, earthquake and cyclone lessons, then try a short question.",
    href: "/modules",
    Icon: FiBookOpen,
  },
  {
    title: "Timed practice drills",
    description:
      "Try scenario choices with a countdown, feedback and a fresh attempt when you want to retry.",
    href: "/drills",
    Icon: FiClock,
  },
  {
    title: "Games and quizzes",
    description:
      "Explore five practice games. Scores describe gameplay, not a safety qualification.",
    href: "/games",
    Icon: FiGrid,
  },
  {
    title: "Local demo profiles",
    description:
      "Try student and teacher views using browser-only records. Do not enter real passwords.",
    href: "/account",
    Icon: FiUsers,
  },
  {
    title: "Demo leaderboard",
    description:
      "A teacher demo view of stored local fields. Current quizzes do not automatically update rankings.",
    href: "/leaderboard",
    Icon: FiAward,
  },
  {
    title: "Rule-based study chat",
    description:
      "See a demo reply, or connect the optional backend for keyword-based replies. No live adviser is available.",
    href: "/chat",
    Icon: FiMessageSquare,
  },
] as const;
