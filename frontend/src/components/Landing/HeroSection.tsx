import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const HeroSection: React.FC = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="bg-[url('/src/assets/hero-bg.jpg')] bg-cover bg-center min-h-[80vh] flex items-center"
    >
      <div className="container mx-auto text-center text-white px-6">
        <motion.h1
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-6xl font-bold mb-4"
        >
          Welcome to EduConnect
        </motion.h1>
        <p className="text-xl md:text-2xl mb-6 max-w-2xl mx-auto">
          Connect with teachers, learn from experts, and grow your skills in a vibrant community.
        </p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <Link to="/register" className="bg-white text-orange-primary px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-100 transition duration-300">
            Get Started
          </Link>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default HeroSection;