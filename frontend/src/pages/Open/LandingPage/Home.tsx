import { ArrowRight } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleGetStartedClick = () => {
    navigate('/auth/signin');
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 overflow-hidden relative">
      {/* Background Shapes with increased contrast */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large circular gradients */}
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-blue-200/40 to-cyan-200/40 rounded-full blur-2xl" />
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-gradient-to-tr from-purple-200/40 to-blue-200/40 rounded-full blur-2xl" />
        
        {/* Geometric patterns */}
        <div className="absolute top-0 left-0 w-full h-full">
          {/* Top-right decorative corner */}
          <div className="absolute top-20 right-20">
            <div className="w-32 h-32 border-4 border-blue-300/30 rounded-xl transform rotate-45" />
            <div className="w-32 h-32 border-4 border-cyan-300/30 rounded-xl transform rotate-12 translate-x-10 -translate-y-10" />
          </div>

          {/* Bottom-left decorative corner */}
          <div className="absolute bottom-20 left-20">
            <div className="w-32 h-32 border-4 border-purple-300/30 rounded-xl transform -rotate-45" />
            <div className="w-32 h-32 border-4 border-blue-300/30 rounded-xl transform -rotate-12 -translate-x-10 translate-y-10" />
          </div>
        </div>

        {/* Animated lines */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-20 w-40 h-1.5 bg-gradient-to-r from-blue-300/40 to-transparent transform rotate-45" />
          <div className="absolute top-1/4 right-20 w-40 h-1.5 bg-gradient-to-l from-cyan-300/40 to-transparent transform -rotate-45" />
          <div className="absolute bottom-1/4 left-20 w-40 h-1.5 bg-gradient-to-r from-purple-300/40 to-transparent transform -rotate-45" />
          <div className="absolute bottom-1/4 right-20 w-40 h-1.5 bg-gradient-to-l from-blue-300/40 to-transparent transform rotate-45" />
        </div>

        {/* Dot patterns */}
        <div className="absolute top-40 left-40 grid grid-cols-3 gap-6">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 bg-blue-400/40 rounded-full animate-pulse"
              style={{ animationDelay: `${i * 200}ms` }}
            />
          ))}
        </div>
        <div className="absolute bottom-40 right-40 grid grid-cols-3 gap-6">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 bg-purple-400/40 rounded-full animate-pulse"
              style={{ animationDelay: `${i * 200}ms` }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className={`relative z-10 w-full max-w-6xl transform transition-all duration-1000 ${
        isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}>
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 animate-gradient-x p-5">
            Smart Classroom Management System
          </h1>
          <p className="text-xl text-blue-700 max-w-3xl mx-auto mb-8 transform transition-all duration-700 delay-300">
            Revolutionizing education through advanced technology, our
            intelligent platform transforms classroom experiences by providing
            comprehensive tools for personalized learning, real-time insights,
            and seamless educational interactions.
          </p>
        </div>

        <div className="text-center transform transition-all duration-700 delay-500">
          <button 
            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg text-lg font-medium inline-flex items-center transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
            onClick={handleGetStartedClick}
          >
            Get Started
            <ArrowRight className="ml-2 animate-bounce-x" />
          </button>
        </div>
      </div>

      {/* Enhanced floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full animate-float-random ${
              i % 3 === 0 ? 'bg-blue-400/50' : i % 3 === 1 ? 'bg-cyan-400/50' : 'bg-purple-400/50'
            }`}
            style={{
              width: `${Math.random() * 6 + 3}px`,
              height: `${Math.random() * 6 + 3}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${Math.random() * 10 + 10}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

// Add required keyframes and animations
const style = document.createElement('style');
style.textContent = `
  @keyframes float-random {
    0% {
      transform: translate(0, 0);
      opacity: 0;
    }
    50% {
      opacity: 0.8;
    }
    100% {
      transform: translate(
        ${Math.random() * 200 - 100}px,
        ${Math.random() * 200 - 100}px
      );
      opacity: 0;
    }
  }
  
  @keyframes bounce-x {
    0%, 100% { transform: translateX(0); }
    50% { transform: translateX(4px); }
  }
  
  .animate-float-random {
    animation: float-random 20s linear infinite;
  }
  
  .animate-bounce-x {
    animation: bounce-x 1s ease-in-out infinite;
  }

  @keyframes gradient-x {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;
document.head.appendChild(style);

export default Home;