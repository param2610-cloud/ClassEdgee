import {  Check, Sparkles, Users, X, Send, Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
import emailjs from '@emailjs/browser';

// Form component for requesting a demo
const DemoRequestForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };


  
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    // Replace with your actual EmailJS details
    const serviceId = 'service_jdzjilq';
    const templateId = 'template_paugtli';
    const publicKey = '8atCVOOl1THkM_Pof';
    
    // Format current date for the email
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Prepare template parameters
    const templateParams = {
      user_name: formData.name,
      user_email: formData.email,
      user_phone: formData.phone || 'Not provided',
      organization: formData.organization,
      message: formData.notes || 'No additional notes provided',
      submit_date: formattedDate
    };
    
    try {
      await emailjs.send(serviceId, templateId, templateParams, publicKey);
      
      setSubmitted(true);
      
      // Reset form after showing success message
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          organization: '',
          notes: ''
        });
      }, 3000);
    } catch (error) {
      console.error('Failed to send email:', error);
      setError('Failed to submit your request. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Form header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white relative">
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 text-white/80 hover:text-white transition-colors focus:outline-none"
            aria-label="Close form"
          >
            <X size={20} />
          </button>
          <h3 className="text-xl font-bold flex items-center">
            <Users className="mr-2" />
            Request a Demo
          </h3>
          <p className="mt-1 text-blue-100">
            Fill out the form below and we'll contact you shortly
          </p>
        </div>
        
        {/* Form body */}
        {!submitted ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="john@example.com"
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              
              <div>
                <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-1">Organization/School *</label>
                <input
                  id="organization"
                  name="organization"
                  type="text"
                  required
                  value={formData.organization}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="University/School Name"
                />
              </div>
              
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                  placeholder="Tell us about your specific needs or questions..."
                />
              </div>
            </div>
            
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-md shadow-md transition-all duration-300 hover:shadow-lg flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5" />
                    Submit Request
                  </>
                )}
              </button>
            </div>
            
            {error && (
              <p className="text-sm text-red-500 text-center mt-4">
                {error}
              </p>
            )}
            
            <p className="text-xs text-gray-500 text-center mt-4">
              We value your privacy. We'll never share your information with third parties.
            </p>
          </form>
        ) : (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Thank You!</h3>
            <p className="text-gray-600">
              Your demo request has been received. We'll contact you soon to schedule your personalized demo.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const Home: React.FC = () => {
  // const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [showDemoForm, setShowDemoForm] = useState(false);
  const features = [
    "Smart Attendance System",
    "Intelligent Resource Management",
    "Real-time Emergency Alerts",
    "Personalized Learning Analytics"
  ];

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // const handleGetStartedClick = () => {
  //   navigate('/auth/signin');
  // };

  const handleOpenDemoForm = () => {
    setShowDemoForm(true);
  };
  
  const handleCloseDemoForm = () => {
    setShowDemoForm(false);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 overflow-hidden relative">
      {/* Enhanced background with more complex gradients */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-blue-200/40 to-cyan-200/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-gradient-to-tr from-purple-200/40 to-blue-200/40 rounded-full blur-3xl" />
        
        {/* Additional organic shapes */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-bl from-blue-100/30 to-cyan-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-gradient-to-tr from-purple-100/20 to-blue-100/20 rounded-full blur-3xl" />
        
        {/* Geometric patterns - enhanced */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 right-20 opacity-60">
            <div className="w-32 h-32 border-4 border-blue-300/30 rounded-xl transform rotate-45 animate-float-slow" />
            <div className="w-32 h-32 border-4 border-cyan-300/30 rounded-xl transform rotate-12 translate-x-10 -translate-y-10 animate-float-slow-reverse" />
          </div>

          <div className="absolute bottom-20 left-20 opacity-60">
            <div className="w-32 h-32 border-4 border-purple-300/30 rounded-xl transform -rotate-45 animate-float-slow-reverse" />
            <div className="w-32 h-32 border-4 border-blue-300/30 rounded-xl transform -rotate-12 -translate-x-10 translate-y-10 animate-float-slow" />
          </div>
        </div>

        {/* Animated lines with gradient */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-20 w-40 h-1.5 bg-gradient-to-r from-blue-400/40 to-transparent transform rotate-45" />
          <div className="absolute top-1/4 right-20 w-40 h-1.5 bg-gradient-to-l from-cyan-400/40 to-transparent transform -rotate-45" />
          <div className="absolute bottom-1/4 left-20 w-40 h-1.5 bg-gradient-to-r from-purple-400/40 to-transparent transform -rotate-45" />
          <div className="absolute bottom-1/4 right-20 w-40 h-1.5 bg-gradient-to-l from-blue-400/40 to-transparent transform rotate-45" />
        </div>

        {/* Dot patterns with pulsating animation */}
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

      {/* Content - Enhanced with two-column layout */}
      <div className={`relative z-10 w-full max-w-7xl transform transition-all duration-1000 ${
        isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-600 font-medium text-sm mb-6">
              <Sparkles size={16} className="mr-2" />
              <span>Intelligent classroom solution</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 animate-gradient-x leading-tight">
              Smart Classroom Management
            </h1>
            
            <p className="text-xl text-blue-700 mb-8 transform transition-all duration-700 delay-300 leading-relaxed">
              Revolutionize education with our advanced platform that enhances 
              classroom experiences through AI-powered tools, analytics, and seamless integration.
            </p>
            
            <div className="mb-8">
              <ul className="space-y-2">
                {features.map((feature, index) => (
                  <li 
                    key={index} 
                    className="flex items-center transform transition-all duration-700"
                    style={{ transitionDelay: `${(index + 4) * 100}ms` }}
                  >
                    <div className="bg-green-100 p-1 rounded-full mr-3">
                      <Check size={16} className="text-green-600" />
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="transform transition-all duration-700 delay-700 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center lg:justify-start">
              {/* <button 
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium inline-flex items-center justify-center transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 transform hover:translate-y-[-2px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={handleGetStartedClick}
              >
                Get Started
                <ArrowRight className="ml-2 animate-bounce-x" size={18} />
              </button> */}
              
              <button 
                className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg text-lg font-medium inline-flex items-center justify-center transition-all duration-300"
                onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Learn More
              </button>

              <button 
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg text-lg font-medium inline-flex items-center justify-center transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30 transform hover:translate-y-[-2px] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                onClick={handleOpenDemoForm}
              >
                <Users className="mr-2" size={18} />
                Request Demo
              </button>
            </div>
          </div>
          
          {/* Image/Illustration */}
          <div className="hidden lg:block">
            <div className="relative h-[500px] w-full">
              {/* Glass card effect */}
              <div className="absolute top-10 right-10 w-72 h-72 bg-white/20 backdrop-blur-lg rounded-2xl border border-white/30 shadow-xl transform rotate-6 transition-all duration-700 hover:rotate-3"></div>
              
              <div className="absolute top-40 right-40 w-64 h-64 bg-blue-500/10 backdrop-blur-lg rounded-2xl border border-blue-100/30 shadow-xl transform -rotate-3 transition-all duration-700 hover:rotate-0"></div>
              
              <div className="absolute top-20 right-32 w-80 h-80 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full opacity-10 blur-3xl animate-pulse-slow"></div>
              
              {/* Platform UI mockup */}
              <div className="absolute top-1/2 right-0 transform -translate-y-1/2 w-96 h-[420px] bg-white/90 backdrop-blur-lg rounded-xl shadow-2xl border border-gray-100 overflow-hidden">
                {/* Mockup header */}
                <div className="bg-blue-600 text-white p-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">ClassEDGEE Dashboard</h4>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 rounded-full bg-red-400"></div>
                      <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                      <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    </div>
                  </div>
                </div>
                
                {/* Mockup content */}
                <div className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h5 className="font-medium text-gray-800">Today's Schedule</h5>
                    <span className="text-sm text-blue-600">View All</span>
                  </div>
                  
                  {/* Sample schedule items */}
                  {[1, 2, 3].map(item => (
                    <div 
                      key={item} 
                      className="bg-gray-50 p-3 rounded-lg mb-3 border border-gray-100 flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium text-sm text-gray-800">Computer Science {item}</p>
                        <p className="text-xs text-gray-500">Room 10{item} • 9:00 AM</p>
                      </div>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                  ))}
                  
                  <div className="mt-6 mb-4">
                    <h5 className="font-medium text-gray-800 mb-3">Attendance Overview</h5>
                    <div className="h-2 w-full bg-gray-200 rounded-full">
                      <div className="h-2 bg-blue-500 rounded-full w-4/5"></div>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-500">Present: 85%</span>
                      <span className="text-xs text-gray-500">Absent: 15%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced floating particles with better animation */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(25)].map((_, i) => (
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

      {/* Demo Request Form Modal */}
      {showDemoForm && <DemoRequestForm onClose={handleCloseDemoForm} />}

      <style>{`
        @keyframes float-slow {
          0% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(15px, -15px) rotate(5deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }
        
        @keyframes float-slow-reverse {
          0% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(-15px, 15px) rotate(-5deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.2; }
        }
        
        .animate-float-slow {
          animation: float-slow 10s ease-in-out infinite;
        }
        
        .animate-float-slow-reverse {
          animation: float-slow-reverse 15s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Home;