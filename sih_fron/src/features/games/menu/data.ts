import { FaFire, FaRunning, FaBrain } from "react-icons/fa";
import { FiSearch, FiActivity } from "react-icons/fi";

export const games = [
  {
    id: "quiz",
    title: "Quiz Challenge",
    description: "Try the authored question bank.",
    href: "/games/quiz",
    color: "from-purple-500 to-indigo-500",
    Icon: FaBrain,
    difficulty: "Medium",
  },
  {
    id: "spot",
    title: "Spot Finder",
    description: "Choose the marked safe areas.",
    href: "/games/SpotFinder",
    color: "from-blue-400 to-cyan-400",
    Icon: FiSearch,
    difficulty: "Easy",
  },
  {
    id: "fire",
    title: "Fire Escape",
    description: "Choose a path through a fire scenario.",
    href: "/games/FireEscape",
    color: "from-orange-500 to-red-500",
    Icon: FaFire,
    difficulty: "Hard",
  },
  {
    id: "shake",
    title: "Shake & Survive",
    description: "Try the earthquake cover simulation.",
    href: "/games/ShakeSurvive",
    color: "from-yellow-400 to-orange-400",
    Icon: FiActivity,
    difficulty: "Medium",
  },
  {
    id: "blaze",
    title: "Blaze Escape",
    description: "Navigate the platform game's hazards.",
    href: "/games/BlazeEscape",
    color: "from-red-600 to-rose-600",
    Icon: FaRunning,
    difficulty: "Expert",
  },
] as const;
