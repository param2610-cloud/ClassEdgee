import  { useState } from 'react';
import { ArrowRight, Calendar, Clock, MapPin, Users } from 'lucide-react';

const AnimatedEventsSection = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  
  const categories = ['all', 'workshops', 'seminars', 'webinars', 'conferences'];
  
  const events = [
    {
      id: 1,
      title: "AI in Education Workshop",
      description: "Join us for an interactive workshop exploring the applications of artificial intelligence in modern education.",
      date: "Mar 15",
      time: "10:00 AM",
      location: "Main Hall",
      attendees: 68,
      category: "workshops",
      image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952"
    },
    {
      id: 2,
      title: "Digital Learning Seminar",
      description: "A comprehensive seminar on implementing effective digital learning strategies in the classroom environment.",
      date: "Mar 22",
      time: "2:00 PM",
      location: "Room 203",
      attendees: 42,
      category: "seminars",
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87"
    },
    {
      id: 3,
      title: "Future of EdTech Webinar",
      description: "Online discussion about emerging educational technologies and their impact on teaching and learning.",
      date: "Apr 5",
      time: "11:00 AM",
      location: "Virtual",
      attendees: 156,
      category: "webinars",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978"
    },
    {
      id: 4,
      title: "Education Innovation Conference",
      description: "Annual conference featuring thought leaders and innovators in educational technology and teaching methodologies.",
      date: "Apr 18",
      time: "9:00 AM",
      location: "Convention Center",
      attendees: 230,
      category: "conferences",
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c"
    }
  ];

  const filteredEvents = events.filter(event => 
    activeCategory === 'all' || event.category === activeCategory
  );

  return (
    <section id="events" className="relative min-h-screen bg-gradient-to-b from-blue-50 to-white py-20 overflow-hidden">
      {/* Enhanced animated background shapes */}
      <div 
        className="absolute top-20 left-10 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float-slow"
      />
      <div 
        className="absolute bottom-20 right-10 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-float-reverse"
      />
      <div 
        className="absolute top-1/3 right-1/3 w-80 h-80 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse-slow"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 
            className="text-3xl md:text-4xl font-bold mb-6 inline-block bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent"
          >
            Upcoming Events
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join our educational community for these exciting events designed to enhance learning experiences and professional growth.
          </p>
        </div>
        
        {/* Category filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeCategory === category
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-blue-50'
              }`}
            >
              <span className="capitalize">{category}</span>
            </button>
          ))}
        </div>
        
        {/* Events grid with improved cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 ease-in-out overflow-hidden group animate-fade-in-up hover:translate-y-[-5px]"
              style={{ animationDelay: `${event.id * 100}ms` }}
            >
              <div className="h-48 overflow-hidden relative">
                {/* Semi-transparent overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10"></div>
                
                {/* Image with zoom effect on hover */}
                <img 
                  src={`${event.image}?auto=format&fit=crop&w=800&q=80`}
                  alt={event.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
                />
                
                {/* Date badge */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-blue-800 rounded-lg overflow-hidden shadow-lg z-20">
                  <div className="px-3 py-1 text-center">
                    <div className="text-lg font-bold">{event.date.split(' ')[1]}</div>
                    <div className="text-xs uppercase">{event.date.split(' ')[0]}</div>
                  </div>
                </div>
                
                {/* Category tag */}
                <div className="absolute bottom-4 left-4 z-20">
                  <span className="inline-block px-3 py-1 bg-blue-600/80 backdrop-blur-sm text-white text-xs font-medium rounded-full capitalize">
                    {event.category}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-3 text-blue-900 group-hover:text-blue-600 transition-colors duration-300">
                  {event.title}
                </h3>
                
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {event.description}
                </p>
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6">
                  <div className="flex items-center">
                    <Clock size={16} className="mr-1 text-blue-500" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin size={16} className="mr-1 text-blue-500" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Users size={16} className="mr-1 text-blue-500" />
                    <span>{event.attendees} attendees</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <button className="text-blue-500 hover:text-blue-600 font-medium inline-flex items-center group/button">
                    View Details
                    <ArrowRight className="ml-2 transform transition-transform duration-300 group-hover/button:translate-x-2" size={16} />
                  </button>
                  
                  <button className="inline-flex items-center justify-center p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors duration-300">
                    <Calendar size={18} className="text-blue-600" />
                  </button>
                </div>
              </div>
              
              {/* Bottom accent border */}
              <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
            </div>
          ))}
        </div>
        
        {/* View all events button */}
        <div className="text-center mt-12">
          <button className="inline-flex items-center px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-300 font-medium">
            View All Events
            <ArrowRight className="ml-2" size={16} />
          </button>
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

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.7; }
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
          animation: float-slow 25s linear infinite;
        }

        .animate-float-reverse {
          animation: float-reverse 30s linear infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 10s ease-in-out infinite;
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }

        .animate-fade-in-up {
          opacity: 0;
          animation: fade-in-up 0.8s ease-out forwards;
        }
      `}</style>
    </section>
  );
};

export default AnimatedEventsSection;