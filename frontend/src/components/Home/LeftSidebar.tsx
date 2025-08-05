import React from 'react';
import { motion } from 'framer-motion';
import ProfileAvatar from '../Common/ProfileAvatar';

interface LeftSidebarProps {
  userProfile?: any;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ userProfile }) => {
  return (
    <div className="space-y-6">
      {/* Profile Summary Card */}
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
                name={`${userProfile?.firstName || ''} ${userProfile?.lastName || ''}`}
                profilePicture={userProfile?.profilePicture}
                size="xl"
              />
            </div>
            <h3 className="mt-2 font-semibold text-gray-800 text-center">
              {userProfile?.firstName} {userProfile?.lastName}
            </h3>
            <p className="text-sm text-gray-600 text-center">
              {userProfile?.role === 'teacher' ? 'Educator' : 'Student'} • {userProfile?.profile?.location || 'Nigeria'}
            </p>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Profile completion</span>
              <span className="text-orange-600 font-semibold">85%</span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-gray-600">Connections made</span>
              <span className="text-orange-600 font-semibold">12</span>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center text-sm text-gray-600">
              <span className="text-orange-500 mr-2">🎓</span>
              <span>Complete your profile</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-lg p-4"
      >
        <h4 className="font-semibold text-gray-800 mb-3">Recent</h4>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 hover:bg-gray-50 p-2 rounded-lg cursor-pointer">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Mathematics Teachers</span>
          </div>
          <div className="flex items-center space-x-3 hover:bg-gray-50 p-2 rounded-lg cursor-pointer">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Science Students</span>
          </div>
          <div className="flex items-center space-x-3 hover:bg-gray-50 p-2 rounded-lg cursor-pointer">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Language Learning</span>
          </div>
          <div className="flex items-center space-x-3 hover:bg-gray-50 p-2 rounded-lg cursor-pointer">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Computer Science</span>
          </div>
        </div>
        
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-2 text-sm text-gray-600 hover:text-orange-600 cursor-pointer">
            <span>💬</span>
            <span>My Messages</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600 hover:text-orange-600 cursor-pointer mt-2">
            <span>🎯</span>
            <span>Learning Goals</span>
          </div>
        </div>
      </motion.div>

      {/* Today's Learning */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-lg p-4"
      >
        <h4 className="font-semibold text-gray-800 mb-3">Today's Learning</h4>
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="font-medium text-gray-800">Study Session</h5>
              <p className="text-sm text-gray-600">Connect with tutors!</p>
              <p className="text-xs text-gray-500 mt-1">3 sessions completed</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">📚</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Trending Topics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-lg p-4"
      >
        <h4 className="font-semibold text-gray-800 mb-3">Trending in Education</h4>
        <div className="space-y-3">
          <div className="hover:bg-gray-50 p-2 rounded-lg cursor-pointer">
            <p className="text-sm font-medium text-gray-800">#OnlineTutoring</p>
            <p className="text-xs text-gray-500">156 teachers active</p>
          </div>
          <div className="hover:bg-gray-50 p-2 rounded-lg cursor-pointer">
            <p className="text-sm font-medium text-gray-800">#MathHelp</p>
            <p className="text-xs text-gray-500">89 students seeking</p>
          </div>
          <div className="hover:bg-gray-50 p-2 rounded-lg cursor-pointer">
            <p className="text-sm font-medium text-gray-800">#StudyGroups</p>
            <p className="text-xs text-gray-500">42 groups formed</p>
          </div>
          <div className="hover:bg-gray-50 p-2 rounded-lg cursor-pointer">
            <p className="text-sm font-medium text-gray-800">#ExamPrep</p>
            <p className="text-xs text-gray-500">73 sessions today</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LeftSidebar;
