import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, MessageCircle } from 'lucide-react';

const HeroSection: React.FC = () => {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="relative bg-gradient-to-br from-amber-100 to-orange-50 min-h-screen flex items-center overflow-hidden max-w-full"
    >
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-amber-200/20"></div>
      <div className="absolute bottom-20 right-20 w-48 h-48 rounded-full bg-orange-200/20"></div>
      <div className="absolute top-1/3 right-1/4 w-16 h-16 rounded-full bg-amber-300/30"></div>
      
      <div className="container mx-auto px-6 lg:px-8 py-20 z-10 max-w-7xl">
        <div className="flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-12 w-full">
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="lg:w-1/2 w-full text-center lg:text-left flex flex-col items-center lg:items-start"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight text-center lg:text-left max-w-full">
              Connect. Learn. Grow with <span className="text-amber-500">Teacherrs</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl text-center lg:text-left mx-auto lg:mx-0">
              The professional network dedicated entirely to education. Find teachers, connect with students, and build your academic community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link 
                to="/register" 
                className="bg-amber-500 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-amber-600 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                Get Started <ArrowRight size={20} />
              </Link>
              <Link 
                to="/register" 
                className="bg-transparent border-2 border-amber-500 text-amber-600 px-8 py-4 rounded-xl text-lg font-medium hover:bg-amber-500/10 transition-all duration-300 flex items-center justify-center gap-2"
              >
                Learn More
              </Link>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="lg:w-1/2 w-full flex justify-center items-center"
          >
            <div className="relative">
              <div className="bg-white rounded-2xl p-6 border border-amber-200 shadow-xl w-full max-w-md">
                <div className="flex gap-4 mb-6">
                  <div className="bg-amber-50 rounded-xl p-4 flex-1">
                    <div className="bg-amber-100 border-2 border-amber-200 rounded-xl w-16 h-16 mb-3 mx-auto flex items-center justify-center">
                      <span className="text-amber-600 font-bold">A+</span>
                    </div>
                    <div className="h-3 bg-amber-500 rounded-full mb-2 w-3/4 mx-auto"></div>
                    <div className="h-2 bg-amber-200 rounded-full w-1/2 mx-auto"></div>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-4 flex-1">
                    <div className="bg-amber-100 border-2 border-amber-200 rounded-xl w-16 h-16 mb-3 mx-auto flex items-center justify-center">
                      <span className="text-amber-600 font-bold">B</span>
                    </div>
                    <div className="h-3 bg-orange-500 rounded-full mb-2 w-3/4 mx-auto"></div>
                    <div className="h-2 bg-amber-200 rounded-full w-1/2 mx-auto"></div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-4 mb-6 border border-amber-100 shadow-sm">
                  <div className="flex gap-3 mb-4">
                    <div className="bg-amber-100 border-2 border-amber-200 rounded-full w-12 h-12 flex items-center justify-center">
                      <span className="text-amber-600 font-bold">J</span>
                    </div>
                    <div>
                      <div className="h-3 bg-amber-500 rounded-full mb-2 w-32"></div>
                      <div className="h-2 bg-amber-200 rounded-full w-24"></div>
                    </div>
                  </div>
                  <div className="h-3 bg-amber-100 rounded-full mb-2"></div>
                  <div className="h-3 bg-amber-100 rounded-full w-5/6 mb-4"></div>
                  <div className="flex gap-2">
                    <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center border border-amber-200">
                      <Heart size={16} className="text-amber-600" />
                    </div>
                    <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center border border-amber-200">
                      <MessageCircle size={16} className="text-amber-600" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-xl p-4 text-center shadow-md">
                  <p className="font-bold">Join our community of educators today!</p>
                </div>
              </div>
              
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-amber-200/40 rounded-2xl -z-10"></div>
              <div className="absolute -top-6 -right-6 w-16 h-16 bg-orange-200/30 rounded-2xl -z-10"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default HeroSection;