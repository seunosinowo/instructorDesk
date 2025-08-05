import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const AboutSection: React.FC = () => {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="py-16 bg-white"
    >
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold text-orange-primary mb-6">About Us</h2>
        <p className="text-lg text-gray-dark max-w-3xl mx-auto mb-8">
          EduConnect is a platform designed to bridge the gap between students and teachers. Our mission is to provide a space where knowledge is shared, skills are honed, and communities are built. Join us today to explore a world of learning opportunities!
        </p>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="inline-block"
        >
          <Link to="/register" className="bg-orange-primary text-white px-6 py-3 rounded-full text-lg font-medium hover:bg-orange-secondary transition duration-300">
            Join the Community
          </Link>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default AboutSection;