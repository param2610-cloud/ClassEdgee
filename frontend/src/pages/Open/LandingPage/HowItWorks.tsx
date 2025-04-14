import React from 'react';
import { 
  UserCheck, Database, Clock, PieChart, 
  AlertTriangle, BookOpen, Users, ArrowRight 
} from 'lucide-react';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      icon: <UserCheck className="w-8 h-8 text-blue-600" />,
      title: "Attendance Capture",
      description: "Facial recognition cameras identify students entering the classroom"
    },
    {
      icon: <Database className="w-8 h-8 text-blue-600" />,
      title: "Data Processing",
      description: "System processes and stores attendance data securely"
    },
    {
      icon: <Clock className="w-8 h-8 text-blue-600" />,
      title: "Real-time Access",
      description: "Teachers and admins access attendance information instantly"
    },
    {
      icon: <PieChart className="w-8 h-8 text-blue-600" />,
      title: "Analytics & Reporting",
      description: "System generates insights and automated reports"
    }
  ];

  const additionalFlows = [
    {
      icon: <AlertTriangle className="w-8 h-8 text-red-600" />,
      title: "Emergency Detection",
      description: "Sensors detect emergencies like fire, gas leaks, or other hazards",
      subSteps: ["Alert Generation", "Notification Distribution", "Response Coordination"]
    },
    {
      icon: <BookOpen className="w-8 h-8 text-purple-600" />,
      title: "Resource Management",
      description: "Digital resources are organized and distributed to students",
      subSteps: ["Content Upload", "Access Control", "Usage Analytics"]
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-b from-white to-blue-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-40 left-20 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
          <div className="absolute bottom-40 right-20 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
        </div>
        
        <div className="text-center mb-16 relative">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-6">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our smart classroom system seamlessly integrates multiple technologies to create an efficient,
            intelligent learning environment. Here's how it all comes together:
          </p>
        </div>
        
        {/* Main workflow */}
        <div className="relative mb-24">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-blue-200 -translate-y-1/2 hidden md:block" />
          
          <div className="grid md:grid-cols-4 gap-8 relative">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-xl shadow-lg p-6 relative z-10 h-full border border-blue-100 transition-transform duration-300 hover:-translate-y-2">
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-blue-50 rounded-full p-4 mb-4">
                      {step.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-blue-900 mb-2">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </div>
                
                {/* Step number */}
                <div className="absolute top-0 left-0 -translate-x-1/4 -translate-y-1/4 bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold z-20">
                  {index + 1}
                </div>
                
                {/* Arrow for desktop */}
                {index < steps.length - 1 && (
                  <div className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 hidden md:block z-10">
                    <ArrowRight className="h-8 w-8 text-blue-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Additional flows */}
        <div className="grid md:grid-cols-2 gap-12 relative">
          {additionalFlows.map((flow, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
              <div className="flex items-start mb-6">
                <div className={`rounded-full p-3 mr-4 ${index === 0 ? 'bg-red-50' : 'bg-purple-50'}`}>
                  {flow.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-blue-900">{flow.title}</h3>
                  <p className="text-gray-600">{flow.description}</p>
                </div>
              </div>
              
              {/* Sub-steps flowchart */}
              <div className="pl-16 relative">
                <div className="absolute left-6 top-0 bottom-0 w-1 bg-gray-200 rounded" />
                
                {flow.subSteps.map((subStep, idx) => (
                  <div key={idx} className="mb-4 relative">
                    <div className="absolute left-0 top-1/2 -translate-x-[19px] -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-blue-500" />
                    <div className="bg-gray-50 rounded-lg p-4 ml-2">
                      <p className="text-gray-800">{subStep}</p>
                    </div>
                    {idx < flow.subSteps.length - 1 && (
                      <div className="absolute left-0 bottom-0 -translate-x-[9px] translate-y-1/2 rotate-90">
                        <ArrowRight className="h-4 w-4 text-blue-400" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* Bottom CTA */}
        <div className="mt-16 text-center relative">
          <a 
            href="#demo" 
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-300"
          >
            <Users className="mr-2 h-5 w-5" />
            Request a Demo
          </a>
        </div>
      </div>
      
      {/* Enhanced styling with SVG patterns */}
      <div className="absolute bottom-0 left-0 right-0 h-32 overflow-hidden z-0 opacity-20">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="absolute bottom-0">
          <path fill="#60A5FA" fillOpacity="0.3" d="M0,96L48,128C96,160,192,224,288,213.3C384,203,480,117,576,96C672,75,768,117,864,154.7C960,192,1056,224,1152,208C1248,192,1344,128,1392,96L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
    </section>
  );
};

export default HowItWorks;
