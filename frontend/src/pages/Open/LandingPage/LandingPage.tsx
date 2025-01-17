import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight, Bell, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Home from './Home';
import About from './About';
import NoticesSection from './Notices';
import Events from './Events';

const LandingPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'notices', 'events'];
      const scrollPosition = window.scrollY + 100;

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

  return (
    <div className="relative">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <span className="text-blue-700 text-xl font-bold">ClassEDGE</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="flex space-x-8">
                {['home', 'about', 'notices', 'events'].map((item) => (
                  <a
                    key={item}
                    href={`#${item}`}
                    className={`${
                      activeSection === item
                        ? 'text-blue-700 border-b-2 border-blue-400'
                        : 'text-gray-700 hover:text-green-700 hover:border-b-2 hover:border-green-400'
                    } px-3 py-2 text-lg font-medium capitalize`}
                  >
                    {item}
                  </a>
                ))}
              </div>
            </div>

            {/* Auth Buttons - Desktop */}
            <div className="hidden md:flex items-center space-x-4">
              <button className="text-white bg-blue-500 hover:bg-blue-400 px-4 py-2 rounded text-sm" onClick={handleLoginClick}>
                Login
              </button>
              <button className="text-white bg-blue-500 hover:bg-blue-400 px-4 py-2 rounded text-sm" onClick={handleRegisterationClick}>
                Register
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-blue-600 hover:text-blue-700 focus:outline-none"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden bg-blue-800 pb-4">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {['home', 'about', 'notices', 'events'].map((item) => (
                <a
                  key={item}
                  href={`#${item}`}
                  className={`${
                    activeSection === item
                      ? 'text-blue-400 bg-blue-950'
                      : 'text-white hover:text-white hover:bg-blue-700'
                  } block px-3 py-2 rounded-md text-lg font-medium capitalize`}
                  onClick={() => setIsOpen(false)}
                >
                  {item}
                </a>
              ))}
              <button className="w-full text-white text-lg bg-blue-500 hover:bg-blue-400 px-4 py-2 rounded mt-4" onClick={handleLoginClick}>
                Login
              </button>
              <button className="w-full text-white text-lg bg-blue-500 hover:bg-blue-400 px-4 py-2 rounded mt-2" onClick={handleRegisterationClick}>
                Register
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="min-h-screen bg-white pt-20">
        <Home/>
      </section>

      {/* About Section */}
      <section id="about" >
        <About/>
      </section>

      {/* Notices Section */}
      <section id="notices" className="min-h-screen">
        <NoticesSection/>
      </section>

      {/* Events Section */}
      <Events/>
    </div>
  );
};

export default LandingPage;