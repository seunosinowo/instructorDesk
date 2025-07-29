import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface ProfileCompletionWelcomeProps {
  userRole: string;
  userName: string;
}

const ProfileCompletionWelcome: React.FC<ProfileCompletionWelcomeProps> = ({ userRole, userName }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl"
      >
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Complete!</h2>
          <p className="text-gray-600">
            Welcome to the platform, {userName}! Your {userRole} profile has been successfully created.
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="font-semibold text-orange-800 mb-2">What's Next?</h3>
            <ul className="text-sm text-orange-700 space-y-1">
              {userRole === 'teacher' ? (
                <>
                  <li>• Connect with students looking for your expertise</li>
                  <li>• Share educational content and resources</li>
                  <li>• Build your teaching reputation</li>
                </>
              ) : (
                <>
                  <li>• Find teachers that match your learning goals</li>
                  <li>• Join discussions and ask questions</li>
                  <li>• Track your learning progress</li>
                </>
              )}
            </ul>
          </div>

          <div className="flex space-x-3">
            <Link
              to="/profile"
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition duration-300 font-medium"
            >
              View Profile
            </Link>
            <Link
              to="/home"
              className="flex-1 bg-orange-primary text-white py-2 px-4 rounded-lg hover:bg-orange-secondary transition duration-300 font-medium"
            >
              Get Started
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProfileCompletionWelcome;