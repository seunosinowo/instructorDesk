import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  Building,
  MapPin,
  Phone,
  Globe,
  Users,
  Calendar,
  Award,
  Star,
  Mail,
  Edit,
  ExternalLink
} from 'lucide-react';

interface School {
  id: string;
  schoolName: string;
  address: string;
  city: string;
  state: string;
  country: string;
  phoneNumber?: string;
  website?: string;
  schoolType: string;
  gradeLevels: string[];
  studentCount?: number;
  teacherCount?: number;
  establishedYear?: number;
  description?: string;
  facilities: string[];
  extracurricularActivities: string[];
  accreditations?: string;
  socialLinks?: Record<string, string>;
  user: {
    id: string;
    name: string;
    profilePicture?: string;
  };
}

const SchoolProfilePage: React.FC = () => {
  const { id, userId } = useParams<{ id?: string; userId?: string }>();
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (id || userId) {
      fetchSchool();
    }

    // Listen for profile updates
    const handleProfileUpdate = () => {
      console.log('Profile updated event received, refreshing data...');
      fetchSchool();
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [id, userId]);

  const fetchSchool = async () => {
    try {
      setLoading(true);
      let apiUrl: string;

      if (userId) {
        // Route: /profile/:userId - get user profile data
        apiUrl = `${import.meta.env.VITE_API_URL}/profile/${userId}`;
      } else if (id) {
        // Route: /schools/:id (fallback)
        apiUrl = `${import.meta.env.VITE_API_URL}/schools/${id}`;
      } else {
        throw new Error('No valid ID provided');
      }

      const response = await axios.get(apiUrl);
      console.log('School data received:', response.data);

      // Transform the data to match the expected School interface
      const userData = response.data;
      if (userData.profile) {
        const schoolData = {
          id: userData.id,
          schoolName: userData.name, // School name comes from user.name
          ...userData.profile,
          user: {
            id: userData.id,
            name: userData.name,
            profilePicture: userData.profilePicture
          }
        };
        console.log('Transformed school data:', schoolData);
        setSchool(schoolData);
      } else {
        throw new Error('No profile data found');
      }
    } catch (err: any) {
      setError('School not found');
      console.error('Error fetching school:', err);
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

  const getSchoolTypeColor = (type: string) => {
    switch (type) {
      case 'public': return 'bg-green-100 text-green-800';
      case 'private': return 'bg-blue-100 text-blue-800';
      case 'charter': return 'bg-purple-100 text-purple-800';
      case 'international': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (error || !school) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Building size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-600 mb-2">School Not Found</h2>
          <p className="text-gray-500 mb-6">The school you're looking for doesn't exist.</p>
          <Link
            to="/schools"
            className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
          >
            Back to Schools
          </Link>
        </div>
      </div>
    );
  }

  // Show edit button if logged-in user is the owner of the school profile
  const loggedInUserId = localStorage.getItem('userId');
  const isOwnProfile = loggedInUserId && school.user.id === loggedInUserId;

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
              <Building className="mr-2" size={16} />
              School
            </div>
          </div>
        </div>

        <div className="bg-white rounded-b-2xl shadow-xl p-6 -mt-16 relative">
          <div className="flex flex-col md:flex-row items-start md:items-end space-y-4 md:space-y-0 md:space-x-8">
            {/* Enhanced Profile Picture */}
            <div className="relative">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-gradient-to-br from-orange-100 to-orange-300">
                {school.user.profilePicture ? (
                  <img
                    src={school.user.profilePicture}
                    alt={school.schoolName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-orange-600 font-bold text-5xl">
                    <Building size={48} />
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
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-1">{school.schoolName}</h1>
                  <p className="text-gray-500 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Joined {formatJoinDate(new Date().toISOString())}
                  </p>
                </div>

                {/* Enhanced Action Buttons */}
                <div className="flex space-x-3 mt-4 md:mt-0">
                  {isOwnProfile ? (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate('/school/profile/edit')}
                      className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-md flex items-center space-x-2"
                    >
                      <Edit size={18} />
                      <span>Edit Profile</span>
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate(`/messages?user=${school.user.id}`)}
                      className="bg-white border-2 border-orange-500 text-orange-600 px-6 py-3 rounded-lg hover:bg-orange-50 transition-all shadow-md flex items-center space-x-2"
                    >
                      <Mail size={18} />
                      <span>Contact School</span>
                    </motion.button>
                  )}
                </div>
              </div>

              {/* School Type Badge */}
              <div className="mt-4">
                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getSchoolTypeColor(school.schoolType)}`}>
                  {school.schoolType.charAt(0).toUpperCase() + school.schoolType.slice(1)} School
                </span>
              </div>

              {/* Bio/Description */}
              {school.description && (
                <div className="mt-6">
                  <p className="text-gray-700 leading-relaxed bg-orange-50 p-4 rounded-xl border-l-4 border-orange-500">
                    {school.description}
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
            {/* School Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100"
            >
              <div className="flex items-center mb-4">
                <div className="bg-orange-100 p-2 rounded-lg mr-3">
                  <Building className="text-orange-600" size={24} />
                </div>
                <h2 className="text-xl font-bold text-gray-800">School Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {school.gradeLevels && school.gradeLevels.length > 0 && (
                  <div>
                    <h3 className="font-medium text-orange-600 mb-3 flex items-center">
                      <Award className="text-gray-500 mr-2" size={18} />
                      Grade Levels
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {school.gradeLevels.map((level, index) => (
                        <span key={index} className="bg-gradient-to-b from-orange-50 to-orange-100 text-orange-800 px-3 py-2 rounded-full text-sm font-medium shadow-sm">
                          {level}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {school.facilities && school.facilities.length > 0 && (
                  <div>
                    <h3 className="font-medium text-orange-600 mb-3 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Facilities
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {school.facilities.slice(0, 4).map((facility, index) => (
                        <span key={index} className="bg-gradient-to-b from-orange-50 to-orange-100 text-orange-800 px-3 py-2 rounded-full text-sm font-medium shadow-sm">
                          {facility}
                        </span>
                      ))}
                      {school.facilities.length > 4 && (
                        <span className="bg-gray-100 text-gray-600 px-3 py-2 rounded-full text-sm font-medium">
                          +{school.facilities.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Academic Excellence */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100"
            >
              <div className="flex items-center mb-4">
                <div className="bg-orange-100 p-2 rounded-lg mr-3">
                  <Award className="text-orange-600" size={24} />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Academic Excellence</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {school.accreditations && (
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-xl">
                    <h3 className="font-medium text-gray-700 mb-1 flex items-center">
                      <Award className="text-orange-500 mr-2" size={18} />
                      Accreditation
                    </h3>
                    <p className="text-lg font-medium text-orange-600">{school.accreditations}</p>
                  </div>
                )}

                {school.extracurricularActivities && school.extracurricularActivities.length > 0 && (
                  <div>
                    <h3 className="font-medium text-orange-600 mb-3 flex items-center">
                      <Star className="text-gray-500 mr-2" size={18} />
                      Extracurricular Activities
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {school.extracurricularActivities.slice(0, 3).map((activity, index) => (
                        <span key={index} className="bg-gradient-to-b from-orange-50 to-orange-100 text-orange-800 px-3 py-2 rounded-full text-sm font-medium shadow-sm">
                          {activity}
                        </span>
                      ))}
                      {school.extracurricularActivities.length > 3 && (
                        <span className="bg-gray-100 text-gray-600 px-3 py-2 rounded-full text-sm font-medium">
                          +{school.extracurricularActivities.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white"
            >
              <div className="flex items-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h3 className="text-xl font-bold text-white">Quick Stats</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {school.studentCount && (
                  <div className="bg-white/20 p-3 rounded-xl text-center">
                    <Users className="text-white mb-2 mx-auto" size={20} />
                    <p className="text-xs text-white/80">Students</p>
                    <p className="text-lg font-bold text-white">{school.studentCount.toLocaleString()}</p>
                  </div>
                )}

                {school.teacherCount && (
                  <div className="bg-white/20 p-3 rounded-xl text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white mb-2 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <p className="text-xs text-white/80">Teachers</p>
                    <p className="text-lg font-bold text-white">{school.teacherCount}</p>
                  </div>
                )}

                {school.establishedYear && (
                  <div className="bg-white/20 p-3 rounded-xl text-center">
                    <Calendar className="text-white mb-2 mx-auto" size={20} />
                    <p className="text-xs text-white/80">Established</p>
                    <p className="text-lg font-bold text-white">{school.establishedYear}</p>
                  </div>
                )}

                {school.gradeLevels && (
                  <div className="bg-white/20 p-3 rounded-xl text-center">
                    <Award className="text-white mb-2 mx-auto" size={20} />
                    <p className="text-xs text-white/80">Grade Levels</p>
                    <p className="text-lg font-bold text-white">{school.gradeLevels.length}</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
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

              <div className="space-y-4">
                {school.phoneNumber && (
                  <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                    <div className="bg-orange-100 p-2 rounded-full">
                      <Phone className="text-orange-600" size={16} />
                    </div>
                    <div>
                      <p className="text-xs text-orange-600">Phone</p>
                      <p className="text-gray-800 font-medium">{school.phoneNumber}</p>
                    </div>
                  </div>
                )}

                {school.website && (
                  <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                    <div className="bg-orange-100 p-2 rounded-full">
                      <Globe className="text-orange-600" size={16} />
                    </div>
                    <div>
                      <p className="text-xs text-orange-600">Website</p>
                      <a
                        href={school.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-800 font-medium hover:text-orange-600 transition-colors"
                      >
                        Visit Website
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                  <div className="bg-orange-100 p-2 rounded-full">
                    <MapPin className="text-orange-600" size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-orange-600">Location</p>
                    <p className="text-gray-800 font-medium">{school.city}, {school.state}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Social Links */}
            {school.socialLinks && Object.keys(school.socialLinks).length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100"
              >
                <div className="flex items-center mb-4">
                  <div className="bg-orange-100 p-2 rounded-lg mr-3">
                    <ExternalLink className="text-orange-600" size={24} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Connect</h2>
                </div>
                <div className="space-y-3">
                  {Object.entries(school.socialLinks).map(([platform, url]) => (
                    url && (
                      <a
                        key={platform}
                        href={url as string}
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

            {/* Mission Statement */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg"
            >
              <div className="flex items-start space-x-4">
                <div className="bg-white/20 p-3 rounded-full">
                  <span className="text-2xl">🎓</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Educational Excellence</h3>
                  <p className="text-orange-100">
                    Committed to providing quality education and nurturing future leaders.
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

export default SchoolProfilePage;