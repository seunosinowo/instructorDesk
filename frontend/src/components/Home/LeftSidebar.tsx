import React from 'react';
import { motion } from 'framer-motion';
import ProfileAvatar from '../Common/ProfileAvatar';
import { 
  BookOpen, MessageCircle, Users, GraduationCap, Shield
} from 'lucide-react';

interface LeftSidebarProps {
  userProfile?: any;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ userProfile }) => {
  return (
    <div className="space-y-6">
      {/* Profile Preview Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg overflow-hidden"
      >
        {/* Cover Photo */}
        <div className="h-16 bg-gradient-to-r from-orange-400 to-orange-600"></div>
        
        {/* Profile Info */}
        <div className="p-4 -mt-8">
          <div className="flex flex-col items-center">
            <div className="border-4 border-white rounded-full">
              <ProfileAvatar 
                name={userProfile?.name || 'User'}
                profilePicture={userProfile?.profilePicture}
                size="xl"
              />
            </div>
            <h3 className="mt-2 font-semibold text-gray-800 text-center">
              {userProfile?.name || 'User Name'}
            </h3>
            <div className="mt-1 flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                userProfile?.role === 'teacher' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {userProfile?.role === 'teacher' ? 'Teacher' : 'Student'}
              </span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-600">
                {userProfile?.profile?.location || 'Set Location'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Platform Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-lg p-4"
      >
        <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
          <BookOpen className="text-orange-500 mr-2" size={18} />
          Platform Features
        </h4>
        <div className="space-y-3">
          <div className="flex items-center p-2 bg-gray-50 rounded-lg">
            <div className="bg-blue-100 p-2 rounded-lg mr-3">
              <MessageCircle className="text-blue-600" size={16} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Direct Messaging</p>
              <p className="text-xs text-gray-500">Connect instantly with educators</p>
            </div>
          </div>
          
          <div className="flex items-center p-2 bg-gray-50 rounded-lg">
            <div className="bg-green-100 p-2 rounded-lg mr-3">
              <Users className="text-green-600" size={16} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Professional Network</p>
              <p className="text-xs text-gray-500">Build your educational community</p>
            </div>
          </div>
          
          <div className="flex items-center p-2 bg-gray-50 rounded-lg">
            <div className="bg-purple-100 p-2 rounded-lg mr-3">
              <GraduationCap className="text-purple-600" size={16} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Knowledge Sharing</p>
              <p className="text-xs text-gray-500">Share expertise and resources</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Platform Trust & Safety */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100"
      >
        <div className="flex items-start space-x-3">
          <div className="bg-blue-500 p-2 rounded-lg">
            <Shield className="text-white" size={18} />
          </div>
          <div>
            <h4 className="font-semibold text-gray-800">Safe Learning Environment</h4>
            <p className="text-sm text-gray-600 mt-1">
              Verified educators • Secure messaging • Professional community
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LeftSidebar;