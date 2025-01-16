import React, { useState, useEffect } from 'react';
import { ArrowRight, Bell } from 'lucide-react';

const Notices = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const element = document.getElementById('notices');
      if (element) {
        const position = element.getBoundingClientRect();
        if (position.top < window.innerHeight * 0.75) {
          setIsVisible(true);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section id="notices" className="min-h-screen bg-gradient-to-b from-white to-blue-50 py-20 relative overflow-hidden">
      {/* Gradient background effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-white to-blue-50 opacity-50" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex items-center justify-center space-x-4 mb-12 transform translate-y-0 opacity-100 transition-all duration-700">
          <Bell className="w-8 h-8 text-blue-500" />
          <h2 className="text-3xl md:text-4xl font-bold text-center text-blue-900">
            Latest Notices
          </h2>
        </div>

        <div className="space-y-6">
          {[1, 2, 3].map((item, index) => (
            <div
              key={item}
              className={`transform transition-all duration-700 ${
                isVisible
                  ? 'translate-x-0 opacity-100'
                  : 'translate-x-full opacity-0'
              }`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-100 hover:border-blue-300 group relative">
                <div className="flex items-start">
                  <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                    {item}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2 text-blue-900 group-hover:text-blue-600 transition-colors duration-300">
                      Important Notice {item}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      Smart Automatic Attendance Feature Integrated. V1.2.12
                    </p>
                    <button className="text-blue-500 hover:text-blue-600 font-medium inline-flex items-center group/button">
                      Read More 
                      <ArrowRight className="ml-2 transform transition-transform duration-300 group-hover/button:translate-x-2" size={16} />
                    </button>
                  </div>
                </div>

                {/* Hover effect gradient border */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-200 via-blue-100 to-blue-200 opacity-0 group-hover:opacity-50 transition-opacity duration-300 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-blue-300 rounded-full opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float-${i} ${5 + Math.random() * 10}s linear infinite`,
              animationDelay: `${-Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <style>{`
        ${[...Array(20)].map((_, i) => `
          @keyframes float-${i} {
            0% {
              transform: translate(0, 0) rotate(0deg);
              opacity: 0;
            }
            50% {
              opacity: 0.2;
            }
            100% {
              transform: translate(${Math.random() * 100 - 50}px, -1000px) rotate(360deg);
              opacity: 0;
            }
          }
        `).join('\n')}
      `}</style>
    </section>
  );
};

export default Notices;