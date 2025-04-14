
import { Brain, Calendar, Bell, Shield, BookOpen, BarChart3, MessageCircle, User } from 'lucide-react';

const Features = () => {
  const featuresList = [
    {
      icon: <User className="h-6 w-6 text-blue-600" />,
      title: "Face Recognition Attendance",
      description: "Leverages existing security cameras to capture student attendance in real-time using advanced face recognition technology."
    },
    {
      icon: <Calendar className="h-6 w-6 text-green-600" />,
      title: "Intelligent Scheduling",
      description: "Dynamically allocates faculty, subjects, and sections based on real-time availability and requirements."
    },
    {
      icon: <Bell className="h-6 w-6 text-orange-600" />,
      title: "Event Automation",
      description: "Create pre-announced events with targeted audiences and automatic routine adjustments for mandatory events."
    },
    {
      icon: <BookOpen className="h-6 w-6 text-purple-600" />,
      title: "Resource Management",
      description: "Real-time tracking of classroom and seminar room availability, ongoing classes, and resource allocation."
    },
    {
      icon: <Shield className="h-6 w-6 text-red-600" />,
      title: "Emergency Alerts",
      description: "Integrated with sensors to automatically notify staff, students, and authorities during emergencies."
    },
    {
      icon: <MessageCircle className="h-6 w-6 text-cyan-600" />,
      title: "Communication Bridge",
      description: "Section-based rooms for announcements and resource sharing between teachers and class representatives."
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-indigo-600" />,
      title: "Data Analytics",
      description: "Analyzes student behavior, attendance patterns, and resource utilization to generate insights and predictive reports."
    },
    {
      icon: <Brain className="h-6 w-6 text-yellow-600" />,
      title: "AI-powered Chatbot",
      description: "Utilizes NLP to help students identify learning gaps and provide personalized insights through performance data."
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-6">
            Comprehensive Smart Classroom Features
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our platform integrates multiple advanced technologies to create an intelligent, 
            efficient, and responsive educational environment.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuresList.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl shadow-md hover:shadow-xl p-6 transition-all duration-300 hover:transform hover:scale-105 border border-gray-100"
            >
              <div className="bg-blue-50 p-3 rounded-full inline-block mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-blue-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <a 
            href="#demo" 
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-300"
          >
            See How It Works
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Features;
