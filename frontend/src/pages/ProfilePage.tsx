import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import TeacherProfileSetup from '../components/Profile/TeacherProfileSetup';
import StudentProfileSetup from '../components/Profile/StudentProfileSetup';
import ProfileDashboard from '../components/Profile/ProfileDashboard';
import { motion } from 'framer-motion';
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
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/profile/${localStorage.getItem('userId')}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(response.data);
        setLoading(false);
      } catch (err) {
        if (!localStorage.getItem('profileCompleted')) {
          // If profile doesn't exist, show setup form
          setLoading(false);
        } else {
          setLoading(false);
        }
      }
    };
    fetchProfile();
  }, [token, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-primary"></div>
      </div>
    );
  }

  // If no profile exists, show setup forms
  if (!profile || !profile.profile) {
    return (
      <>
        {userRole === 'teacher' ? <TeacherProfileSetup /> : <StudentProfileSetup />}
      </>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-6xl mx-auto mt-10 p-8"
    >
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-orange-primary to-orange-secondary h-32"></div>
        <div className="relative px-8 pb-8">
          <div className="flex items-end -mt-16 mb-6">
            <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg">
              {profile.profilePicture ? (
                <img 
                  src={profile.profilePicture} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-orange-primary flex items-center justify-center text-white font-bold text-4xl">
                  {profile.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <div className="ml-6 flex-1">
              <div className="flex justify-between items-end">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">{profile.name}</h1>
                  <p className="text-lg text-gray-600 capitalize">{profile.role}</p>
                  {profile.bio && <p className="text-gray-700 mt-2">{profile.bio}</p>}
                </div>
                <Link
                  to="/profile/edit"
                  className="bg-orange-primary text-white px-6 py-2 rounded-lg hover:bg-orange-secondary transition duration-300 font-semibold"
                >
                  Edit Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {profile.role === 'teacher' ? (
            <TeacherProfileView profile={profile.profile as TeacherProfile} />
          ) : (
            <StudentProfileView profile={profile.profile as StudentProfile} />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <ContactInfoCard profile={profile} />
          {profile.role === 'teacher' && (
            <TeacherStatsCard profile={profile.profile as TeacherProfile} />
          )}
          <ProfileDashboard profile={profile} />
        </div>
      </div>
    </motion.div>
  );
};

// Teacher Profile View Component
const TeacherProfileView: React.FC<{ profile: TeacherProfile }> = ({ profile }) => {
  return (
    <>
      {/* Teaching Information */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Teaching Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Subjects</h4>
            <div className="flex flex-wrap gap-2">
              {profile.subjects?.map((subject, index) => (
                <span key={index} className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                  {subject}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Experience</h4>
            <p className="text-gray-600">{profile.experience} years</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Qualifications</h4>
            <p className="text-gray-600">{profile.qualifications}</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Hourly Rate</h4>
            <p className="text-gray-600">${profile.hourlyRate}/hour</p>
          </div>
        </div>
      </div>

      {/* Specializations */}
      {profile.specializations && profile.specializations.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Specializations</h3>
          <div className="flex flex-wrap gap-2">
            {profile.specializations.map((spec, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                {spec}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Teaching Philosophy */}
      {profile.teachingPhilosophy && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Teaching Philosophy</h3>
          <p className="text-gray-700 leading-relaxed">{profile.teachingPhilosophy}</p>
        </div>
      )}

      {/* Teaching Methods */}
      {profile.teachingMethods && profile.teachingMethods.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Teaching Methods</h3>
          <div className="flex flex-wrap gap-2">
            {profile.teachingMethods.map((method, index) => (
              <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                {method}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Achievements */}
      {profile.achievements && profile.achievements.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Achievements & Awards</h3>
          <ul className="space-y-2">
            {profile.achievements.map((achievement, index) => (
              <li key={index} className="flex items-center text-gray-700">
                <svg className="w-5 h-5 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {achievement}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};

// Student Profile View Component
const StudentProfileView: React.FC<{ profile: StudentProfile }> = ({ profile }) => {
  return (
    <>
      {/* Academic Information */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Academic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Academic Level</h4>
            <p className="text-gray-600">{profile.academicLevel}</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Current Institution</h4>
            <p className="text-gray-600">{profile.currentInstitution || 'Not specified'}</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Graduation Year</h4>
            <p className="text-gray-600">{profile.graduationYear || 'Not specified'}</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Learning Style</h4>
            <p className="text-gray-600">{profile.learningStyle || 'Not specified'}</p>
          </div>
        </div>
      </div>

      {/* Interests */}
      {profile.interests && profile.interests.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Interests</h3>
          <div className="flex flex-wrap gap-2">
            {profile.interests.map((interest, index) => (
              <span key={index} className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Learning Goals */}
      {profile.goals && profile.goals.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Learning Goals</h3>
          <div className="flex flex-wrap gap-2">
            {profile.goals.map((goal, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                {goal}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {profile.skills && profile.skills.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill, index) => (
              <span key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Career Goals */}
      {profile.careerGoals && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Career Goals</h3>
          <p className="text-gray-700 leading-relaxed">{profile.careerGoals}</p>
        </div>
      )}

      {/* Projects */}
      {profile.projects && profile.projects.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Projects</h3>
          <ul className="space-y-2">
            {profile.projects.map((project, index) => (
              <li key={index} className="flex items-center text-gray-700">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {project}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};

// Contact Info Card Component
const ContactInfoCard: React.FC<{ profile: User }> = ({ profile }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Contact Information</h3>
      <div className="space-y-3">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-gray-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
          <span className="text-gray-700">{profile.email}</span>
        </div>
        {profile.role === 'teacher' && (profile.profile as TeacherProfile)?.location && (
          <div className="flex items-center">
            <svg className="w-5 h-5 text-gray-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span className="text-gray-700">{(profile.profile as TeacherProfile).location}</span>
          </div>
        )}
        {profile.role === 'student' && (profile.profile as StudentProfile)?.location && (
          <div className="flex items-center">
            <svg className="w-5 h-5 text-gray-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span className="text-gray-700">{(profile.profile as StudentProfile).location}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Teacher Stats Card Component
const TeacherStatsCard: React.FC<{ profile: TeacherProfile }> = ({ profile }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Stats</h3>
      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Experience</span>
          <span className="font-semibold text-gray-800">{profile.experience} years</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Subjects</span>
          <span className="font-semibold text-gray-800">{profile.subjects?.length || 0}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Hourly Rate</span>
          <span className="font-semibold text-gray-800">${profile.hourlyRate}/hr</span>
        </div>
        {profile.languages && profile.languages.length > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">Languages</span>
            <span className="font-semibold text-gray-800">{profile.languages.length}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;