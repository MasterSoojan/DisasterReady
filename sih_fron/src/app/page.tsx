'use client';
import Link from 'next/link';
import { useState, useEffect, Suspense, useRef } from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';
import { motion } from 'framer-motion';

// --- THREE.JS IMPORTS ---
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Cloud, Stars, Float } from '@react-three/drei';
import * as THREE from 'three';

// --- INTERACTIVE LIGHTING ---
// This provides the 3D lighting without needing a visible "dot"
const SceneController = ({ darkMode }: { darkMode: boolean }) => {
  const lightRef = useRef<THREE.PointLight>(null);
  const { viewport, mouse } = useThree();

  useFrame(() => {
    if (lightRef.current) {
      // Light follows mouse for subtle depth
      const x = (mouse.x * viewport.width) / 2;
      const y = (mouse.y * viewport.height) / 2;
      lightRef.current.position.set(x, y, 5);
    }
  });

  return (
    <>
      <ambientLight intensity={darkMode ? 0.3 : 0.8} />
      <pointLight 
        ref={lightRef} 
        intensity={darkMode ? 1 : 2} 
        color={darkMode ? "#4f46e5" : "#fbbf24"} 
      />
    </>
  );
};

// --- 3D COMPONENT ---
const WeatherScene = ({ darkMode }: { darkMode: boolean }) => {
  return (
    <>
      <SceneController darkMode={darkMode} />
      
      {/* Stars only appear in Dark Mode */}
      {darkMode && (
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      )}

      {/* Floating Clouds */}
      <Suspense fallback={null}>
        <Float speed={2} rotationIntensity={0.1} floatIntensity={1}>
          <Cloud 
            position={[-8, 0, -10]} 
            speed={0.2} 
            opacity={darkMode ? 0.3 : 0.6} 
            color={darkMode ? "#6b7280" : "white"} 
            width={10} 
            depth={1.5} 
            segments={20} 
          />
          <Cloud 
            position={[8, 2, -10]} 
            speed={0.2} 
            opacity={darkMode ? 0.3 : 0.8} 
            color={darkMode ? "#4b5563" : "#ecfeff"} 
            width={10} 
            depth={1.5} 
            segments={20} 
          />
          <Cloud 
            position={[0, -5, -15]} 
            speed={0.2} 
            opacity={0.5} 
            color={darkMode ? "#374151" : "white"} 
            width={20} 
            depth={2} 
            segments={20} 
          />
        </Float>
      </Suspense>
    </>
  );
};

export default function HomePage() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved === 'true') setDarkMode(true);
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  return (
    <main
      className={`min-h-screen w-full px-6 py-10 transition-colors duration-500 flex flex-col ${
        darkMode
          ? 'bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-gray-100'
          : 'bg-gradient-to-b from-pink-100 via-blue-100 to-yellow-100 text-gray-800'
      }`}
    >
      {/* Navbar */}
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className={`rounded-b-3xl shadow-xl sticky top-0 z-50 ${
          darkMode
            ? 'bg-gradient-to-r from-indigo-800 via-purple-800 to-blue-800'
            : 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-extrabold tracking-wide flex items-center space-x-2">
            <img
              src="/logo.jpg"
              alt="logo"
              className="w-18 h-18 mix-blend-multiply"
            />
            <span className={darkMode ? 'text-yellow-300' : 'text-white'}>DisasterReady</span>
          </h1>

          <div className="flex items-center space-x-3 text-sm md:text-base">
            {['leaderboard', 'modules', 'drills', 'account', 'games', 'chat', 'help'].map((page) => (
              <Link
                key={page}
                href={`/${page}`}
                className={`px-4 py-2 rounded-full font-semibold transition duration-300 ${
                  darkMode
                    ? 'text-gray-200 hover:bg-indigo-700 hover:text-yellow-300'
                    : 'text-white hover:bg-white hover:text-purple-600'
                }`}
              >
                {page.charAt(0).toUpperCase() + page.slice(1)}
              </Link>
            ))}

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full bg-white/20 hover:bg-white/40 transition"
            >
              {darkMode ? <FiSun size={20} color="#FFD700" /> : <FiMoon size={20} color="#fff" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className={`relative z-10 text-center py-24 ${
          darkMode ? 'bg-gray-900' : 'bg-gradient-to-b from-sky-200 via-sky-300 to-blue-400'
        } overflow-hidden rounded-b-[60px]`}
      >
        {/* --- 3D BACKGROUND --- */}
        <div className="absolute inset-0 z-0">
            <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
                <WeatherScene darkMode={darkMode} />
            </Canvas>
        </div>

        {/* Hero Content (Foreground) */}
        <div className="relative z-10 pointer-events-none">
            <div className="h-48" /> 
            <h2
            className={`text-5xl font-extrabold drop-shadow-lg relative z-10 ${
                darkMode ? 'text-indigo-300' : 'text-white'
            }`}
            >
            Learn Safety in a Fun Way! 🌈
            </h2>
            <p
            className={`mt-4 max-w-2xl mx-auto text-lg font-medium relative z-10 ${
                darkMode ? 'text-gray-300' : 'text-blue-100'
            }`}
            >
            Discover, play, and prepare for emergencies while having fun with colorful quizzes and games!
            </p>
        </div>
      </motion.section>

      {/* Benefits Section */}
      <section
        className={`py-16 transition-colors duration-500 ${
          darkMode ? 'bg-gray-800' : 'bg-white/80 backdrop-blur-md'
        }`}
      >
        <div className="max-w-7xl mx-auto text-center">
          <h3
            className={`text-4xl font-extrabold mb-12 ${
              darkMode ? 'text-yellow-300' : 'text-indigo-700'
            }`}
          >
            🌟 Why DisasterReady Matters
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
            {[
              { title: 'Education Integration', img: 'https://cdn-icons-png.flaticon.com/512/3075/3075977.png' },
              { title: 'Localized Awareness', img: 'https://cdn-icons-png.flaticon.com/512/2641/2641333.png' },
              { title: 'Virtual Drills', img: 'https://cdn-icons-png.flaticon.com/512/4625/4625101.png' },
              { title: 'Emergency Readiness', img: 'https://cdn-icons-png.flaticon.com/512/9290/9290842.png' },
              { title: 'Empowered Students', img: 'https://cdn-icons-png.flaticon.com/512/3917/3917242.png' },
              { title: 'Safer Institutions', img: 'https://cdn-icons-png.flaticon.com/512/4369/4369529.png' },
            ].map(({ title, img }, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.08 }}
                className={`p-6 rounded-3xl shadow-lg transition ${
                  darkMode ? 'bg-indigo-900' : 'bg-gradient-to-br from-pink-100 to-yellow-100'
                }`}
              >
                <img src={img} alt={title} className="w-20 mx-auto mb-4" />
                <h4 className={`text-xl font-bold ${darkMode ? 'text-yellow-300' : 'text-purple-700'}`}>{title}</h4>
                <p className={darkMode ? 'text-gray-300' : 'text-gray-700 mt-2'}>
                  {[
                    'Brings structured disaster management directly into the curriculum.',
                    'Teaches students how to react to disasters specific to their region.',
                    'Simulates real-life disaster situations safely.',
                    'Reduces panic with calm, informed responses.',
                    'Builds responsible, disaster-aware young citizens.',
                    'Makes schools safer with digital preparedness tools.',
                  ][idx]}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Awareness Results Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className={`py-16 px-6 transition ${darkMode ? 'bg-gray-900' : 'bg-blue-50'}`}
      >
        <div className="max-w-6xl mx-auto text-center">
          <h3 className={`text-3xl font-extrabold mb-10 ${darkMode ? 'text-yellow-300' : 'text-indigo-800'}`}>
            📊 Student Awareness Results
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '+5,000', label: 'Students Trained', img: 'https://cdn-icons-png.flaticon.com/512/326/326561.png' },
              { value: '87%', label: 'Improved Quiz Scores', img: 'https://cdn-icons-png.flaticon.com/512/1283/1283057.png' },
              { value: '+120', label: 'Schools Onboarded', img: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' },
              { value: '92%', label: 'Increased Awareness', img: 'https://cdn-icons-png.flaticon.com/512/1046/1046869.png' },
            ].map(({ value, label, img }, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                className={`p-6 rounded-2xl shadow-md ${darkMode ? 'bg-indigo-800' : 'bg-white'}`}
              >
                <img src={img} alt={label} className="w-14 mx-auto mb-3" />
                <h4 className={`text-3xl font-bold ${darkMode ? 'text-yellow-300' : 'text-indigo-700'}`}>{value}</h4>
                <p className={`mt-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className={`py-16 px-6 ${
          darkMode
            ? 'bg-gradient-to-r from-gray-800 via-gray-900 to-gray-700'
            : 'bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400'
        }`}
      >
        <div className="max-w-6xl mx-auto text-center">
          <h3 className={`text-3xl font-extrabold mb-12 ${darkMode ? 'text-yellow-300' : 'text-white'}`}>
            🚀 Platform Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { title: 'Quiz Games', desc: 'Test your disaster awareness with educational quizzes.', img: 'https://cdn-icons-png.flaticon.com/512/4160/4160616.png' },
              { title: 'Live Chat Box', desc: 'Get instant help through our smart chat.', img: 'https://cdn-icons-png.flaticon.com/512/1041/1041916.png' },
              { title: 'Leaderboard', desc: 'Track progress and rise up the ranks.', img: 'https://cdn-icons-png.flaticon.com/512/1974/1974039.png' },
              { title: 'Localized Alerts', desc: 'Receive disaster tips based on your location.', img: 'https://cdn-icons-png.flaticon.com/512/3602/3602145.png' },
              { title: 'Emergency Protocols', desc: 'Follow easy step-by-step emergency guides.', img: 'https://cdn-icons-png.flaticon.com/512/9131/9131534.png' },
              { title: 'Student & Teacher Focused', desc: 'Designed for learners and educators alike.', img: 'https://cdn-icons-png.flaticon.com/512/5509/5509652.png' },
            ].map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.08, rotate: 1 }}
                className={`p-6 rounded-3xl shadow-lg cursor-pointer transition ${darkMode ? 'bg-gray-700' : 'bg-white'}`}
              >
                <img src={feature.img} alt={feature.title} className="w-16 mx-auto mb-3" />
                <h4 className={`text-xl font-bold mb-2 ${darkMode ? 'text-yellow-300' : 'text-purple-700'}`}>{feature.title}</h4>
                <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <footer className={`py-6 mt-10 text-center transition ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        <p>© 2026 DisasterReady. All rights reserved.</p>
      </footer>
    </main>
  );
}