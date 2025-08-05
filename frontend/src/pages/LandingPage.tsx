import React from 'react';
import HeroSection from '../components/Landing/HeroSection';
import AboutSection from '../components/Landing/AboutSection';

const LandingPage: React.FC = () => {
  return (
    <div>
      <HeroSection />
      <AboutSection />
    </div>
  );
};

export default LandingPage;