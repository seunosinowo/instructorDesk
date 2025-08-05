import React from 'react';
import { motion } from 'framer-motion';
import QuickMessage from '../Messages/QuickMessage';

const RightSidebar: React.FC = () => {

  return (
    <div className="space-y-6">
      {/* Add to your feed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-4"
      >
        <h4 className="font-semibold text-gray-800 mb-4">Add to your feed</h4>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 hover:bg-gray-50 p-3 rounded-lg cursor-pointer">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold">JC</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-800">Jonathan Coates</p>
              <p className="text-sm text-gray-600">Director @ JAYCO RECRUITMENT</p>
            </div>
            <button className="px-3 py-1 border border-gray-300 rounded-full text-sm font-medium hover:bg-gray-50">
              + Follow
            </button>
          </div>
          
          <div className="flex items-center space-x-3 hover:bg-gray-50 p-3 rounded-lg cursor-pointer">
            <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
              <span className="text-white text-lg">✦</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-800">Valley</p>
              <p className="text-sm text-gray-600">Company • Software Development</p>
            </div>
            <button className="px-3 py-1 border border-gray-300 rounded-full text-sm font-medium hover:bg-gray-50">
              + Follow
            </button>
          </div>
          
          <div className="flex items-center space-x-3 hover:bg-gray-50 p-3 rounded-lg cursor-pointer">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-semibold">LE</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-800">Laurels Ozy Echichinwo</p>
              <p className="text-sm text-gray-600">Technical Recruiter | Software Developer</p>
            </div>
            <button className="px-3 py-1 border border-gray-300 rounded-full text-sm font-medium hover:bg-gray-50">
              + Follow
            </button>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <button className="text-gray-600 text-sm hover:text-orange-600">
            View all recommendations →
          </button>
        </div>
      </motion.div>

      {/* Send Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <QuickMessage />
      </motion.div>

      {/* Footer Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-lg p-4"
      >
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
          <a href="#" className="hover:text-orange-600">About</a>
          <a href="#" className="hover:text-orange-600">Accessibility</a>
          <a href="#" className="hover:text-orange-600">Help Center</a>
          <a href="#" className="hover:text-orange-600">Privacy Policy</a>
          <a href="#" className="hover:text-orange-600">Advertising</a>
          <a href="#" className="hover:text-orange-600">Get the App</a>
          <a href="#" className="hover:text-orange-600">More</a>
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            <strong>InstructorDesk</strong> Corporation © 2025
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default RightSidebar;
