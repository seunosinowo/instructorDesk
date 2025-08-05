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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-primary"></div>
      </div>
    );
  }

  if (error || !userProfile) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Profile Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The requested profile could not be found.'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-orange-primary text-white px-6 py-2 rounded-lg hover:bg-orange-secondary transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUserId === userProfile.id;

  return (
    <div className="container mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-orange-primary to-orange-secondary rounded-t-xl h-32"></div>
        <div className="bg-white rounded-b-xl shadow-lg p-6 -mt-16 relative">
          <div className="flex flex-col md:flex-row items-start md:items-end space-y-4 md:space-y-0 md:space-x-6">
            {/* Profile Picture */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-orange-primary">
                {userProfile.profilePicture ? (
                  <img 
                    src={userProfile.profilePicture} 
                    alt={userProfile.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-bold text-4xl">
                    {userProfile.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">{userProfile.name}</h1>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-2xl">{getRoleIcon(userProfile.role)}</span>
                    <span className="text-lg text-gray-600 capitalize font-medium">{userProfile.role}</span>
                  </div>
                  <p className="text-gray-500">Joined {formatJoinDate(userProfile.createdAt)}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 mt-4 md:mt-0">
                  {isOwnProfile ? (
                    <button
                      onClick={() => navigate('/profile/edit')}
                      className="bg-orange-primary text-white px-6 py-2 rounded-lg hover:bg-orange-secondary transition-colors flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>Edit Profile</span>
                    </button>
                  ) : (
                    <>
                      <button className="bg-orange-primary text-white px-6 py-2 rounded-lg hover:bg-orange-secondary transition-colors">
                        Connect
                      </button>
                      <button 
                        onClick={() => navigate(`/messages?user=${userProfile.id}`)}
                        className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span>Message</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Bio */}
              {userProfile.bio && (
                <div className="mt-4">
                  <p className="text-gray-700 leading-relaxed">{userProfile.bio}</p>
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
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Teaching Information</h2>
                  
                  {userProfile.profile.subjects && (
                    <div className="mb-4">
                      <h3 className="font-medium text-gray-700 mb-2">Subjects</h3>
                      <div className="flex flex-wrap gap-2">
                        {userProfile.profile.subjects.map((subject: string, index: number) => (
                          <span key={index} className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                            {subject}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {userProfile.profile.specializations && (
                    <div className="mb-4">
                      <h3 className="font-medium text-gray-700 mb-2">Specializations</h3>
                      <div className="flex flex-wrap gap-2">
                        {userProfile.profile.specializations.map((spec: string, index: number) => (
                          <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {userProfile.profile.teachingPhilosophy && (
                    <div className="mb-4">
                      <h3 className="font-medium text-gray-700 mb-2">Teaching Philosophy</h3>
                      <p className="text-gray-600">{userProfile.profile.teachingPhilosophy}</p>
                    </div>
                  )}
                </div>

                {/* Experience & Qualifications */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Experience & Qualifications</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userProfile.profile.experience && (
                      <div>
                        <h3 className="font-medium text-gray-700 mb-1">Experience</h3>
                        <p className="text-gray-600">{userProfile.profile.experience} years</p>
                      </div>
                    )}

                    {userProfile.profile.qualifications && (
                      <div>
                        <h3 className="font-medium text-gray-700 mb-1">Qualifications</h3>
                        <p className="text-gray-600">{userProfile.profile.qualifications}</p>
                      </div>
                    )}

                    {userProfile.profile.hourlyRate && (
                      <div>
                        <h3 className="font-medium text-gray-700 mb-1">Hourly Rate</h3>
                        <p className="text-gray-600">${userProfile.profile.hourlyRate}/hour</p>
                      </div>
                    )}

                    {userProfile.profile.availability && (
                      <div>
                        <h3 className="font-medium text-gray-700 mb-1">Availability</h3>
                        <p className="text-gray-600">{userProfile.profile.availability}</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {userProfile.role === 'student' && userProfile.profile && (
              <>
                {/* Learning Information */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Learning Profile</h2>
                  
                  {userProfile.profile.interests && (
                    <div className="mb-4">
                      <h3 className="font-medium text-gray-700 mb-2">Interests</h3>
                      <div className="flex flex-wrap gap-2">
                        {userProfile.profile.interests.map((interest: string, index: number) => (
                          <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {userProfile.profile.skills && (
                    <div className="mb-4">
                      <h3 className="font-medium text-gray-700 mb-2">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {userProfile.profile.skills.map((skill: string, index: number) => (
                          <span key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {userProfile.profile.careerGoals && (
                    <div className="mb-4">
                      <h3 className="font-medium text-gray-700 mb-2">Career Goals</h3>
                      <p className="text-gray-600">{userProfile.profile.careerGoals}</p>
                    </div>
                  )}
                </div>

                {/* Academic Information */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Academic Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userProfile.profile.academicLevel && (
                      <div>
                        <h3 className="font-medium text-gray-700 mb-1">Academic Level</h3>
                        <p className="text-gray-600">{userProfile.profile.academicLevel}</p>
                      </div>
                    )}

                    {userProfile.profile.currentInstitution && (
                      <div>
                        <h3 className="font-medium text-gray-700 mb-1">Institution</h3>
                        <p className="text-gray-600">{userProfile.profile.currentInstitution}</p>
                      </div>
                    )}

                    {userProfile.profile.graduationYear && (
                      <div>
                        <h3 className="font-medium text-gray-700 mb-1">Graduation Year</h3>
                        <p className="text-gray-600">{userProfile.profile.graduationYear}</p>
                      </div>
                    )}

                    {userProfile.profile.learningStyle && (
                      <div>
                        <h3 className="font-medium text-gray-700 mb-1">Learning Style</h3>
                        <p className="text-gray-600">{userProfile.profile.learningStyle}</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h2>
              
              {userProfile.profile?.location && (
                <div className="flex items-center space-x-3 mb-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-gray-600">{userProfile.profile.location}</span>
                </div>
              )}

              {userProfile.profile?.languages && userProfile.profile.languages.length > 0 && (
                <div className="flex items-start space-x-3 mb-3">
                  <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                  <div>
                    <span className="text-gray-600">Languages: </span>
                    <span className="text-gray-600">{userProfile.profile.languages.join(', ')}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Social Links */}
            {userProfile.profile?.socialLinks && Object.keys(userProfile.profile.socialLinks).length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Social Links</h2>
                <div className="space-y-3">
                  {Object.entries(userProfile.profile.socialLinks).map(([platform, url]: [string, any]) => (
                    url && (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-3 text-orange-primary hover:text-orange-secondary transition-colors"
                      >
                        <span className="capitalize">{platform}</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default UserProfilePage;