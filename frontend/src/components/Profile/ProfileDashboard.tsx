import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import type { User, TeacherProfile, StudentProfile } from '../../types';

interface ProfileDashboardProps {
  profile: User & { profile?: TeacherProfile | StudentProfile };
}

const ProfileDashboard: React.FC<ProfileDashboardProps> = ({ profile }) => {
  const [stats, setStats] = useState({
    connections: 0,
    posts: 0,
    reviews: 0,
    messages: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/profile/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch profile stats:', error);
      }
    };

    fetchStats();
  }, []);

  const getProfileCompletionPercentage = () => {
    if (!profile.profile) return 0;
    
    if (profile.role === 'teacher') {
      const teacherProfile = profile.profile as TeacherProfile;
      const fields = [
        teacherProfile.subjects?.length > 0,
        teacherProfile.qualifications,
        teacherProfile.experience > 0,
        teacherProfile.education,
        teacherProfile.teachingPhilosophy,
        teacherProfile.hourlyRate > 0,
        teacherProfile.location,
        teacherProfile.languages?.length > 0
      ];
      const completedFields = fields.filter(Boolean).length;
      return Math.round((completedFields / fields.length) * 100);
    } else {
      const studentProfile = profile.profile as StudentProfile;
      const fields = [
        studentProfile.interests?.length > 0,
        studentProfile.academicLevel,
        studentProfile.goals?.length > 0,
        studentProfile.currentInstitution,
        studentProfile.careerGoals,
        studentProfile.skills?.length > 0,
        studentProfile.location,
        studentProfile.languages?.length > 0
      ];
      const completedFields = fields.filter(Boolean).length;
      return Math.round((completedFields / fields.length) * 100);
    }
  };

  const completionPercentage = getProfileCompletionPercentage();

  return (
    <div className="space-y-6">
      {/* Profile Completion Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-orange-primary to-orange-secondary rounded-xl p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-2">Profile Completion</h3>
            <p className="text-orange-100">
              {completionPercentage < 100 
                ? `Complete your profile to get better matches` 
                : `Your profile is complete!`
              }
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{completionPercentage}%</div>
            <div className="w-20 h-2 bg-orange-300 rounded-full mt-2">
              <div 
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
        {completionPercentage < 100 && (
          <Link
            to="/profile/edit"
            className="inline-block mt-4 bg-white text-orange-primary px-4 py-2 rounded-lg font-medium hover:bg-orange-50 transition duration-300"
          >
            Complete Profile
          </Link>
        )}
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-xl p-4 shadow-lg text-center"
        >
          <div className="text-2xl font-bold text-blue-600">{stats.connections}</div>
          <div className="text-sm text-gray-600">Connections</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl p-4 shadow-lg text-center"
        >
          <div className="text-2xl font-bold text-green-600">{stats.posts}</div>
          <div className="text-sm text-gray-600">Posts</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-xl p-4 shadow-lg text-center"
        >
          <div className="text-2xl font-bold text-purple-600">{stats.reviews}</div>
          <div className="text-sm text-gray-600">Reviews</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-xl p-4 shadow-lg text-center"
        >
          <div className="text-2xl font-bold text-orange-600">{stats.messages}</div>
          <div className="text-sm text-gray-600">Messages</div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/profile/edit"
            className="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition duration-300"
          >
            <svg className="w-6 h-6 text-orange-primary mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <div>
              <div className="font-medium text-gray-800">Edit Profile</div>
              <div className="text-sm text-gray-600">Update your information</div>
            </div>
          </Link>

          <Link
            to="/home"
            className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition duration-300"
          >
            <svg className="w-6 h-6 text-blue-primary mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
            </svg>
            <div>
              <div className="font-medium text-gray-800">Dashboard</div>
              <div className="text-sm text-gray-600">View your feed</div>
            </div>
          </Link>

          {profile.role === 'teacher' ? (
            <Link
              to="/students"
              className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition duration-300"
            >
              <svg className="w-6 h-6 text-green-primary mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <div>
                <div className="font-medium text-gray-800">Find Students</div>
                <div className="text-sm text-gray-600">Connect with learners</div>
              </div>
            </Link>
          ) : (
            <Link
              to="/teachers"
              className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition duration-300"
            >
              <svg className="w-6 h-6 text-green-primary mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z" />
              </svg>
              <div>
                <div className="font-medium text-gray-800">Find Teachers</div>
                <div className="text-sm text-gray-600">Discover educators</div>
              </div>
            </Link>
          )}
        </div>
      </motion.div>

      {/* Role-specific recommendations */}
      {profile.role === 'teacher' ? (
        <TeacherRecommendations profile={profile.profile as TeacherProfile} />
      ) : (
        <StudentRecommendations profile={profile.profile as StudentProfile} />
      )}
    </div>
  );
};

// Teacher-specific recommendations
const TeacherRecommendations: React.FC<{ profile: TeacherProfile }> = ({ profile }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="bg-white rounded-xl shadow-lg p-6"
    >
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Recommendations for You</h3>
      <div className="space-y-4">
        {!profile.teachingPhilosophy && (
          <div className="flex items-start p-4 bg-yellow-50 rounded-lg">
            <svg className="w-5 h-5 text-yellow-500 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <div className="font-medium text-gray-800">Add Your Teaching Philosophy</div>
              <div className="text-sm text-gray-600">Help students understand your teaching approach</div>
            </div>
          </div>
        )}
        
        {(!profile.certifications || profile.certifications.length === 0) && (
          <div className="flex items-start p-4 bg-blue-50 rounded-lg">
            <svg className="w-5 h-5 text-blue-500 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <div className="font-medium text-gray-800">Add Certifications</div>
              <div className="text-sm text-gray-600">Showcase your professional credentials</div>
            </div>
          </div>
        )}

        {!profile.hourlyRate && (
          <div className="flex items-start p-4 bg-green-50 rounded-lg">
            <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
            </svg>
            <div>
              <div className="font-medium text-gray-800">Set Your Hourly Rate</div>
              <div className="text-sm text-gray-600">Let students know your pricing</div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Student-specific recommendations
const StudentRecommendations: React.FC<{ profile: StudentProfile }> = ({ profile }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="bg-white rounded-xl shadow-lg p-6"
    >
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Recommendations for You</h3>
      <div className="space-y-4">
        {(!profile.goals || profile.goals.length === 0) && (
          <div className="flex items-start p-4 bg-yellow-50 rounded-lg">
            <svg className="w-5 h-5 text-yellow-500 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
            </svg>
            <div>
              <div className="font-medium text-gray-800">Set Learning Goals</div>
              <div className="text-sm text-gray-600">Define what you want to achieve</div>
            </div>
          </div>
        )}
        
        {(!profile.skills || profile.skills.length === 0) && (
          <div className="flex items-start p-4 bg-blue-50 rounded-lg">
            <svg className="w-5 h-5 text-blue-500 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <div className="font-medium text-gray-800">Add Your Skills</div>
              <div className="text-sm text-gray-600">Showcase what you already know</div>
            </div>
          </div>
        )}

        {!profile.careerGoals && (
          <div className="flex items-start p-4 bg-green-50 rounded-lg">
            <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <div className="font-medium text-gray-800">Define Career Goals</div>
              <div className="text-sm text-gray-600">Help teachers understand your aspirations</div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProfileDashboard;