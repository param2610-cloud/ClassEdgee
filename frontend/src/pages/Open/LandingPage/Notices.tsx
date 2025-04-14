import  { useState, useEffect } from 'react';
import { ArrowRight, Bell, Search, Filter, ChevronRight } from 'lucide-react';

const Notices = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const noticeCategories = ['all', 'general', 'academic', 'events'];
  
  const notices = [
    {
      id: 1,
      title: "Smart Attendance System Update",
      description: "A new facial recognition algorithm has been implemented to improve attendance tracking accuracy. The system now processes attendance 30% faster.",
      category: "general",
      date: "Mar 15, 2023",
      priority: "high"
    },
    {
      id: 2,
      title: "Resource Management Integration",
      description: "New digital library features now available. Access study materials, PDFs, and videos from any device with improved search functionality.",
      category: "academic",
      date: "Mar 10, 2023",
      priority: "medium"
    },
    {
      id: 3,
      title: "Emergency Alert System Test",
      description: "A scheduled test of the emergency alert system will be conducted next week. All users will receive a notification to ensure proper functionality.",
      category: "events",
      date: "Mar 5, 2023",
      priority: "low"
    }
  ];

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

  const filteredNotices = notices.filter(notice => 
    (activeFilter === 'all' || notice.category === activeFilter) && 
    (notice.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
     notice.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );



  type Priority = 'high' | 'medium' | 'low';

  const getPriorityStyles = (priority: Priority): string => {
    switch(priority) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  return (
    <section id="notices" className="min-h-screen bg-gradient-to-b from-white to-blue-50 py-20 relative overflow-hidden">
      {/* Enhanced background with animated gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 via-white/80 to-blue-50/30 opacity-80" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 mb-12">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-blue-100 rounded-full text-blue-600">
              <Bell className="w-8 h-8" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Latest Notices
            </h2>
          </div>
          
          {/* Search and filter */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search notices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 w-full sm:w-64"
              />
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            
            <div className="relative inline-flex">
              <select
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-300 pl-10 pr-8 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 cursor-pointer"
              >
                {noticeCategories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
              <Filter size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              <ChevronRight size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Notice cards with improved layout and animations */}
        <div className="space-y-6">
          {filteredNotices.length > 0 ? (
            filteredNotices.map((notice, index) => (
              <div
                key={notice.id}
                className={`transform transition-all duration-700 ${
                  isVisible
                    ? 'translate-x-0 opacity-100'
                    : 'translate-x-full opacity-0'
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-100 hover:border-blue-300 group relative">
                  {/* Priority indicator */}
                  <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityStyles(notice.priority as Priority)}`}>
                      {notice.priority}
                    </span>
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:items-start">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300 flex-shrink-0 mb-4 md:mb-0">
                      {notice.id}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                        <h3 className="text-xl font-semibold mb-1 sm:mb-0 text-blue-900 group-hover:text-blue-600 transition-colors duration-300">
                          {notice.title}
                        </h3>
                        <span className="text-sm text-gray-500">{notice.date}</span>
                      </div>
                      
                      <span className="inline-block px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium mb-3 capitalize">
                        {notice.category}
                      </span>
                      
                      <p className="text-gray-600 mb-4">
                        {notice.description}
                      </p>
                      
                      <button className="text-blue-500 hover:text-blue-600 font-medium inline-flex items-center group/button">
                        Read More 
                        <ArrowRight className="ml-2 transform transition-transform duration-300 group-hover/button:translate-x-2" size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Enhanced hover gradient effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-100/50 to-purple-100/50 opacity-0 group-hover:opacity-50 transition-opacity duration-300 rounded-xl pointer-events-none" />
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white p-8 rounded-lg shadow text-center">
              <p className="text-gray-500 text-lg">No notices found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              backgroundColor: i % 3 === 0 ? 'rgba(59, 130, 246, 0.2)' : i % 3 === 1 ? 'rgba(6, 182, 212, 0.2)' : 'rgba(147, 51, 234, 0.2)',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float-${i % 10} ${5 + Math.random() * 15}s linear infinite`,
              animationDelay: `${-Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <style>{`
        ${[...Array(10)].map((_, i) => `
          @keyframes float-${i} {
            0% {
              transform: translate(0, 0) scale(1);
              opacity: 0;
            }
            25% {
              opacity: 0.8;
              transform: scale(${1 + Math.random() * 0.5});
            }
            50% {
              opacity: 0.4;
            }
            75% {
              opacity: 0.8;
              transform: scale(${1 - Math.random() * 0.3});
            }
            100% {
              transform: translate(${Math.random() * 200 - 100}px, -1000px) scale(1);
              opacity: 0;
            }
          }
        `).join('\n')}
      `}</style>
    </section>
  );
};

export default Notices;