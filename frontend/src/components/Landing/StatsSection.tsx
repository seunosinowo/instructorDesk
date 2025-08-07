import React from 'react';
import { motion } from 'framer-motion';

const StatsSection: React.FC = () => {
  const stats = [
    { value: '24/7', label: 'Platform Available' },
    { value: '100%', label: 'Education Focused' },
    { value: 'Unlimited', label: 'Learning Opportunities' },
    { value: 'Free', label: 'To Get Started' },
  ];

  return (
    <motion.section 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="py-16 bg-white"
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center p-3 md:p-6 bg-gradient-to-br from-white to-amber-50 rounded-2xl border border-amber-200 shadow-sm"
            >
              <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-amber-600 mb-1 md:mb-2">{stat.value}</div>
              <div className="text-xs md:text-sm lg:text-base text-gray-600 leading-tight">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default StatsSection;
