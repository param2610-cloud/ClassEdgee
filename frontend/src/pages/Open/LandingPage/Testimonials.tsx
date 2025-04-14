import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';

const Testimonials: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);
  
interface Testimonial {
    id: number;
    quote: string;
    name: string;
    title: string;
    image: string;
    stars: number;
    stats: {
        label: string;
        value: string;
    };
}

const testimonials: Testimonial[] = [
    {
        id: 1,
        quote: "The technical implementation of the real-time alert system demonstrates exceptional understanding of critical response requirements in educational environments",
        name: "Karan Kumar",
        title: "Senior Developer,Salesforce",
        image: "",
        stars: 5,
        stats: {
            label: "Robust Architecture Implemented",
            value: "98%"
        }
    },
    {
        id: 2,
        quote: "I'm impressed by the robust architecture and seamless integration of this platform's core systems - it handles complex data processing while maintaining an intuitive user experience.",
        name: "Priyanshu Jain",
        title: "Software Engineer, Productive",
        image: "",
        stars: 5,
        stats: {
            label: "Seamless System Integration",
            value: "70%"
        }
    },
    {
        id: 3,
        quote: " The analytics engine's ability to process diverse learning patterns and deliver actionable insights shows remarkable algorithmic efficiency",
        name: "Himanshu Jain",
        title: "MI/ML Engineer,Meta",
        image: "",
        stars: 4,
        stats: {
            label: "Exceptional Algorithm Performance",
            value: "87%"
        }
    },
    {
      id: 4,
      quote: "This system increased my classroom efficiency by 40% - I no longer waste time on manual attendance or searching for resources when I need them most",
      name: "Amrut Ranjan Jana",
      title: "Head Of Department, DSCIT",
      image: "",
      stars: 4,
      stats: {
          label: "Efficiency increase",
          value: "40%"
      }
  },
  {
    id: 5,
    quote: "The personalized analytics transformed my teaching approach completely - my students' test scores improved by 27% this semester because I could finally target specific learning gaps.",
    name: "Madhusmita Mishra",
    title: "Professor, DSCIT",
    image: "",
    stars: 4,
    stats: {
        label: "Scores improved ",
        value: "47%"
    }
}

];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isAutoplay) {
      interval = setInterval(() => {
        setActiveIndex((current) => (current + 1) % testimonials.length);
      }, 8000);
    }
    
    return () => clearInterval(interval);
  }, [isAutoplay, testimonials.length]);

  const handlePrev = () => {
    setIsAutoplay(false);
    setActiveIndex((current) => (current - 1 + testimonials.length) % testimonials.length);
  };

  const handleNext = () => {
    setIsAutoplay(false);
    setActiveIndex((current) => (current + 1) % testimonials.length);
  };

  const handleDotClick = (index: number) => {
    setIsAutoplay(false);
    setActiveIndex(index);
  };

  return (
    <section id="testimonials" className="py-20 bg-gradient-to-b from-blue-50 to-white relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-40 left-20 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
        <div className="absolute bottom-40 right-20 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-48 h-48 bg-cyan-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-6">
            Success Stories
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            See how educational institutions are transforming their classrooms with our intelligent solutions.
          </p>
        </div>
        
        <div className="relative">
          {/* Testimonial carousel */}
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="w-full flex-shrink-0">
                  <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mx-4 md:mx-8 flex flex-col md:flex-row gap-8 items-center border border-blue-100">
                    <div className="md:w-1/3">
                      <div className="relative">
                        {/* Decorative quote icon */}
                        <div className="absolute -top-6 -left-6 text-blue-200">
                          <Quote size={48} />
                        </div>
                        
                        {/* Placeholder for profile initials */}
                        <div className="relative z-10 flex items-center justify-center w-32 h-32 md:w-48 md:h-48 rounded-full bg-blue-200 text-blue-900 text-3xl md:text-5xl font-bold border-4 border-white shadow-lg">
                          {testimonial.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        
                        {/* Stats callout */}
                        <div className="absolute -bottom-4 -right-4 bg-blue-600 text-white rounded-lg py-2 px-4 shadow-lg">
                          <p className="text-xs font-medium">{testimonial.stats.label}</p>
                          <p className="text-2xl font-bold">{testimonial.stats.value}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="md:w-2/3">
                      {/* Star rating */}
                      <div className="flex mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i}
                            size={20}
                            className={i < testimonial.stars ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                          />
                        ))}
                      </div>
                      
                      {/* Quote */}
                      <blockquote className="text-xl md:text-2xl text-gray-700 font-light italic mb-6 leading-relaxed">
                        "{testimonial.quote}"
                      </blockquote>
                      
                      {/* Attribution */}
                      <div>
                        <p className="font-semibold text-lg text-blue-900">{testimonial.name}</p>
                        <p className="text-gray-600">{testimonial.title}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Navigation arrows */}
          <button 
            onClick={handlePrev}
            className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md text-blue-600 hover:text-blue-800 transition-colors z-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Previous testimonial"
          >
            <ChevronLeft size={24} />
          </button>
          
          <button
            onClick={handleNext}
            className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md text-blue-600 hover:text-blue-800 transition-colors z-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Next testimonial"
          >
            <ChevronRight size={24} />
          </button>
        </div>
        
        {/* Dots navigation */}
        <div className="flex justify-center mt-8 space-x-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === activeIndex 
                  ? 'bg-blue-600 w-8' 
                  : 'bg-blue-200 hover:bg-blue-300'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
        
        {/* Additional case studies link */}
       
      </div>
      
      {/* Decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-32 overflow-hidden z-0 opacity-20">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="absolute bottom-0">
          <path fill="#60A5FA" fillOpacity="0.3" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,250.7C960,235,1056,181,1152,165.3C1248,149,1344,171,1392,181.3L1440,192L1440,320L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
    </section>
  );
};

export default Testimonials;
