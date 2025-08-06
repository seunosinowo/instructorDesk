import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface ForSectionProps {
  title: string;
  icon: React.ReactNode;
  features: { icon: React.ReactNode; text: string }[];
  reverse?: boolean;
}

const ForSection: React.FC<ForSectionProps> = ({ title, icon, features, reverse = false }) => {
  return (
    <motion.section 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className={`py-20 ${reverse ? 'bg-gradient-to-br from-white to-amber-50' : 'bg-white'}`}
    >
      <div className="container mx-auto px-4">
        <div className={`flex flex-col ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-12 items-center`}>
          <motion.div 
            initial={{ x: reverse ? 50 : -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="lg:w-1/2"
          >
            <div className="flex items-center gap-3 mb-6">
              {icon}
              <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
            </div>
            
            <ul className="space-y-4">
              {features.map((feature, index) => (
                <motion.li 
                  key={index}
                  initial={{ x: reverse ? 30 : -30, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-1">
                    {feature.icon}
                  </div>
                  <span className="text-lg text-gray-700">{feature.text}</span>
                </motion.li>
              ))}
            </ul>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              viewport={{ once: true }}
              className="mt-8"
            >
              <Link 
                to="/register" 
                className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300"
              >
                Get Started <ArrowRight size={18} />
              </Link>
            </motion.div>
          </motion.div>
          
          <motion.div 
            initial={{ x: reverse ? -50 : 50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="lg:w-1/2"
          >
            <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-1 shadow-xl">
              <div className="bg-white rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-12 h-12" />
                  <div>
                    <div className="h-4 bg-orange-500 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-24"></div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="h-4 bg-amber-100 rounded w-full"></div>
                  <div className="h-4 bg-amber-100 rounded w-5/6"></div>
                  <div className="h-4 bg-amber-100 rounded w-4/5"></div>
                  <div className="h-4 bg-amber-100 rounded w-3/4"></div>
                </div>
                
                <div className="mt-8 grid grid-cols-3 gap-4">
                  <div className="bg-amber-50 rounded-lg p-4">
                    <div className="h-4 bg-amber-200 rounded w-full mb-3"></div>
                    <div className="h-3 bg-amber-200 rounded w-3/4"></div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="h-4 bg-orange-200 rounded w-full mb-3"></div>
                    <div className="h-3 bg-orange-200 rounded w-3/4"></div>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-4">
                    <div className="h-4 bg-amber-200 rounded w-full mb-3"></div>
                    <div className="h-3 bg-amber-200 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default ForSection;
