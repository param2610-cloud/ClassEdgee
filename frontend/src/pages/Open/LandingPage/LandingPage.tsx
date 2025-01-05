import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Home from './Home';
import About from './About';

const LandingPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('home');
  const navigate = useNavigate();

  // Update active section based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('section');
      let currentSection = 'home';

      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (window.scrollY >= sectionTop - 60) {
          const sectionId = section.getAttribute('id');
          if (sectionId) {
            currentSection = sectionId;
          }
        }
      });

      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLoginClick = () => {
    navigate('/auth/signin');
  };
   

  const handleRegisterationClick = () => {
    navigate('/auth/signup');
  };





  return (
    <div>
      <nav className="fixed top-0 w-full bg-gray-800 flex justify-around p-4 z-50">
        <a
          href="#home"
          className={`text-white text-lg ${activeSection === 'home' ? 'font-bold text-yellow-400 border-b-2 border-yellow-400' : ''}`}
        >
          Home
        </a>
        <a
          href="#about"
          className={`text-white text-lg ${activeSection === 'about' ? 'font-bold text-yellow-400 border-b-2 border-yellow-400' : ''}`}
        >
          About
        </a>
        <a
          href="#notices"
          className={`text-white text-lg ${activeSection === 'notices' ? 'font-bold text-yellow-400 border-b-2 border-yellow-400' : ''}`}
        >
          Notices
        </a>
        <a
          href="#events"
          className={`text-white text-lg ${activeSection === 'events' ? 'font-bold text-yellow-400 border-b-2 border-yellow-400' : ''}`}
        >
          Events
        </a>

        <button
          onClick={handleLoginClick}
          className="text-white bg-yellow-500 hover:bg-yellow-400 px-4 py-2 rounded"
        >
          Login
        </button>
        
        <button
          onClick={handleRegisterationClick}
          className="text-white bg-yellow-500 hover:bg-yellow-400 px-4 py-2 rounded"
        >
         Registration
       </button>
        



      </nav>

      <section id="home" className="bg-dark-201 pt-20 min-h-screen">
        <h2 className="text-2xl font-bold"></h2>
        <Home />
      </section>

      <section id="about" className="bg-gray-300  min-h-screen">
        <About />
      </section>

      <section id="notices" className="bg-gray-400 p-20 pt-32 min-h-screen">
        <h2 className="text-2xl font-bold">Notices</h2>
        <p>
          Check out the latest notices here. Lorem ipsum dolor, sit amet
          consectetur adipisicing elit. Ea repudiandae porro aut obcaecati
          repellendus tempora rerum est laborum asperiores.
        </p>
      </section>

      <section id="events" className="bg-gray-500 p-20 pt-32 min-h-screen">
        <h2 className="text-2xl font-bold">Events</h2>
        <p>
          Here are our upcoming events. Lorem ipsum dolor sit amet consectetur
          adipisicing elit. A repellat cumque tempora voluptas exercitationem
          eveniet inventore.
        </p>
      </section>
    </div>
  );
};

export default LandingPage;
