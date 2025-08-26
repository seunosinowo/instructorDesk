import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faNairaSign } from '@fortawesome/free-solid-svg-icons';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'teacher' | 'student';
  bio?: string;
  profilePicture?: string;
  createdAt: string;
  profile: any;
}

const UserProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const currentUserId = localStorage.getItem('userId');

  useEffect(() => {
    if (id) {
      fetchUserProfile();
    }
  }, [id]);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/profile/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserProfile(response.data);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const formatJoinDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  const getRoleIcon = (role: string) => {
    return role === 'teacher' ? '👨‍🏫' : '👨‍🎓';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error || !userProfile) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="text-orange-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Profile Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The requested profile could not be found.'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-md"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUserId === userProfile.id;

  return (
    <div className="container mx-auto p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* Enhanced Profile Header */}
        <div className="relative rounded-t-2xl overflow-hidden">
          <div className="h-48 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600"></div>
          
          <div className="absolute top-4 right-4">
            <div className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-orange-600 font-medium text-sm flex items-center">
              <span className="mr-2">{getRoleIcon(userProfile.role)}</span>
              {userProfile.role === 'teacher' ? 'Teacher' : 'Student'}
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-b-2xl shadow-xl p-6 -mt-16 relative">
          <div className="flex flex-col md:flex-row items-start md:items-end space-y-4 md:space-y-0 md:space-x-8">
            {/* Enhanced Profile Picture */}
            <div className="relative">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-gradient-to-br from-orange-100 to-orange-300">
                {userProfile.profilePicture ? (
                  <img 
                    src={userProfile.profilePicture} 
                    alt={userProfile.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-orange-600 font-bold text-5xl">
                    {userProfile.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="absolute bottom-2 right-2 bg-white rounded-full p-1 shadow-md">
                <div className="bg-orange-500 w-6 h-6 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-1">{userProfile.name}</h1>
                  <p className="text-gray-500 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Joined {formatJoinDate(userProfile.createdAt)}
                  </p>
                </div>

                {/* Enhanced Action Buttons */}
                <div className="flex space-x-3 mt-4 md:mt-0">
                  {isOwnProfile ? (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate('/profile/edit')}
                      className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-md flex items-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>Edit Profile</span>
                    </motion.button>
                  ) : (
                    <motion.button 
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate(`/messages?user=${userProfile.id}`)}
                      className="bg-white border-2 border-orange-500 text-orange-600 px-6 py-3 rounded-lg hover:bg-orange-50 transition-all shadow-md flex items-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span>Send Message</span>
                    </motion.button>
                  )}
                </div>
              </div>

              {/* Bio */}
              {userProfile.bio && (
                <div className="mt-6">
                  <p className="text-gray-700 leading-relaxed bg-orange-50 p-4 rounded-xl border-l-4 border-orange-500">
                    {userProfile.bio}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {userProfile.role === 'teacher' && userProfile.profile && (
              <>
                {/* Teaching Information */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100"
                >
                  <div className="flex items-center mb-4">
                    <div className="bg-orange-100 p-2 rounded-lg mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Teaching Expertise</h2>
                  </div>
                  
                  {userProfile.profile.subjects && (
                    <div className="mb-6">
                      <h3 className="font-medium text-orange-600 mb-3 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Subjects
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {userProfile.profile.subjects.map((subject: string, index: number) => (
                          <span key={index} className="bg-gradient-to-b from-orange-50 to-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium shadow-sm">
                            {subject}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {userProfile.profile.specializations && (
                    <div className="mb-6">
                      <h3 className="font-medium text-orange-600 mb-3 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        Specializations
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {userProfile.profile.specializations.map((spec: string, index: number) => (
                          <span key={index} className="bg-gradient-to-b from-amber-50 to-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium shadow-sm">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {userProfile.profile.teachingPhilosophy && (
                    <div className="mb-4">
                      <h3 className="font-medium text-orange-600 mb-3 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                        Teaching Philosophy
                      </h3>
                      <p className="text-gray-600 bg-orange-50 p-4 rounded-lg border-l-4 border-orange-400">
                        {userProfile.profile.teachingPhilosophy}
                      </p>
                    </div>
                  )}
                </motion.div>

                {/* Experience & Qualifications */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100"
                >
                  <div className="flex items-center mb-4">
                    <div className="bg-orange-100 p-2 rounded-lg mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Professional Background</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {userProfile.profile.experience && (
                      <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-xl">
                        <h3 className="font-medium text-gray-700 mb-1 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Experience
                        </h3>
                        <p className="text-2xl font-bold text-orange-600">{userProfile.profile.experience}+ years</p>
                      </div>
                    )}

                    {userProfile.profile.qualifications && (
                      <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-xl">
                        <h3 className="font-medium text-gray-700 mb-1 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M12 14l9-5-9-5-9 5 9 5z" />
                            <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                          </svg>
                          Qualifications
                        </h3>
                        <p className="text-lg font-medium text-orange-600">{userProfile.profile.qualifications}</p>
                      </div>
                    )}

                    {userProfile.profile.hourlyRate && (
                      <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-xl">
                        <h3 className="font-medium text-gray-700 mb-1 flex items-center">
                          <FontAwesomeIcon icon={faNairaSign} className="h-5 w-5 mr-2 text-orange-500" />
                          Hourly Rate
                        </h3>
                        <p className="text-2xl font-bold text-orange-600">#{userProfile.profile.hourlyRate}<span className="text-sm font-normal">/hour</span></p>
                      </div>
                    )}

                    {userProfile.profile.availability && (
                      <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-xl">
                        <h3 className="font-medium text-gray-700 mb-1 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Availability
                        </h3>
                        <p className="text-lg font-medium text-orange-600">{userProfile.profile.availability}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </>
            )}

            {userProfile.role === 'student' && userProfile.profile && (
              <>
                {/* Learning Information */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100"
                >
                  <div className="flex items-center mb-4">
                    <div className="bg-orange-100 p-2 rounded-lg mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Learning Profile</h2>
                  </div>
                  
                  {userProfile.profile.interests && (
                    <div className="mb-6">
                      <h3 className="font-medium text-orange-600 mb-3 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        Interests
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {userProfile.profile.interests.map((interest: string, index: number) => (
                          <span key={index} className="bg-gradient-to-b from-green-50 to-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium shadow-sm">
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {userProfile.profile.skills && (
                    <div className="mb-6">
                      <h3 className="font-medium text-orange-600 mb-3 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                        Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {userProfile.profile.skills.map((skill: string, index: number) => (
                          <span key={index} className="bg-gradient-to-b from-purple-50 to-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium shadow-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {userProfile.profile.careerGoals && (
                    <div className="mb-4">
                      <h3 className="font-medium text-orange-600 mb-3 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        Career Goals
                      </h3>
                      <p className="text-gray-600 bg-orange-50 p-4 rounded-lg border-l-4 border-orange-400">
                        {userProfile.profile.careerGoals}
                      </p>
                    </div>
                  )}
                </motion.div>

                {/* Academic Information */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100"
                >
                  <div className="flex items-center mb-4">
                    <div className="bg-orange-100 p-2 rounded-lg mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Academic Information</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {userProfile.profile.academicLevel && (
                      <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-xl">
                        <h3 className="font-medium text-gray-700 mb-1 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          Academic Level
                        </h3>
                        <p className="text-lg font-medium text-orange-600">{userProfile.profile.academicLevel}</p>
                      </div>
                    )}

                    {userProfile.profile.currentInstitution && (
                      <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-xl">
                        <h3 className="font-medium text-gray-700 mb-1 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M12 14l9-5-9-5-9 5 9 5z" />
                            <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                          </svg>
                          Institution
                        </h3>
                        <p className="text-lg font-medium text-orange-600">{userProfile.profile.currentInstitution}</p>
                      </div>
                    )}

                    {userProfile.profile.graduationYear && (
                      <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-xl">
                        <h3 className="font-medium text-gray-700 mb-1 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Graduation Year
                        </h3>
                        <p className="text-2xl font-bold text-orange-600">{userProfile.profile.graduationYear}</p>
                      </div>
                    )}

                    {userProfile.profile.learningStyle && (
                      <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-xl">
                        <h3 className="font-medium text-gray-700 mb-1 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Learning Style
                        </h3>
                        <p className="text-lg font-medium text-orange-600">{userProfile.profile.learningStyle}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100"
            >
              <div className="flex items-center mb-4">
                <div className="bg-orange-100 p-2 rounded-lg mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800">Contact Information</h2>
              </div>
              
              {userProfile.profile?.location && (
                <div className="flex items-center space-x-3 mb-4 p-3 bg-orange-50 rounded-lg">
                  <div className="bg-orange-100 p-2 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-orange-600">Location</p>
                    <p className="text-gray-800 font-medium">{userProfile.profile.location}</p>
                  </div>
                </div>
              )}

              {userProfile.profile?.languages && userProfile.profile.languages.length > 0 && (
                <div className="flex items-start space-x-3 mb-4 p-3 bg-orange-50 rounded-lg">
                  <div className="bg-orange-100 p-2 rounded-full mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-orange-600">Languages</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {userProfile.profile.languages.map((lang: string, index: number) => (
                        <span key={index} className="bg-white px-2 py-1 rounded-full text-sm text-gray-700 border border-orange-200">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Social Links */}
            {userProfile.profile?.socialLinks && Object.keys(userProfile.profile.socialLinks).length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100"
              >
                <div className="flex items-center mb-4">
                  <div className="bg-orange-100 p-2 rounded-lg mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Connect</h2>
                </div>
                <div className="space-y-3">
                  {Object.entries(userProfile.profile.socialLinks).map(([platform, url]: [string, any]) => (
                    url && (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                      >
                        <div className="flex items-center">
                          <div className="bg-white p-2 rounded-lg mr-3 shadow-sm">
                            <span className="text-orange-600 font-medium capitalize">{platform.charAt(0)}</span>
                          </div>
                          <span className="text-gray-700 font-medium capitalize">{platform}</span>
                        </div>
                        <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )
                  ))}
                </div>
              </motion.div>
            )}

            {/* Platform Mission */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg"
            >
              <div className="flex items-start space-x-4">
                <div className="bg-white/20 p-3 rounded-full">
                  <span className="text-2xl">🎯</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Our Mission</h3>
                  <p className="text-orange-100">
                    Connecting passionate educators with eager learners worldwide
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default UserProfilePage;