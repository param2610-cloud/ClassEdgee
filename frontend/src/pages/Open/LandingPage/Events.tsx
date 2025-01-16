import React from 'react';
import { ArrowRight } from 'lucide-react';

const AnimatedEventsSection = () => {
  return (
    <section className="relative min-h-screen bg-gradient-to-b from-white to-blue-50 py-20 overflow-hidden">
      {/* Animated background shapes */}
      <div 
        className="absolute top-20 left-0 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float-slow"
      />
      <div 
        className="absolute bottom-20 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-float-reverse"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 
          className="text-3xl md:text-4xl font-bold text-center mb-12 text-blue-900 animate-fade-in"
        >
          Upcoming Events
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out animate-fade-in-up group"
              style={{ animationDelay: `${item * 100}ms` }}
            >
              <div className="flex items-start">
                <div 
                  className="bg-blue-500 text-white p-3 rounded-lg text-center mr-4 transition-transform duration-300 ease-in-out hover:scale-110 hover:bg-blue-600"
                >
                  <div className="text-xl font-bold">15</div>
                  <div className="text-sm">MAR</div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-blue-900">Event Title {item}</h3>
                  <p className="text-gray-600 mb-4">
                    Join us for an exciting event that will feature networking opportunities and insightful discussions.
                  </p>
                  <button 
                    className="text-blue-500 hover:text-blue-600 font-medium inline-flex items-center group transition-all duration-300 ease-in-out hover:translate-x-2"
                  >
                    Learn More <ArrowRight className="ml-2" size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes float-slow {
          0% { transform: translate(0, 0); }
          50% { transform: translate(100px, -50px); }
          100% { transform: translate(0, 0); }
        }

        @keyframes float-reverse {
          0% { transform: translate(0, 0); }
          50% { transform: translate(-100px, 50px); }
          100% { transform: translate(0, 0); }
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-float-slow {
          animation: float-slow 20s linear infinite;
        }

        .animate-float-reverse {
          animation: float-reverse 25s linear infinite;
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }

        .animate-fade-in-up {
          opacity: 0;
          animation: fade-in-up 0.6s ease-out forwards;
        }
      `}</style>
    </section>
  );
};

export default AnimatedEventsSection;