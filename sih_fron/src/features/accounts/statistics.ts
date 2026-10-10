import type { DemoUser } from "./demoUsers";

export function recordedScore(user: DemoUser): string {
  return user.averageScore === undefined ? "—" : `${user.averageScore}%`;
}
export function recordedImprovement(user: DemoUser): string {
  return user.improvement === undefined || user.improvement === ""
    ? "—"
    : String(user.improvement);
}
/** Missing results are unranked, not invented zero-score attempts. Rankings are demo fields only. */
export function rankDemoStudents(users: DemoUser[]) {
  const students = users.filter((user) => user.role === "student");
  const hasScore = (user: DemoUser) =>
    (user.totalQuizzes ?? 0) > 0 && user.averageScore !== undefined;
  const ranked = students
    .filter(hasScore)
    .sort((a, b) => b.averageScore! - a.averageScore!);
  return [...ranked, ...students.filter((user) => !hasScore(user))].map(
    (user, index) => ({ user, rank: index < ranked.length ? index + 1 : null }),
  );
}
