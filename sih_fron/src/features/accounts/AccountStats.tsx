import type { DemoUser } from "./demoUsers";
import { recordedScore, recordedImprovement } from "./statistics";

export function AccountStats({
  user,
  users,
  darkMode,
}: {
  user: DemoUser;
  users: DemoUser[];
  darkMode: boolean;
}) {
  const students = users.filter((item) => item.role === "student");
  const surface = darkMode ? "bg-gray-800/80" : "bg-white/90";
  return (
    <section
      aria-label={
        user.role === "teacher"
          ? "Local student roster"
          : "Stored demo statistics"
      }
      className={`min-w-0 flex-1 rounded-3xl p-6 shadow-xl ${surface}`}
    >
      <p className="mb-5 text-sm">
        Stored demo fields only—not verified learning results. Missing values
        are shown as —.
      </p>
      {user.role === "student" ? (
        <>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-indigo-500/15 p-5">
              <dt className="font-bold">Total Quizzes</dt>
              <dd className="mt-2 text-4xl font-black">
                {user.totalQuizzes ?? "—"}
              </dd>
            </div>
            <div className="rounded-2xl bg-purple-500/15 p-5">
              <dt className="font-bold">Average Score</dt>
              <dd className="mt-2 text-4xl font-black">
                {recordedScore(user)}
              </dd>
            </div>
          </dl>
          <h2 className="mb-4 mt-8 text-2xl font-bold">
            Recorded achievements
          </h2>
          {user.badges?.length ? (
            <ul className="flex flex-wrap gap-3">
              {user.badges.map((badge, index) => (
                <li
                  key={index}
                  className="break-words rounded-full border px-4 py-2"
                >
                  {badge}
                </li>
              ))}
            </ul>
          ) : (
            <p>No achievements have been recorded for this demo account.</p>
          )}
        </>
      ) : (
        <>
          <h2 className="mb-4 text-2xl font-bold">Local student roster</h2>
          {students.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <caption className="sr-only">
                  Student demo records stored in this browser
                </caption>
                <thead>
                  <tr>
                    {[
                      "Student",
                      "Quizzes",
                      "Average score",
                      "Recorded improvement",
                    ].map((name) => (
                      <th key={name} scope="col" className="p-3">
                        {name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr
                      key={student.username}
                      className="border-t border-slate-400/30"
                    >
                      <th scope="row" className="break-words p-3">
                        {student.username}
                      </th>
                      <td className="p-3">{student.totalQuizzes ?? "—"}</td>
                      <td className="p-3">{recordedScore(student)}</td>
                      <td className="p-3">{recordedImprovement(student)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No local student accounts.</p>
          )}
        </>
      )}
    </section>
  );
}
