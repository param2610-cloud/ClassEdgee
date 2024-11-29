
import React from "react";

const Home: React.FC = () => {
  const technologies = [
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-12 h-12 text-cyan-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
      title: "Adaptive Learning AI",
      description:
        "Intelligent algorithms that personalize learning paths for each student based on individual performance and learning styles.",
      color: "bg-gradient-to-br from-cyan-900 to-blue-900",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-12 h-12 text-green-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      title: "Real-Time Analytics",
      description:
        "Comprehensive performance tracking with instant insights into student engagement, comprehension, and learning progress.",
      color: "bg-gradient-to-br from-green-900 to-teal-900",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-12 h-12 text-purple-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
      title: "Interactive Collaboration",
      description:
        "Advanced communication tools enabling seamless interaction between educators, students, and learning resources.",
      color: "bg-gradient-to-br from-purple-900 to-indigo-900",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-12 h-12 text-yellow-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
      title: "Smart Content Management",
      description:
        "Dynamic content distribution and resource sharing platform with intelligent organization and accessibility.",
      color: "bg-gradient-to-br from-yellow-900 to-orange-900",
    },
  ];

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 
                    flex items-center justify-center p-6 overflow-hidden relative"
    >
      {/* Futuristic Grid Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div
          className="absolute inset-0 bg-[linear-gradient(45deg,rgba(17,24,39,0.9)_0%,rgba(30,41,59,0.5)_100%)] 
                        opacity-50"
        ></div>
        <div className="absolute inset-0 bg-grid-white/5 opacity-50"></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl">
        <div className="text-center mb-16">
          <h1
            className="text-5xl font-bold mb-6 
                         text-transparent bg-clip-text 
                         bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 
                         animate-gradient-x"
          >
            Smart Classroom Management System
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Revolutionizing education through advanced technology, our
            intelligent platform transforms classroom experiences by providing
            comprehensive tools for personalized learning, real-time insights,
            and seamless educational interactions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {technologies.map((tech, index) => (
            <div
              key={index}
              className={`${tech.color} p-8 rounded-3xl shadow-2xl 
                          transform transition duration-500 
                          hover:scale-105 hover:rotate-3 
                          hover:shadow-[0_0_30px_rgba(0,255,255,0.3)]`}
            >
              <div className="mb-6">{tech.icon}</div>
              <h3 className="text-3xl font-bold text-white mb-4">
                {tech.title}
              </h3>
              <p className="text-gray-200 opacity-80">{tech.description}</p>
              <div className="mt-6 border-t border-white/20 pt-4">
                <span className="text-sm text-cyan-300 uppercase tracking-wider">
                  Next-Generation Education Technology
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Animated Tech Particles */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-cyan-500 rounded-full animate-pulse"
            style={{
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Home;
