import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { validateImageFile, resizeImage } from '../utils/imageUpload';
import type { User, TeacherProfile, StudentProfile } from '../types';

const ProfileEditPage: React.FC = () => {
  const [, setProfile] = useState<User & { profile?: TeacherProfile | StudentProfile } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string>('');
  
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const userRole = localStorage.getItem('role');

  // Form states for basic user info
  const [name, setName] = useState('');

  // Teacher-specific states
  const [teacherData, setTeacherData] = useState<Partial<TeacherProfile>>({
    subjects: [],
    qualifications: '',
    experience: 0,
    specializations: [],
    teachingMethods: [],
    availability: '',
    hourlyRate: 0,
    location: '',
    languages: [],
    certifications: [],
    education: '',
    achievements: [],
    teachingPhilosophy: '',
    preferredStudentLevel: [],
    contactPreference: '',
    socialLinks: {}
  });

  // Student-specific states
  const [studentData, setStudentData] = useState<Partial<StudentProfile>>({
    interests: [],
    academicLevel: '',
    goals: [],
    learningStyle: '',
    preferredSubjects: [],
    currentInstitution: '',
    graduationYear: 0,
    skills: [],
    projects: [],
    extracurriculars: [],
    careerGoals: '',
    preferredLearningTime: '',
    budget: 0,
    location: '',
    languages: [],
    socialLinks: {}
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/profile/${localStorage.getItem('userId')}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const userData = response.data;
        setProfile(userData);
        setName(userData.name || '');
        setProfilePicturePreview(userData.profilePicture || '');

        if (userData.profile) {
          if (userRole === 'teacher') {
            setTeacherData({
              ...teacherData,
              ...userData.profile
            });
          } else {
            setStudentData({
              ...studentData,
              ...userData.profile
            });
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        setError('Failed to load profile data');
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        setError(validation.error || 'Invalid file');
        return;
      }

      try {
        setProfilePicture(file);
        const resizedImage = await resizeImage(file, 400, 400);
        setProfilePicturePreview(resizedImage);
      } catch (err) {
        setError('Failed to process image');
      }
    }
  };

  const addToArray = (array: string[], setter: (arr: string[]) => void, value: string) => {
    if (value.trim() && !array.includes(value.trim())) {
      setter([...array, value.trim()]);
    }
  };

  const removeFromArray = (array: string[], setter: (arr: string[]) => void, index: number) => {
    setter(array.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Upload profile picture if changed
      if (profilePicture) {
        const formData = new FormData();
        formData.append('profilePicture', profilePicture);
        
        await axios.post(`${import.meta.env.VITE_API_URL}/profile/upload-picture`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      // Update profile data
      const profileUpdateData = {
        name,
        ...(userRole === 'teacher' ? teacherData : studentData)
      };
      
      await axios.put(`${import.meta.env.VITE_API_URL}/profile`, profileUpdateData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('Profile updated successfully!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-orange-primary hover:text-orange-secondary font-semibold"
              >
                ← Back to Dashboard
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <button
                onClick={() => navigate('/dashboard')}
                className="text-orange-primary hover:text-orange-secondary font-semibold"
              >
                View Profile
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {name}</span>
              <button
                onClick={() => {
                  localStorage.clear();
                  navigate('/login');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-2xl"
      >
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-orange-primary mb-2">Edit Profile</h2>
          <p className="text-gray-600">Update your profile information</p>
        </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
          {success}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Basic Information Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Basic Information</h3>
          
          {/* Profile Picture */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200">
                {profilePicturePreview ? (
                  <img 
                    src={profilePicturePreview} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-orange-primary flex items-center justify-center text-white font-bold text-2xl">
                    {name.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  className="hidden"
                  id="profile-picture"
                />
                <label
                  htmlFor="profile-picture"
                  className="bg-orange-primary text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-orange-secondary transition duration-300"
                >
                  Change Picture
                </label>
              </div>
            </div>
          </div>

          {/* Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
              required
            />
          </div>


        </div>

        {/* Role-specific sections */}
        {userRole === 'teacher' ? (
          <TeacherEditSection 
            data={teacherData} 
            setData={setTeacherData}
            addToArray={addToArray}
            removeFromArray={removeFromArray}
          />
        ) : (
          <StudentEditSection 
            data={studentData} 
            setData={setStudentData}
            addToArray={addToArray}
            removeFromArray={removeFromArray}
          />
        )}

        {/* Save Button */}
        <div className="flex justify-end pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="mr-4 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition duration-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className={`px-8 py-3 rounded-lg font-semibold transition duration-300 ${
              saving
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-orange-primary text-white hover:bg-orange-secondary'
            }`}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
      </motion.div>
    </div>
  );
};

// Teacher Edit Section Component
const TeacherEditSection: React.FC<{
  data: Partial<TeacherProfile>;
  setData: (data: Partial<TeacherProfile>) => void;
  addToArray: (array: string[], setter: (arr: string[]) => void, value: string) => void;
  removeFromArray: (array: string[], setter: (arr: string[]) => void, index: number) => void;
}> = ({ data, setData, addToArray, removeFromArray }) => {
  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Teaching Information</h3>
        
        {/* Subjects */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Subjects</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {data.subjects?.map((subject, index) => (
              <span key={index} className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm flex items-center">
                {subject}
                <button
                  type="button"
                  onClick={() => removeFromArray(data.subjects!, (arr) => setData({...data, subjects: arr}), index)}
                  className="ml-2 text-orange-600 hover:text-orange-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex">
            <input
              type="text"
              placeholder="Add subject"
              className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addToArray(data.subjects || [], (arr) => setData({...data, subjects: arr}), e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
            />
            <button
              type="button"
              onClick={(e) => {
                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                addToArray(data.subjects || [], (arr) => setData({...data, subjects: arr}), input.value);
                input.value = '';
              }}
              className="bg-orange-primary text-white px-4 rounded-r-lg hover:bg-orange-secondary"
            >
              Add
            </button>
          </div>
        </div>

        {/* Qualifications */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Qualifications</label>
          <input
            type="text"
            value={data.qualifications || ''}
            onChange={(e) => setData({...data, qualifications: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
          />
        </div>

        {/* Experience */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
          <input
            type="number"
            value={data.experience || 0}
            onChange={(e) => setData({...data, experience: parseInt(e.target.value) || 0})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
          />
        </div>

        {/* Hourly Rate */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Hourly Rate (USD)</label>
          <input
            type="number"
            value={data.hourlyRate || 0}
            onChange={(e) => setData({...data, hourlyRate: parseFloat(e.target.value) || 0})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
          />
        </div>

        {/* Education */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Education Background</label>
          <textarea
            value={data.education || ''}
            onChange={(e) => setData({...data, education: e.target.value})}
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
          />
        </div>

        {/* Teaching Philosophy */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Teaching Philosophy</label>
          <textarea
            value={data.teachingPhilosophy || ''}
            onChange={(e) => setData({...data, teachingPhilosophy: e.target.value})}
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
          />
        </div>
      </div>

      {/* Specializations & Methods */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Teaching Details</h3>
        
        {/* Specializations */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Specializations</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {data.specializations?.map((spec, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
                {spec}
                <button
                  type="button"
                  onClick={() => removeFromArray(data.specializations!, (arr) => setData({...data, specializations: arr}), index)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex">
            <input
              type="text"
              placeholder="Add specialization"
              className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addToArray(data.specializations || [], (arr) => setData({...data, specializations: arr}), e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
            />
            <button
              type="button"
              onClick={(e) => {
                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                addToArray(data.specializations || [], (arr) => setData({...data, specializations: arr}), input.value);
                input.value = '';
              }}
              className="bg-orange-primary text-white px-4 rounded-r-lg hover:bg-orange-secondary"
            >
              Add
            </button>
          </div>
        </div>

        {/* Teaching Methods */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Teaching Methods</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {data.teachingMethods?.map((method, index) => (
              <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center">
                {method}
                <button
                  type="button"
                  onClick={() => removeFromArray(data.teachingMethods!, (arr) => setData({...data, teachingMethods: arr}), index)}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex">
            <input
              type="text"
              placeholder="Add teaching method"
              className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addToArray(data.teachingMethods || [], (arr) => setData({...data, teachingMethods: arr}), e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
            />
            <button
              type="button"
              onClick={(e) => {
                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                addToArray(data.teachingMethods || [], (arr) => setData({...data, teachingMethods: arr}), input.value);
                input.value = '';
              }}
              className="bg-orange-primary text-white px-4 rounded-r-lg hover:bg-orange-secondary"
            >
              Add
            </button>
          </div>
        </div>

        {/* Preferred Student Level */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Student Level</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {data.preferredStudentLevel?.map((level, index) => (
              <span key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center">
                {level}
                <button
                  type="button"
                  onClick={() => removeFromArray(data.preferredStudentLevel!, (arr) => setData({...data, preferredStudentLevel: arr}), index)}
                  className="ml-2 text-purple-600 hover:text-purple-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex">
            <input
              type="text"
              placeholder="Add student level (e.g., Beginner, Intermediate)"
              className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addToArray(data.preferredStudentLevel || [], (arr) => setData({...data, preferredStudentLevel: arr}), e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
            />
            <button
              type="button"
              onClick={(e) => {
                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                addToArray(data.preferredStudentLevel || [], (arr) => setData({...data, preferredStudentLevel: arr}), input.value);
                input.value = '';
              }}
              className="bg-orange-primary text-white px-4 rounded-r-lg hover:bg-orange-secondary"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Professional Details */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Professional Details</h3>
        
        {/* Availability */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
          <textarea
            value={data.availability || ''}
            onChange={(e) => setData({...data, availability: e.target.value})}
            rows={2}
            placeholder="e.g., Weekdays 9 AM - 5 PM, Weekends flexible"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
          />
        </div>

        {/* Location */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
          <input
            type="text"
            value={data.location || ''}
            onChange={(e) => setData({...data, location: e.target.value})}
            placeholder="e.g., New York, NY or Online"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
          />
        </div>

        {/* Languages */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Languages</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {data.languages?.map((language, index) => (
              <span key={index} className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm flex items-center">
                {language}
                <button
                  type="button"
                  onClick={() => removeFromArray(data.languages!, (arr) => setData({...data, languages: arr}), index)}
                  className="ml-2 text-indigo-600 hover:text-indigo-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex">
            <input
              type="text"
              placeholder="Add language"
              className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addToArray(data.languages || [], (arr) => setData({...data, languages: arr}), e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
            />
            <button
              type="button"
              onClick={(e) => {
                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                addToArray(data.languages || [], (arr) => setData({...data, languages: arr}), input.value);
                input.value = '';
              }}
              className="bg-orange-primary text-white px-4 rounded-r-lg hover:bg-orange-secondary"
            >
              Add
            </button>
          </div>
        </div>

        {/* Contact Preference */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Contact Preference</label>
          <select
            value={data.contactPreference || ''}
            onChange={(e) => setData({...data, contactPreference: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
          >
            <option value="">Select preference</option>
            <option value="Email">Email</option>
            <option value="Phone">Phone</option>
            <option value="Platform Messages">Platform Messages</option>
            <option value="Video Call">Video Call</option>
          </select>
        </div>
      </div>

      {/* Achievements & Certifications */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Achievements & Awards</h3>
        
        {/* Certifications */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Certifications</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {data.certifications?.map((cert, index) => (
              <span key={index} className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm flex items-center">
                {cert}
                <button
                  type="button"
                  onClick={() => removeFromArray(data.certifications!, (arr) => setData({...data, certifications: arr}), index)}
                  className="ml-2 text-yellow-600 hover:text-yellow-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex">
            <input
              type="text"
              placeholder="Add certification"
              className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addToArray(data.certifications || [], (arr) => setData({...data, certifications: arr}), e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
            />
            <button
              type="button"
              onClick={(e) => {
                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                addToArray(data.certifications || [], (arr) => setData({...data, certifications: arr}), input.value);
                input.value = '';
              }}
              className="bg-orange-primary text-white px-4 rounded-r-lg hover:bg-orange-secondary"
            >
              Add
            </button>
          </div>
        </div>

        {/* Achievements */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Achievements</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {data.achievements?.map((achievement, index) => (
              <span key={index} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm flex items-center">
                {achievement}
                <button
                  type="button"
                  onClick={() => removeFromArray(data.achievements!, (arr) => setData({...data, achievements: arr}), index)}
                  className="ml-2 text-red-600 hover:text-red-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex">
            <input
              type="text"
              placeholder="Add achievement"
              className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addToArray(data.achievements || [], (arr) => setData({...data, achievements: arr}), e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
            />
            <button
              type="button"
              onClick={(e) => {
                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                addToArray(data.achievements || [], (arr) => setData({...data, achievements: arr}), input.value);
                input.value = '';
              }}
              className="bg-orange-primary text-white px-4 rounded-r-lg hover:bg-orange-secondary"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Social Links</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
            <input
              type="url"
              value={data.socialLinks?.linkedin || ''}
              onChange={(e) => setData({...data, socialLinks: {...(data.socialLinks || {}), linkedin: e.target.value}})}
              placeholder="https://linkedin.com/in/yourprofile"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
            <input
              type="url"
              value={data.socialLinks?.website || ''}
              onChange={(e) => setData({...data, socialLinks: {...(data.socialLinks || {}), website: e.target.value}})}
              placeholder="https://yourwebsite.com"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Twitter</label>
            <input
              type="url"
              value={data.socialLinks?.twitter || ''}
              onChange={(e) => setData({...data, socialLinks: {...(data.socialLinks || {}), twitter: e.target.value}})}
              placeholder="https://twitter.com/yourhandle"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Student Edit Section Component
const StudentEditSection: React.FC<{
  data: Partial<StudentProfile>;
  setData: (data: Partial<StudentProfile>) => void;
  addToArray: (array: string[], setter: (arr: string[]) => void, value: string) => void;
  removeFromArray: (array: string[], setter: (arr: string[]) => void, index: number) => void;
}> = ({ data, setData, addToArray, removeFromArray }) => {
  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Academic Information</h3>
        
        {/* Interests */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Interests</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {data.interests?.map((interest, index) => (
              <span key={index} className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm flex items-center">
                {interest}
                <button
                  type="button"
                  onClick={() => removeFromArray(data.interests!, (arr) => setData({...data, interests: arr}), index)}
                  className="ml-2 text-orange-600 hover:text-orange-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex">
            <input
              type="text"
              placeholder="Add interest"
              className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addToArray(data.interests || [], (arr) => setData({...data, interests: arr}), e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
            />
            <button
              type="button"
              onClick={(e) => {
                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                addToArray(data.interests || [], (arr) => setData({...data, interests: arr}), input.value);
                input.value = '';
              }}
              className="bg-orange-primary text-white px-4 rounded-r-lg hover:bg-orange-secondary"
            >
              Add
            </button>
          </div>
        </div>

        {/* Academic Level */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Academic Level</label>
          <select
            value={data.academicLevel || ''}
            onChange={(e) => setData({...data, academicLevel: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
          >
            <option value="">Select level</option>
            <option value="Elementary School">Elementary School</option>
            <option value="Middle School">Middle School</option>
            <option value="High School">High School</option>
            <option value="College/University">College/University</option>
            <option value="Graduate School">Graduate School</option>
            <option value="Professional Development">Professional Development</option>
          </select>
        </div>

        {/* Current Institution */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Current Institution</label>
          <input
            type="text"
            value={data.currentInstitution || ''}
            onChange={(e) => setData({...data, currentInstitution: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
          />
        </div>

        {/* Goals */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Learning Goals</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {data.goals?.map((goal, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
                {goal}
                <button
                  type="button"
                  onClick={() => removeFromArray(data.goals!, (arr) => setData({...data, goals: arr}), index)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex">
            <input
              type="text"
              placeholder="Add learning goal"
              className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addToArray(data.goals || [], (arr) => setData({...data, goals: arr}), e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
            />
            <button
              type="button"
              onClick={(e) => {
                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                addToArray(data.goals || [], (arr) => setData({...data, goals: arr}), input.value);
                input.value = '';
              }}
              className="bg-orange-primary text-white px-4 rounded-r-lg hover:bg-orange-secondary"
            >
              Add
            </button>
          </div>
        </div>

        {/* Learning Style */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Learning Style</label>
          <select
            value={data.learningStyle || ''}
            onChange={(e) => setData({...data, learningStyle: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
          >
            <option value="">Select learning style</option>
            <option value="Visual">Visual</option>
            <option value="Auditory">Auditory</option>
            <option value="Kinesthetic">Kinesthetic</option>
            <option value="Reading/Writing">Reading/Writing</option>
            <option value="Mixed">Mixed</option>
          </select>
        </div>

        {/* Preferred Subjects */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Subjects</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {data.preferredSubjects?.map((subject, index) => (
              <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center">
                {subject}
                <button
                  type="button"
                  onClick={() => removeFromArray(data.preferredSubjects!, (arr) => setData({...data, preferredSubjects: arr}), index)}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex">
            <input
              type="text"
              placeholder="Add preferred subject"
              className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addToArray(data.preferredSubjects || [], (arr) => setData({...data, preferredSubjects: arr}), e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
            />
            <button
              type="button"
              onClick={(e) => {
                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                addToArray(data.preferredSubjects || [], (arr) => setData({...data, preferredSubjects: arr}), input.value);
                input.value = '';
              }}
              className="bg-orange-primary text-white px-4 rounded-r-lg hover:bg-orange-secondary"
            >
              Add
            </button>
          </div>
        </div>

        {/* Graduation Year */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Graduation Year</label>
          <input
            type="number"
            value={data.graduationYear || ''}
            onChange={(e) => setData({...data, graduationYear: parseInt(e.target.value) || 0})}
            placeholder="e.g., 2025"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
          />
        </div>

        {/* Career Goals */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Career Goals</label>
          <textarea
            value={data.careerGoals || ''}
            onChange={(e) => setData({...data, careerGoals: e.target.value})}
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
          />
        </div>
      </div>

      {/* Skills & Projects */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Skills & Projects</h3>
        
        {/* Skills */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {data.skills?.map((skill, index) => (
              <span key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center">
                {skill}
                <button
                  type="button"
                  onClick={() => removeFromArray(data.skills!, (arr) => setData({...data, skills: arr}), index)}
                  className="ml-2 text-purple-600 hover:text-purple-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex">
            <input
              type="text"
              placeholder="Add skill"
              className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addToArray(data.skills || [], (arr) => setData({...data, skills: arr}), e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
            />
            <button
              type="button"
              onClick={(e) => {
                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                addToArray(data.skills || [], (arr) => setData({...data, skills: arr}), input.value);
                input.value = '';
              }}
              className="bg-orange-primary text-white px-4 rounded-r-lg hover:bg-orange-secondary"
            >
              Add
            </button>
          </div>
        </div>

        {/* Projects */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Projects</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {data.projects?.map((project, index) => (
              <span key={index} className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm flex items-center">
                {project}
                <button
                  type="button"
                  onClick={() => removeFromArray(data.projects!, (arr) => setData({...data, projects: arr}), index)}
                  className="ml-2 text-indigo-600 hover:text-indigo-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex">
            <input
              type="text"
              placeholder="Add project"
              className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addToArray(data.projects || [], (arr) => setData({...data, projects: arr}), e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
            />
            <button
              type="button"
              onClick={(e) => {
                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                addToArray(data.projects || [], (arr) => setData({...data, projects: arr}), input.value);
                input.value = '';
              }}
              className="bg-orange-primary text-white px-4 rounded-r-lg hover:bg-orange-secondary"
            >
              Add
            </button>
          </div>
        </div>

        {/* Extracurriculars */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Extracurricular Activities</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {data.extracurriculars?.map((activity, index) => (
              <span key={index} className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm flex items-center">
                {activity}
                <button
                  type="button"
                  onClick={() => removeFromArray(data.extracurriculars!, (arr) => setData({...data, extracurriculars: arr}), index)}
                  className="ml-2 text-yellow-600 hover:text-yellow-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex">
            <input
              type="text"
              placeholder="Add extracurricular activity"
              className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addToArray(data.extracurriculars || [], (arr) => setData({...data, extracurriculars: arr}), e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
            />
            <button
              type="button"
              onClick={(e) => {
                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                addToArray(data.extracurriculars || [], (arr) => setData({...data, extracurriculars: arr}), input.value);
                input.value = '';
              }}
              className="bg-orange-primary text-white px-4 rounded-r-lg hover:bg-orange-secondary"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Learning Preferences */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Learning Preferences</h3>
        
        {/* Preferred Learning Time */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Learning Time</label>
          <select
            value={data.preferredLearningTime || ''}
            onChange={(e) => setData({...data, preferredLearningTime: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
          >
            <option value="">Select preferred time</option>
            <option value="Morning">Morning</option>
            <option value="Afternoon">Afternoon</option>
            <option value="Evening">Evening</option>
            <option value="Weekends">Weekends</option>
            <option value="Flexible">Flexible</option>
          </select>
        </div>

        {/* Budget */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Budget (USD per hour)</label>
          <input
            type="number"
            value={data.budget || ''}
            onChange={(e) => setData({...data, budget: parseFloat(e.target.value) || 0})}
            placeholder="e.g., 25"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
          />
        </div>

        {/* Location */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
          <input
            type="text"
            value={data.location || ''}
            onChange={(e) => setData({...data, location: e.target.value})}
            placeholder="e.g., New York, NY or Online"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
          />
        </div>

        {/* Languages */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Languages</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {data.languages?.map((language, index) => (
              <span key={index} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm flex items-center">
                {language}
                <button
                  type="button"
                  onClick={() => removeFromArray(data.languages!, (arr) => setData({...data, languages: arr}), index)}
                  className="ml-2 text-red-600 hover:text-red-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex">
            <input
              type="text"
              placeholder="Add language"
              className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addToArray(data.languages || [], (arr) => setData({...data, languages: arr}), e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
            />
            <button
              type="button"
              onClick={(e) => {
                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                addToArray(data.languages || [], (arr) => setData({...data, languages: arr}), input.value);
                input.value = '';
              }}
              className="bg-orange-primary text-white px-4 rounded-r-lg hover:bg-orange-secondary"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Social Links</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">GitHub</label>
            <input
              type="url"
              value={data.socialLinks?.github || ''}
              onChange={(e) => setData({...data, socialLinks: {...(data.socialLinks || {}), github: e.target.value}})}
              placeholder="https://github.com/yourusername"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
            <input
              type="url"
              value={data.socialLinks?.linkedin || ''}
              onChange={(e) => setData({...data, socialLinks: {...(data.socialLinks || {}), linkedin: e.target.value}})}
              placeholder="https://linkedin.com/in/yourprofile"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Portfolio</label>
            <input
              type="url"
              value={data.socialLinks?.portfolio || ''}
              onChange={(e) => setData({...data, socialLinks: {...(data.socialLinks || {}), portfolio: e.target.value}})}
              placeholder="https://yourportfolio.com"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditPage;