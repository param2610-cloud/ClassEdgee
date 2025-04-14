import  { useState, useEffect } from 'react';
import { Menu, X, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Home from './Home';
import About from './About';
import NoticesSection from './Notices';
import Events from './Events';
import Features from './Features'; // Import the Features component
import Testimonials from './Testimonials';
import HowItWorks from './HowItWorks';

const LandingPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [scrolled, setScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'features', 'notices', 'events']; // Added 'features' to sections array
      const scrollPosition = window.scrollY + 100;
      
      // Set scrolled state for navbar styling
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      // Show/hide scroll to top button
      if (window.scrollY > 500) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }

      sections.forEach(section => {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetBottom = offsetTop + element.offsetHeight;

          if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
            setActiveSection(section);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLoginClick = () => {
    navigate('/auth/signin');
  };

  const handleRegisterationClick = () => {
    navigate('/auth/signup');
  };

  // Smooth scroll function
  const scrollToSection = (sectionId:string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 64, // Account for navbar height
        behavior: 'smooth'
      });
    }
    setIsOpen(false);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="relative">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/90 backdrop-blur-lg shadow-lg py-2' 
          : 'bg-white/80 backdrop-blur-sm py-4'
      }`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex-shrink-0">
              <div className="text-blue-700 text-xl font-bold flex items-center">
                <span className="bg-gradient-to-r from-blue-600 to-blue-400 text-transparent bg-clip-text">
                  ClassEDGEE
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="flex space-x-8">
                {['home', 'about', 'features', 'notices', 'events'].map((item) => ( // Added 'features' to navigation
                  <button
                    key={item}
                    onClick={() => scrollToSection(item)}
                    className={`${
                      activeSection === item
                        ? 'text-blue-700 border-b-2 border-blue-400'
                        : 'text-gray-700 hover:text-blue-600 hover:border-b-2 hover:border-blue-400'
                    } px-3 py-2 text-lg font-medium capitalize transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 rounded-md`}
                    aria-current={activeSection === item ? 'page' : undefined}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Auth Buttons - Desktop */}
            <div className="hidden md:flex items-center space-x-4">
              <button 
                className="text-blue-600 hover:text-blue-800 border border-blue-600 hover:border-blue-800 px-5 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2" 
                onClick={handleLoginClick}
              >
                Login
              </button>
              <button 
                className="text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 px-5 py-2 rounded-md text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200 transform hover:translate-y-[-1px] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2" 
                onClick={handleRegisterationClick}
              >
                Register
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 p-1 rounded-md"
                aria-expanded={isOpen}
                aria-controls="mobile-menu"
              >
                <span className="sr-only">{isOpen ? 'Close menu' : 'Open menu'}</span>
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          id="mobile-menu"
          className={`md:hidden bg-white shadow-lg border-t overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            {['home', 'about', 'features', 'notices', 'events'].map((item) => ( // Added 'features' to mobile navigation
              <button
                key={item}
                onClick={() => scrollToSection(item)}
                className={`${
                  activeSection === item
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                } block w-full text-left px-3 py-3 rounded-md text-base font-medium capitalize transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400`}
                aria-current={activeSection === item ? 'page' : undefined}
              >
                {item}
              </button>
            ))}
            <div className="pt-4 space-y-2 px-3">
              <button 
                className="w-full text-blue-600 border border-blue-600 px-4 py-3 rounded-md transition-colors duration-200 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400" 
                onClick={handleLoginClick}
              >
                Login
              </button>
              <button 
                className="w-full text-white bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3 rounded-md shadow-sm transition-all duration-200 hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400" 
                onClick={handleRegisterationClick}
              >
                Register
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Scroll Indicator */}
      <div className="fixed bottom-6 right-6 z-40 transition-all duration-300" style={{ opacity: showScrollTop ? 1 : 0 }}>
        <button 
          onClick={scrollToTop}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
          aria-label="Scroll to top"
        >
          <ChevronUp size={20} />
        </button>
      </div>

      {/* Hero Section */}
      <section id="home" className="min-h-screen pt-20 bg-gradient-to-b from-blue-50 to-white">
        <Home/>
      </section>

      {/* About Section */}
      <section id="about">
        <About/>
      </section>

      {/* Features Section */}
      <section id="features">
        <Features/>
      </section>

      {/* Notices Section */}
      <section id="notices" className="min-h-screen">
        <NoticesSection/>
      </section>

      {/* Events Section */}
      <Events/>

      <Testimonials/>
      <HowItWorks/>
      {/* <Pricing /> */}

      {/* Footer - Enhanced */}
      <footer className="bg-gradient-to-b from-blue-800 to-blue-900 text-white py-12 relative overflow-hidden">
        {/* Footer background decorations */}
        <div className="absolute inset-0 overflow-hidden opacity-30">
          <div className="absolute -top-40 right-10 w-80 h-80 bg-blue-500 rounded-full filter blur-3xl"></div>
          <div className="absolute -bottom-40 left-10 w-80 h-80 bg-blue-400 rounded-full filter blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="md:flex md:justify-between">
            <div className="mb-8 md:mb-0">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-300 to-white text-transparent bg-clip-text">ClassEDGEE</span>
              <p className="mt-3 text-blue-200 text-sm max-w-md">Transforming education through innovative technology, creating intelligent learning environments that adapt, engage, and inspire.</p>
              <div className="mt-5 flex space-x-4">
                {['facebook', 'twitter', 'instagram', 'linkedin'].map(social => (
                  <a 
                    key={social} 
                    href={`#${social}`} 
                    className="text-blue-300 hover:text-white transition-colors duration-300"
                    aria-label={social}
                  >
                    <div className="w-8 h-8 border border-blue-400 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors duration-300">
                      <span className="capitalize text-xs">{social.charAt(0).toUpperCase()}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8 md:gap-16">
              <div>
                <h3 className="font-semibold mb-4 text-lg text-blue-100">Quick Links</h3>
                <ul className="space-y-3">
                  {['Home', 'About', 'Features', 'Notices', 'Events'].map((item) => ( // Added 'Features' to footer links
                    <li key={item}>
                      <button 
                        onClick={() => scrollToSection(item.toLowerCase())}
                        className="text-blue-300 hover:text-white hover:underline text-sm transition-colors duration-200 focus:outline-none focus:text-white"
                      >
                        {item}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4 text-lg text-blue-100">Account</h3>
                <ul className="space-y-3">
                  <li>
                    <button 
                      onClick={handleLoginClick} 
                      className="text-blue-300 hover:text-white hover:underline text-sm transition-colors duration-200 focus:outline-none focus:text-white"
                    >
                      Login
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={handleRegisterationClick} 
                      className="text-blue-300 hover:text-white hover:underline text-sm transition-colors duration-200 focus:outline-none focus:text-white"
                    >
                      Register
                    </button>
                  </li>
                  <li>
                    <button 
                      className="text-blue-300 hover:text-white hover:underline text-sm transition-colors duration-200 focus:outline-none focus:text-white"
                    >
                      Help Center
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-blue-700/50 mt-8 pt-6 text-center text-sm text-blue-300 flex flex-col md:flex-row md:justify-between">
            <p>© {new Date().getFullYear()} ClassEDGEE. All rights reserved.</p>
            <div className="mt-2 md:mt-0 flex justify-center md:justify-end space-x-6">
              <a href="#" className="text-blue-300 hover:text-white transition-colors">Terms</a>
              <a href="#" className="text-blue-300 hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-blue-300 hover:text-white transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;