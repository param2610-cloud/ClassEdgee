import React from "react";
import { motion } from "framer-motion";
import { TargetIcon, LightbulbIcon, RocketIcon } from "lucide-react";

const About: React.FC = () => {
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

  return (
    <section
      id="about"
      className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black min-h-screen flex items-center py-20 overflow-hidden"
    >
      {/* Subtle Background Patterns */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-900 rounded-full mix-blend-overlay filter blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-900 rounded-full mix-blend-overlay filter blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-6xl font-extrabold text-white mb-6 tracking-tight">
            About Our Smart Classroom
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
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
            className="bg-gray-800 border border-gray-700 rounded-2xl p-8 transform transition-all duration-300"
          >
            <div className="flex items-center mb-4">
              <TargetIcon className="w-12 h-12 text-blue-500 mr-4" />
              <h3 className="text-3xl font-bold text-white">Our Vision</h3>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Create a dynamic, adaptive learning environment that nurtures
              individual potential and prepares students for a rapidly evolving
              world.
            </p>
          </motion.div>

          {/* Mission Card */}
          <motion.div
            variants={cardVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
            className="bg-gray-800 border border-gray-700 rounded-2xl p-8 transform transition-all duration-300"
          >
            <div className="flex items-center mb-4">
              <LightbulbIcon className="w-12 h-12 text-green-500 mr-4" />
              <h3 className="text-3xl font-bold text-white">Our Mission</h3>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Leverage cutting-edge technology to simplify classroom management,
              personalize learning experiences, and empower educators with
              actionable insights.
            </p>
          </motion.div>

          {/* Why Choose Us Card */}
          <motion.div
            variants={cardVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
            className="bg-gray-800 border border-gray-700 rounded-2xl p-8 transform transition-all duration-300"
          >
            <div className="flex items-center mb-4">
              <RocketIcon className="w-12 h-12 text-purple-500 mr-4" />
              <h3 className="text-3xl font-bold text-white">Why Choose Us</h3>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Innovative real-time insights, AI-driven personalized learning
              paths, and an intuitive interface that makes classroom management
              effortless and engaging.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
