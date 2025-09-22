import React from 'react';
import { motion } from 'framer-motion';
import QuickMessage from '../Messages/QuickMessage';
import { 
  BookOpen, GraduationCap, Users, 
  MessageCircle, Globe, 
  Bookmark 
} from 'lucide-react';

const RightSidebar: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Educational Opportunities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-5"
      >
        <div className="flex items-center mb-4">
          <h4 className="font-bold text-gray-800 text-lg flex items-center">
            <BookOpen className="text-orange-500 mr-2" size={20} />
            Learning Opportunities
          </h4>
        </div>
        
        <div className="space-y-4">
          <div className="p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100">
            <div className="flex items-center">
              <div className="bg-orange-100 p-2 rounded-lg mr-3">
                <GraduationCap className="text-orange-600" size={18} />
              </div>
              <div>
                <p className="font-medium text-gray-700">Mathematics Tutoring</p>
                <p className="text-xs text-gray-500">Connect with math experts</p>
              </div>
            </div>
          </div>
          
          <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                <Globe className="text-blue-600" size={18} />
              </div>
              <div>
                <p className="font-medium text-gray-700">Language Exchange</p>
                <p className="text-xs text-gray-500">Practice with native speakers</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="w-full mt-4 py-2.5 text-center text-gray-500 font-medium rounded-lg border border-gray-200 bg-gray-50">
          Find Your Perfect Teacher
        </div>
      </motion.div>

      {/* Educational Communities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-lg p-5"
      >
        <h4 className="font-bold text-gray-800 text-lg flex items-center mb-4">
          <Users className="text-orange-500 mr-2" size={20} />
          Educational Communities
        </h4>
        
        <div className="space-y-3">
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center mr-3">
              <Bookmark className="text-white" size={16} />
            </div>
            <div>
              <p className="font-medium text-gray-700">Science Discussions</p>
              <p className="text-xs text-gray-500">Connect with science educators</p>
            </div>
          </div>
          
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-teal-400 flex items-center justify-center mr-3">
              <Bookmark className="text-white" size={16} />
            </div>
            <div>
              <p className="font-medium text-gray-700">Technology Hub</p>
              <p className="text-xs text-gray-500">Share tech knowledge & tips</p>
            </div>
          </div>
          
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 flex items-center justify-center mr-3">
              <Bookmark className="text-white" size={16} />
            </div>
            <div>
              <p className="font-medium text-gray-700">Language Learning</p>
              <p className="text-xs text-gray-500">Practice with native speakers</p>
            </div>
          </div>
        </div>
        
        <div className="w-full mt-3 py-2.5 text-center text-gray-500 font-medium rounded-lg border border-gray-200 bg-gray-50">
          Connect & Learn Together
        </div>
      </motion.div>

      {/* Quick Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <QuickMessage />
      </motion.div>

      {/* Platform Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-lg p-5"
      >
        <div className="flex items-center mb-3">
          <MessageCircle className="text-orange-500 mr-2" size={20} />
          <h4 className="font-bold text-gray-800">About Teechha</h4>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          Connecting teachers and students worldwide for better learning experiences.
        </p>
        
        <div className="grid grid-cols-2 gap-3 text-xs">
          <a href="#" className="text-orange-600 hover:text-orange-800 flex items-center">
            <span>For Teachers</span>
          </a>
          <a href="#" className="text-orange-600 hover:text-orange-800 flex items-center">
            <span>For Students</span>
          </a>
          <a href="#" className="text-orange-600 hover:text-orange-800 flex items-center">
            <span>Learning Resources</span>
          </a>
          <a href="#" className="text-orange-600 hover:text-orange-800 flex items-center">
            <span>Tutoring</span>
          </a>
          <a href="#" className="text-orange-600 hover:text-orange-800 flex items-center">
            <span>Study Groups</span>
          </a>
          <a href="#" className="text-orange-600 hover:text-orange-800 flex items-center">
            <span>Teaching Tools</span>
          </a>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            © 2025 Teechha • Making education accessible
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default RightSidebar;