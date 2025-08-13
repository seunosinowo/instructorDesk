import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  User as UserIcon, Mail, MapPin, BookOpen, GraduationCap, 
  Award, Target, BarChart2, Edit, Star, Briefcase, 
  Layout, Bookmark, Clock, Globe, CheckCircle, 
  MessageCircle, Phone, Video, Mail as MailIcon,
  ExternalLink, Github, Linkedin, Twitter, DollarSign,
  Calendar, Users, Languages
} from 'lucide-react';
import type { User, TeacherProfile, StudentProfile } from '../types';

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<User & { profile?: TeacherProfile | StudentProfile } | null>(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const userRole = localStorage.getItem('role');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(7);
        console.log('Fetching profile data at:', timestamp);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/profile/${localStorage.getItem('userId')}?t=${timestamp}&cache=${randomId}&_=${Date.now()}`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
        });
        console.log('Profile data received:', response.data);
        console.log('Profile structure:', {
          role: response.data.role,
          hasProfile: !!response.data.profile,
          profileKeys: response.data.profile ? Object.keys(response.data.profile) : [],
          currentInstitution: response.data.profile?.currentInstitution,
          budget: response.data.profile?.budget,
          goals: response.data.profile?.goals,
          goalsType: typeof response.data.profile?.goals
        });
        setProfile(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Profile fetch error:', err);
        if (!localStorage.getItem('profileCompleted')) {
          setLoading(false);
        } else {
          setLoading(false);
        }
      }
    };
    fetchProfile();
  }, [token, navigate]);

  // Also refresh when the component mounts (useful when navigating back from edit)
  // Debounce function to limit refreshProfile calls
  function debounce(func: (...args: any[]) => void, wait: number) {
    let timeout: ReturnType<typeof setTimeout>;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  useEffect(() => {
    const debouncedRefresh = debounce(() => {
      console.log('Debounced profile refresh...');
      refreshProfile();
    }, 500);

    const handleFocus = () => {
      debouncedRefresh();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        debouncedRefresh();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Add a function to refresh profile data
  const refreshProfile = async () => {
    try {
      console.log('Refreshing profile data...');
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(7);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/profile/${localStorage.getItem('userId')}?t=${timestamp}&cache=${randomId}&_=${Date.now()}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
      });
      console.log('Refreshed profile data:', response.data);
      console.log('Refreshed profile structure:', {
        role: response.data.role,
        hasProfile: !!response.data.profile,
        profileKeys: response.data.profile ? Object.keys(response.data.profile) : [],
        currentInstitution: response.data.profile?.currentInstitution,
        budget: response.data.profile?.budget,
        goals: response.data.profile?.goals,
        goalsType: typeof response.data.profile?.goals
      });
      setProfile(response.data);
    } catch (err) {
      console.error('Profile refresh error:', err);
    }
  };

  // Listen for profile updates (you can call this from edit page)
  useEffect(() => {
    const handleProfileUpdate = () => {
      console.log('Profile update event received, refreshing...');
      refreshProfile();
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500 mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!profile || !profile.profile) {
    return (
      <div className="max-w-4xl mx-auto mt-10 p-4">
        <div className="bg-gradient-to-r from-orange-400 to-amber-500 rounded-2xl p-8 text-center text-white">
          <BookOpen size={64} className="mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4">Complete Your Profile</h1>
          <p className="text-xl mb-6 max-w-2xl mx-auto">
            Finish setting up your profile to get the most out of Teacherrs
          </p>
          <div className="flex justify-center">
            <button
              onClick={() => navigate(userRole === 'teacher' ? '/teacher-profile-setup' : '/student-profile-setup')}
              className="bg-white text-orange-600 px-8 py-3 rounded-full font-bold text-lg hover:bg-amber-50 transition-all shadow-lg"
            >
              Complete Profile Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-7xl mx-auto px-4 py-8"
    >
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl shadow-2xl overflow-hidden mb-10">
        <div className="p-8 flex flex-col md:flex-row items-center">
          <div className="relative">
            <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-xl">
              {profile.profilePicture ? (
                <img 
                  src={profile.profilePicture} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-orange-400 flex items-center justify-center text-white font-bold text-4xl">
                  {profile.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <div className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg">
              <Edit size={18} className="text-orange-500" />
            </div>
          </div>
          
          <div className="mt-6 md:mt-0 md:ml-8 text-center md:text-left flex-1">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white">{profile.name}</h1>
                <div className="flex items-center justify-center md:justify-start mt-2">
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium capitalize">
                    {profile.role}
                  </span>
                  {profile.role === 'teacher' && (profile.profile as TeacherProfile)?.hourlyRate && (
                    <span className="ml-3 bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                      ${(profile.profile as TeacherProfile).hourlyRate}/hr
                    </span>
                  )}
                </div>
              </div>
              
              <Link
                to="/profile/edit"
                className="mt-4 md:mt-0 bg-white text-orange-600 px-6 py-3 rounded-full hover:bg-amber-50 transition duration-300 font-semibold flex items-center shadow-lg"
              >
                <Edit size={18} className="mr-2" />
                Edit Profile
              </Link>
            </div>
            
            {profile.bio && (
              <p className="text-white/90 mt-4 max-w-2xl">
                {profile.bio}
              </p>
            )}
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-6">
              <div className="flex items-center text-white">
                <Mail size={18} className="mr-2" />
                <span>{profile.email}</span>
              </div>
              
              {profile.role === 'teacher' && (profile.profile as TeacherProfile)?.location && (
                <div className="flex items-center text-white">
                  <MapPin size={18} className="mr-2" />
                  <span>{(profile.profile as TeacherProfile).location}</span>
                </div>
              )}
              
              {profile.role === 'student' && (profile.profile as StudentProfile)?.location && (
                <div className="flex items-center text-white">
                  <MapPin size={18} className="mr-2" />
                  <span>{(profile.profile as StudentProfile).location}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {profile.role === 'teacher' ? (
            <TeacherProfileView profile={profile.profile as TeacherProfile} />
          ) : (
            <StudentProfileView profile={profile.profile as StudentProfile} />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <ContactInfoCard profile={profile} />
          
          {profile.role === 'teacher' && (
            <TeacherStatsCard profile={profile.profile as TeacherProfile} />
          )}
          
          <ProfileDashboard />
        </div>
      </div>
    </motion.div>
  );
};

// Teacher Profile View Component
const TeacherProfileView: React.FC<{ profile: TeacherProfile }> = ({ profile }) => {
  return (
    <>
      {/* Teaching Information Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100"
      >
        <div className="flex items-center mb-6">
          <BookOpen className="text-orange-500 mr-3" size={24} />
          <h3 className="text-xl font-bold text-gray-800">Teaching Information</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2 flex items-center">
              <Layout className="text-gray-500 mr-2" size={18} />
              Subjects
            </h4>
            <div className="flex flex-wrap gap-2">
              {profile.subjects?.map((subject, index) => (
                <motion.span 
                  key={index}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-orange-100 text-orange-800 px-3 py-1.5 rounded-full text-sm font-medium"
                >
                  {subject}
                </motion.span>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 mb-2 flex items-center">
              <Briefcase className="text-gray-500 mr-2" size={18} />
              Experience
            </h4>
            <p className="text-gray-800 font-medium">{profile.experience} years</p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 mb-2 flex items-center">
              <GraduationCap className="text-gray-500 mr-2" size={18} />
              Qualifications
            </h4>
            <p className="text-gray-800 font-medium">{profile.qualifications}</p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 mb-2 flex items-center">
              <Clock className="text-gray-500 mr-2" size={18} />
              Availability
            </h4>
            <p className="text-gray-800 font-medium">{profile.availability || 'Flexible'}</p>
          </div>
        </div>
      </motion.div>

      {/* Specializations Card */}
      {profile.specializations && profile.specializations.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100"
        >
          <div className="flex items-center mb-6">
            <Bookmark className="text-orange-500 mr-3" size={24} />
            <h3 className="text-xl font-bold text-gray-800">Specializations</h3>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {profile.specializations.map((spec, index) => (
              <motion.span 
                key={index}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-blue-50 text-blue-800 px-4 py-2 rounded-full font-medium"
              >
                {spec}
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Teaching Philosophy Card */}
      {profile.teachingPhilosophy && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100"
        >
          <div className="flex items-center mb-6">
            <MessageCircle className="text-orange-500 mr-3" size={24} />
            <h3 className="text-xl font-bold text-gray-800">Teaching Philosophy</h3>
          </div>
          
          <p className="text-gray-700 leading-relaxed bg-orange-50 p-5 rounded-xl">
            {profile.teachingPhilosophy}
          </p>
        </motion.div>
      )}

      {/* Teaching Methods Card */}
      {profile.teachingMethods && profile.teachingMethods.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100"
        >
          <div className="flex items-center mb-6">
            <Layout className="text-orange-500 mr-3" size={24} />
            <h3 className="text-xl font-bold text-gray-800">Teaching Methods</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.teachingMethods.map((method, index) => (
              <div key={index} className="flex items-center bg-gray-50 p-4 rounded-xl">
                <CheckCircle className="text-green-500 mr-3" size={18} />
                <span className="text-gray-800">{method}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Languages & Certifications Card */}
      {((profile.languages && profile.languages.length > 0) || (profile.certifications && profile.certifications.length > 0)) && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100"
        >
          <div className="flex items-center mb-6">
            <Globe className="text-orange-500 mr-3" size={24} />
            <h3 className="text-xl font-bold text-gray-800">Languages & Certifications</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {profile.languages && profile.languages.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                  <Languages className="text-gray-500 mr-2" size={18} />
                  Languages
                </h4>
                <div className="flex flex-wrap gap-2">
                  {profile.languages.map((language, index) => (
                    <span 
                      key={index}
                      className="bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-sm font-medium"
                    >
                      {language}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {profile.certifications && profile.certifications.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                  <Award className="text-gray-500 mr-2" size={18} />
                  Certifications
                </h4>
                <div className="flex flex-wrap gap-2">
                  {profile.certifications.map((cert, index) => (
                    <span 
                      key={index}
                      className="bg-purple-100 text-purple-800 px-3 py-1.5 rounded-full text-sm font-medium"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Education & Preferred Student Level Card */}
      {(profile.education || (profile.preferredStudentLevel && profile.preferredStudentLevel.length > 0)) && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100"
        >
          <div className="flex items-center mb-6">
            <GraduationCap className="text-orange-500 mr-3" size={24} />
            <h3 className="text-xl font-bold text-gray-800">Education & Teaching Preferences</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {profile.education && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                  <BookOpen className="text-gray-500 mr-2" size={18} />
                  Education Background
                </h4>
                <p className="text-gray-800 bg-gray-50 p-4 rounded-xl">{profile.education}</p>
              </div>
            )}
            
            {profile.preferredStudentLevel && profile.preferredStudentLevel.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                  <Users className="text-gray-500 mr-2" size={18} />
                  Preferred Student Levels
                </h4>
                <div className="flex flex-wrap gap-2">
                  {profile.preferredStudentLevel.map((level, index) => (
                    <span 
                      key={index}
                      className="bg-indigo-100 text-indigo-800 px-3 py-1.5 rounded-full text-sm font-medium"
                    >
                      {level}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Social Links Card */}
      {profile.socialLinks && (profile.socialLinks.linkedin || profile.socialLinks.website || profile.socialLinks.twitter) && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100"
        >
          <div className="flex items-center mb-6">
            <ExternalLink className="text-orange-500 mr-3" size={24} />
            <h3 className="text-xl font-bold text-gray-800">Social Links</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {profile.socialLinks.linkedin && (
              <a 
                href={profile.socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors group"
              >
                <Linkedin className="text-blue-600 mr-3 group-hover:scale-110 transition-transform" size={20} />
                <div>
                  <p className="font-medium text-gray-800">LinkedIn</p>
                  <p className="text-sm text-gray-600">Professional Profile</p>
                </div>
              </a>
            )}
            
            {profile.socialLinks.website && (
              <a 
                href={profile.socialLinks.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors group"
              >
                <Globe className="text-green-600 mr-3 group-hover:scale-110 transition-transform" size={20} />
                <div>
                  <p className="font-medium text-gray-800">Website</p>
                  <p className="text-sm text-gray-600">Personal Website</p>
                </div>
              </a>
            )}
            
            {profile.socialLinks.twitter && (
              <a 
                href={profile.socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-4 bg-sky-50 rounded-xl hover:bg-sky-100 transition-colors group"
              >
                <Twitter className="text-sky-600 mr-3 group-hover:scale-110 transition-transform" size={20} />
                <div>
                  <p className="font-medium text-gray-800">Twitter</p>
                  <p className="text-sm text-gray-600">Social Profile</p>
                </div>
              </a>
            )}
          </div>
        </motion.div>
      )}

      {/* Achievements Card */}
      {profile.achievements && profile.achievements.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100"
        >
          <div className="flex items-center mb-6">
            <Award className="text-orange-500 mr-3" size={24} />
            <h3 className="text-xl font-bold text-gray-800">Achievements & Awards</h3>
          </div>
          
          <ul className="space-y-4">
            {profile.achievements.map((achievement, index) => (
              <li key={index} className="flex items-start">
                <div className="bg-orange-100 p-2 rounded-full mr-4">
                  <Award className="text-orange-600" size={18} />
                </div>
                <span className="text-gray-800">{achievement}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </>
  );
};

// Student Profile View Component
const StudentProfileView: React.FC<{ profile: StudentProfile }> = ({ profile }) => {
  return (
    <>
      {/* Academic Information Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100"
      >
        <div className="flex items-center mb-6">
          <GraduationCap className="text-orange-500 mr-3" size={24} />
          <h3 className="text-xl font-bold text-gray-800">Academic Information</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2 flex items-center">
              <BookOpen className="text-gray-500 mr-2" size={18} />
              Academic Level
            </h4>
            <p className="text-gray-800 font-medium">{profile.academicLevel}</p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 mb-2 flex items-center">
              <Layout className="text-gray-500 mr-2" size={18} />
              Current Institution
            </h4>
            <p className="text-gray-800 font-medium">{profile.currentInstitution || 'Not specified'}</p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 mb-2 flex items-center">
              <Clock className="text-gray-500 mr-2" size={18} />
              Graduation Year
            </h4>
            <p className="text-gray-800 font-medium">{profile.graduationYear || 'Not specified'}</p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 mb-2 flex items-center">
              <UserIcon className="text-gray-500 mr-2" size={18} />
              Learning Style
            </h4>
            <p className="text-gray-800 font-medium">{profile.learningStyle || 'Not specified'}</p>
          </div>
        </div>
      </motion.div>

      {/* Interests Card */}
      {profile.interests && profile.interests.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100"
        >
          <div className="flex items-center mb-6">
            <Star className="text-orange-500 mr-3" size={24} />
            <h3 className="text-xl font-bold text-gray-800">Interests</h3>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {profile.interests.map((interest, index) => (
              <motion.span 
                key={index}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-orange-100 text-orange-800 px-4 py-2 rounded-full font-medium"
              >
                {interest}
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Learning Goals Card */}
      {profile.goals && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100"
        >
          <div className="flex items-center mb-6">
            <Target className="text-orange-500 mr-3" size={24} />
            <h3 className="text-xl font-bold text-gray-800">Learning Goals</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(() => {
              // Handle both string (from backend with newlines) and array formats
              const goalsData = profile.goals as string[] | string;
              const goals: string[] = Array.isArray(goalsData) 
                ? goalsData 
                : typeof goalsData === 'string' 
                  ? goalsData.split('\n').filter((goal: string) => goal.trim())
                  : [];
              
              return goals.map((goal: string, index: number) => (
                <div key={index} className="flex items-center bg-gray-50 p-4 rounded-xl">
                  <CheckCircle className="text-green-500 mr-3" size={18} />
                  <span className="text-gray-800">{goal.trim()}</span>
                </div>
              ));
            })()}
          </div>
        </motion.div>
      )}

      {/* Skills Card */}
      {profile.skills && profile.skills.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100"
        >
          <div className="flex items-center mb-6">
            <BarChart2 className="text-orange-500 mr-3" size={24} />
            <h3 className="text-xl font-bold text-gray-800">Skills</h3>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {profile.skills.map((skill, index) => (
              <motion.span 
                key={index}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full font-medium"
              >
                {skill}
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Career Goals Card */}
      {profile.careerGoals && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100"
        >
          <div className="flex items-center mb-6">
            <Target className="text-orange-500 mr-3" size={24} />
            <h3 className="text-xl font-bold text-gray-800">Career Goals</h3>
          </div>
          
          <p className="text-gray-700 leading-relaxed bg-orange-50 p-5 rounded-xl">
            {profile.careerGoals}
          </p>
        </motion.div>
      )}

      {/* Projects Card */}
      {profile.projects && profile.projects.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100"
        >
          <div className="flex items-center mb-6">
            <Briefcase className="text-orange-500 mr-3" size={24} />
            <h3 className="text-xl font-bold text-gray-800">Projects</h3>
          </div>
          
          <ul className="space-y-4">
            {profile.projects.map((project, index) => (
              <li key={index} className="flex items-start">
                <div className="bg-orange-100 p-2 rounded-full mr-4">
                  <CheckCircle className="text-orange-600" size={18} />
                </div>
                <span className="text-gray-800">{project}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Extracurriculars & Languages Card */}
      {((profile.extracurriculars && profile.extracurriculars.length > 0) || (profile.languages && profile.languages.length > 0)) && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100"
        >
          <div className="flex items-center mb-6">
            <Star className="text-orange-500 mr-3" size={24} />
            <h3 className="text-xl font-bold text-gray-800">Activities & Languages</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {profile.extracurriculars && profile.extracurriculars.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                  <Star className="text-gray-500 mr-2" size={18} />
                  Extracurricular Activities
                </h4>
                <div className="space-y-2">
                  {profile.extracurriculars.map((activity, index) => (
                    <div key={index} className="flex items-center bg-gray-50 p-3 rounded-lg">
                      <CheckCircle className="text-green-500 mr-3" size={16} />
                      <span className="text-gray-800">{activity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {profile.languages && profile.languages.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                  <Languages className="text-gray-500 mr-2" size={18} />
                  Languages
                </h4>
                <div className="flex flex-wrap gap-2">
                  {profile.languages.map((language, index) => (
                    <span 
                      key={index}
                      className="bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-sm font-medium"
                    >
                      {language}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Learning Preferences Card */}
      {((profile.preferredSubjects && profile.preferredSubjects.length > 0) || profile.preferredLearningTime || profile.budget) && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100"
        >
          <div className="flex items-center mb-6">
            <Clock className="text-orange-500 mr-3" size={24} />
            <h3 className="text-xl font-bold text-gray-800">Learning Preferences</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {profile.preferredSubjects && profile.preferredSubjects.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                  <BookOpen className="text-gray-500 mr-2" size={18} />
                  Preferred Subjects
                </h4>
                <div className="flex flex-wrap gap-2">
                  {profile.preferredSubjects.map((subject, index) => (
                    <span 
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm font-medium"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              {profile.preferredLearningTime && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                    <Calendar className="text-gray-500 mr-2" size={18} />
                    Preferred Learning Time
                  </h4>
                  <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{profile.preferredLearningTime}</p>
                </div>
              )}
              
              {profile.budget && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                    <DollarSign className="text-gray-500 mr-2" size={18} />
                    Budget Range
                  </h4>
                  <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">Up to ${profile.budget}/hour</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Social Links Card */}
      {profile.socialLinks && (profile.socialLinks.github || profile.socialLinks.linkedin || profile.socialLinks.portfolio) && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100"
        >
          <div className="flex items-center mb-6">
            <ExternalLink className="text-orange-500 mr-3" size={24} />
            <h3 className="text-xl font-bold text-gray-800">Social Links</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {profile.socialLinks.github && (
              <a 
                href={profile.socialLinks.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
              >
                <Github className="text-gray-800 mr-3 group-hover:scale-110 transition-transform" size={20} />
                <div>
                  <p className="font-medium text-gray-800">GitHub</p>
                  <p className="text-sm text-gray-600">Code Repository</p>
                </div>
              </a>
            )}
            
            {profile.socialLinks.linkedin && (
              <a 
                href={profile.socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors group"
              >
                <Linkedin className="text-blue-600 mr-3 group-hover:scale-110 transition-transform" size={20} />
                <div>
                  <p className="font-medium text-gray-800">LinkedIn</p>
                  <p className="text-sm text-gray-600">Professional Profile</p>
                </div>
              </a>
            )}
            
            {profile.socialLinks.portfolio && (
              <a 
                href={profile.socialLinks.portfolio}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors group"
              >
                <Globe className="text-purple-600 mr-3 group-hover:scale-110 transition-transform" size={20} />
                <div>
                  <p className="font-medium text-gray-800">Portfolio</p>
                  <p className="text-sm text-gray-600">Personal Portfolio</p>
                </div>
              </a>
            )}
          </div>
        </motion.div>
      )}
    </>
  );
};

// Contact Info Card Component
const ContactInfoCard: React.FC<{ profile: User }> = ({ profile }) => {
  const contactMethods = [];
  
  if (profile.role === 'teacher') {
    const teacherProfile = profile.profile as TeacherProfile;
    
    if (teacherProfile.contactPreference) {
      contactMethods.push({
        icon: teacherProfile.contactPreference === 'Email' ? <MailIcon /> : 
              teacherProfile.contactPreference === 'Phone' ? <Phone /> : 
              teacherProfile.contactPreference === 'Video Call' ? <Video /> : <MessageCircle />,
        label: 'Preferred Contact',
        value: teacherProfile.contactPreference
      });
    }

    if (teacherProfile.hourlyRate) {
      contactMethods.push({
        icon: <DollarSign />,
        label: 'Hourly Rate',
        value: `$${teacherProfile.hourlyRate}/hour`
      });
    }
  }

  if (profile.role === 'student') {
    const studentProfile = profile.profile as StudentProfile;
    
    if (studentProfile.budget) {
      contactMethods.push({
        icon: <DollarSign />,
        label: 'Budget Range',
        value: `Up to $${studentProfile.budget}/hour`
      });
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100"
    >
      <div className="flex items-center mb-6">
        <UserIcon className="text-orange-500 mr-3" size={24} />
        <h3 className="text-xl font-bold text-gray-800">Contact Information</h3>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
          <Mail className="text-gray-500 mr-3" size={18} />
          <span className="text-gray-800 font-medium">{profile.email}</span>
        </div>
        
        {profile.role === 'teacher' && (profile.profile as TeacherProfile)?.location && (
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <MapPin className="text-gray-500 mr-3" size={18} />
            <span className="text-gray-800 font-medium">{(profile.profile as TeacherProfile).location}</span>
          </div>
        )}
        
        {profile.role === 'student' && (profile.profile as StudentProfile)?.location && (
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <MapPin className="text-gray-500 mr-3" size={18} />
            <span className="text-gray-800 font-medium">{(profile.profile as StudentProfile).location}</span>
          </div>
        )}
        
        {contactMethods.map((method, index) => (
          <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
            <div className="text-gray-500 mr-3">{method.icon}</div>
            <div>
              <p className="text-sm text-gray-500">{method.label}</p>
              <p className="text-gray-800 font-medium">{method.value}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

// Teacher Stats Card Component
const TeacherStatsCard: React.FC<{ profile: TeacherProfile }> = ({ profile }) => {
  const stats = [
    { icon: <Briefcase />, label: 'Experience', value: `${profile.experience} years` },
    { icon: <BookOpen />, label: 'Subjects', value: profile.subjects?.length || 0 },
    { icon: <Globe />, label: 'Languages', value: profile.languages?.length || 0 },
    { icon: <Award />, label: 'Certifications', value: profile.certifications?.length || 0 },
    { icon: <Star />, label: 'Specializations', value: profile.specializations?.length || 0 },
    { icon: <Users />, label: 'Teaching Methods', value: profile.teachingMethods?.length || 0 },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl shadow-lg p-6"
    >
      <div className="flex items-center mb-6">
        <BarChart2 className="text-white mr-3" size={24} />
        <h3 className="text-xl font-bold text-white">Quick Stats</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white/20 p-3 rounded-xl text-center">
            <div className="text-white mb-2 flex justify-center">
              {stat.icon}
            </div>
            <p className="text-xs text-white/80">{stat.label}</p>
            <p className="text-lg font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>
      
      {profile.hourlyRate && (
        <div className="mt-4 bg-white/20 p-4 rounded-xl text-center">
          <div className="text-white mb-2 flex justify-center">
            <DollarSign />
          </div>
          <p className="text-sm text-white/80">Hourly Rate</p>
          <p className="text-2xl font-bold text-white">${profile.hourlyRate}</p>
        </div>
      )}
    </motion.div>
  );
};

// Profile Dashboard Component (Simplified)
const ProfileDashboard: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100"
    >
      <div className="flex items-center mb-6">
        <Layout className="text-orange-500 mr-3" size={24} />
        <h3 className="text-xl font-bold text-gray-800">Dashboard</h3>
      </div>
      
      <div className="space-y-4">
        <Link 
          to="/messages" 
          className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-orange-50 transition-colors"
        >
          <MessageCircle className="text-gray-500 mr-3" size={18} />
          <span className="text-gray-800 font-medium">Messages</span>
        </Link>
      </div>
    </motion.div>
  );
};

export default ProfilePage;