import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="text-center mt-20"
    >
      <h1 className="text-6xl font-bold text-orange-primary mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-6">Oops! The page you’re looking for doesn’t exist.</p>
      <Link to="/" className="bg-orange-primary text-white px-6 py-3 rounded-full hover:bg-orange-secondary transition duration-300 font-medium">
        Back to Home
      </Link>
    </motion.div>
  );
};

export default NotFoundPage;