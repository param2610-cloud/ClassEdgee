import { AlertCircle, ArrowRight, LightbulbIcon, RocketIcon, TargetIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const cardVariants = {
  initial: { opacity: 0, y: 50 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
  hover: {
    scale: 1.05,
    boxShadow:
      "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)",
  },
};

const About: React.FC = () => {
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
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-6xl font-extrabold text-blue-700 mb-6 tracking-tight">
            About Our Smart Classroom
          </h2>
          <p className="text-xl text-blue-600 max-w-3xl mx-auto leading-relaxed">
            Transforming education through innovative technology, we create
            intelligent learning environments that adapt, engage, and inspire
            students and educators alike.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Vision Card */}
          <motion.div
            variants={cardVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
            className="bg-blue-950 border border-gray-700 rounded-2xl p-8 transform transition-all duration-300"
          >
            <div className="flex items-center mb-4">
              <TargetIcon className="w-12 h-12 text-orange-500  mr-4" />
              <h3 className="text-3xl font-bold text-white">Smart Attandance</h3>
            </div>
            <p className="text-white leading-relaxed">
            Our facial recognition system captures student images in real-time and matches them against the stored database to identify individuals. Attendance is automatically recorded and updated in the system once a face is successfully recognized.
            </p>
          </motion.div>

          {/* Mission Card */}
          <motion.div
            variants={cardVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
            className="bg-blue-950 border border-gray-700 rounded-2xl p-8 transform transition-all duration-300"
          >
            <div className="flex items-center mb-4">
              <LightbulbIcon className="w-12 h-12 text-green-500 mr-4" />
              <h3 className="text-3xl font-bold text-white">Resource Management</h3>
            </div>
            <p className="text-white leading-relaxed">
            Our system organizes study resources like PDFs, PPTs, videos, and links into a centralized digital library, accessible anytime. Teachers can upload and manage content, while students can search, download, and interact with materials based on their courses.
            </p>
          </motion.div>

          {/* Why Choose Us Card */}
          <motion.div
            variants={cardVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
            className="bg-blue-950 border border-gray-700 rounded-2xl p-8 transform transition-all duration-300"
          >
            <div className="flex items-center mb-4">
              <AlertCircle className="w-12 h-12 text-purple-500 mr-4" />
              <h3 className="text-3xl font-bold text-white">Emergency Alert</h3>
            </div>
            <p className="text-white leading-relaxed">
            Our system uses sensors to detect emergencies like fire and instantly triggers an alert.Notifications are sent to everyone's devices via an integrated API, ensuring swift communication and safety
            </p>
          </motion.div>
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

export default About;