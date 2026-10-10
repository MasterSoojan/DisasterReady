"use client";
import Link from "next/link";
import { Stars, Sparkles } from "@react-three/drei";
import { FiHelpCircle, FiPhone } from "react-icons/fi";
import { useDarkMode } from "@/features/theme/useDarkMode";
import { SiteHeader } from "@/features/navigation/SiteHeader";
import { DecorativeCanvas } from "@/features/learning/DecorativeCanvas";
import { RescueItems } from "@/features/help/Scene";
import { emergencyResource, helpTopics } from "@/features/help/content";

export default function HelpPage() {
  const [darkMode, setDarkMode] = useDarkMode();
  return (
    <main
      className={
        "relative min-h-screen overflow-hidden pb-12 " +
        (darkMode
          ? "bg-gray-900 text-white"
          : "bg-gradient-to-br from-blue-50 to-indigo-100 text-slate-900")
      }
    >
      <div className="pointer-events-none fixed inset-0" aria-hidden="true">
        <DecorativeCanvas camera={{ position: [0, 0, 10], fov: 50 }}>
          <ambientLight intensity={0.6} />
          <spotLight position={[10, 10, 10]} intensity={1} />
          <Stars radius={100} depth={50} count={3000} factor={4} fade />
          <Sparkles
            count={50}
            scale={10}
            size={4}
            speed={0.4}
            opacity={0.5}
            color={darkMode ? "cyan" : "blue"}
          />
          <RescueItems />
        </DecorativeCanvas>
      </div>
      <div className="relative z-10">
        <SiteHeader
          current="help"
          darkMode={darkMode}
          toggleTheme={() => setDarkMode(!darkMode)}
        />
        <div className="mx-auto max-w-5xl px-4 pt-6">
          <Link href="/" className="inline-block rounded-xl border px-4 py-2">
            Back Home
          </Link>
          <header className="py-8 text-center">
            <FiHelpCircle
              aria-hidden="true"
              className="mx-auto mb-4 text-5xl text-blue-500"
            />
            <h1 className="text-4xl font-black sm:text-5xl">
              Help &amp; resources
            </h1>
            <p className="mt-4 text-lg">
              Using the prototype and finding official emergency information.
            </p>
            <p className="mt-3">
              This is not a rescue center. No team monitors this page, chat or a
              feedback inbox for emergencies.
            </p>
          </header>
          <section
            id="emergency-resources"
            aria-labelledby="emergency-heading"
            className="rounded-3xl bg-gradient-to-br from-red-700 to-rose-800 p-6 text-white shadow-xl sm:p-8"
          >
            <h2 id="emergency-heading" className="text-2xl font-bold">
              {emergencyResource.region} emergency information
            </h2>
            <p className="mt-3">
              India’s Emergency Response Support System uses 112 for police,
              fire and health emergencies.
            </p>
            <a
              href={"tel:" + emergencyResource.phone}
              className="my-5 inline-flex items-center gap-3 rounded-xl bg-white px-6 py-3 text-xl font-extrabold text-red-900"
            >
              <FiPhone aria-hidden="true" />
              Call 112 in India
            </a>
            <p className="text-sm leading-relaxed">
              The link opens your device’s phone handler. DisasterReady does not
              place or confirm a call, share your location or dispatch help.
              Outside India, use the official emergency number for your
              location.
            </p>
            <a
              href={emergencyResource.source}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block underline"
            >
              Official ERSS information — Ministry of Home Affairs (opens a new
              tab)
            </a>
            <p className="mt-2 text-sm">
              Source checked {emergencyResource.checked}. Service availability
              is not tested by this app.
            </p>
          </section>
          <section
            aria-labelledby="faq-heading"
            className={
              "mt-8 rounded-3xl p-6 shadow-xl sm:p-8 " +
              (darkMode ? "bg-gray-800/90" : "bg-white/90")
            }
          >
            <h2 id="faq-heading" className="mb-5 text-2xl font-bold">
              Using DisasterReady
            </h2>
            <div className="space-y-3">
              {helpTopics.map((topic) => (
                <details
                  key={topic.question}
                  name="help-topics"
                  className="rounded-xl border border-slate-400/40 p-4"
                >
                  <summary className="cursor-pointer font-bold focus-visible:outline-2">
                    {topic.question}
                  </summary>
                  <p className="mt-3 leading-relaxed">{topic.answer}</p>
                  <Link
                    href={topic.href}
                    className="mt-3 inline-block font-semibold underline"
                  >
                    {topic.label}
                  </Link>
                </details>
              ))}
            </div>
          </section>
          <p className="mt-6 text-sm">
            There is no working feedback-submission service in this prototype.
            Do not put personal details or emergency requests into demo fields.
          </p>
        </div>
      </div>
    </main>
  );
}
