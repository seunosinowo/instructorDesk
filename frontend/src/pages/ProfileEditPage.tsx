import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { 
  User as UserIcon, BookOpen, GraduationCap, 
  Award, Target, Star, Briefcase, 
  Layout, Bookmark, Globe, CheckCircle, 
  Users, Languages, Save, X, Plus,
  ChevronLeft, Edit
} from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faNairaSign } from '@fortawesome/free-solid-svg-icons';
import type { TeacherProfile, StudentProfile } from '../types';

const ProfileEditPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('role') || 'student';

  // Basic user info
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string>('');

  // Teacher-specific states
  const [subjects, setSubjects] = useState<string[]>([]);
  const [qualifications, setQualifications] = useState('');
  const [experience, setExperience] = useState<number>(0);
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [teachingMethods, setTeachingMethods] = useState<string[]>([]);
  const [availability, setAvailability] = useState('');
  const [hourlyRate, setHourlyRate] = useState<number>(0);
  const [location, setLocation] = useState('');
  const [languages, setLanguages] = useState<string[]>([]);
  const [certifications, setCertifications] = useState<string[]>([]);
  const [education, setEducation] = useState('');
  const [achievements, setAchievements] = useState<string[]>([]);
  const [teachingPhilosophy, setTeachingPhilosophy] = useState('');
  const [preferredStudentLevel, setPreferredStudentLevel] = useState<string[]>([]);
  const [contactPreference, setContactPreference] = useState('');
  const [socialLinks, setSocialLinks] = useState<{
    linkedin?: string;
    website?: string;
    twitter?: string;
  }>({});

  // Student-specific states
  const [interests, setInterests] = useState<string[]>([]);
  const [academicLevel, setAcademicLevel] = useState('');
  const [currentInstitution, setCurrentInstitution] = useState('');
  const [graduationYear, setGraduationYear] = useState<number>(0);
  const [goals, setGoals] = useState<string[]>([]);
  const [learningStyle, setLearningStyle] = useState('');
  const [preferredSubjects, setPreferredSubjects] = useState<string[]>([]);
  const [careerGoals, setCareerGoals] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [projects, setProjects] = useState<string[]>([]);
  const [extracurriculars, setExtracurriculars] = useState<string[]>([]);
  const [preferredLearningTime, setPreferredLearningTime] = useState('');
  const [budget, setBudget] = useState<number>(0);
  const [studentSocialLinks, setStudentSocialLinks] = useState<{
    github?: string;
    linkedin?: string;
    portfolio?: string;
  }>({});

  // School-specific states
  const [schoolName, setSchoolName] = useState('');
  const [schoolAddress, setSchoolAddress] = useState('');
  const [schoolCity, setSchoolCity] = useState('');
  const [schoolState, setSchoolState] = useState('');
  const [schoolCountry, setSchoolCountry] = useState('');
  const [schoolPhoneNumber, setSchoolPhoneNumber] = useState('');
  const [schoolWebsite, setSchoolWebsite] = useState('');
  const [schoolType, setSchoolType] = useState('');
  const [gradeLevels, setGradeLevels] = useState<string[]>([]);
  const [accreditation, setAccreditation] = useState('');
  const [studentCount, setStudentCount] = useState<number>(0);
  const [teacherCount, setTeacherCount] = useState<number>(0);
  const [establishedYear, setEstablishedYear] = useState<number>(0);
  const [schoolDescription, setSchoolDescription] = useState('');
  const [facilities, setFacilities] = useState<string[]>([]);
  const [extracurricularActivities, setExtracurricularActivities] = useState<string[]>([]);
  const [schoolSocialLinks, setSchoolSocialLinks] = useState<{
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  }>({});

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token || !userId) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/profile/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const userData = response.data;
        console.log('Fetched profile data:', userData);
        
        // Set basic user info
        setName(userData.name || '');
        setEmail(userData.email || '');
        setBio(userData.bio || '');
        setProfilePicturePreview(userData.profilePicture || '');
        
        if (userData.profile) {
          if (userRole === 'teacher') {
            const profile = userData.profile as TeacherProfile;
            setSubjects(profile.subjects || []);
            setQualifications(profile.qualifications || '');
            setExperience(profile.experience || 0);
            setSpecializations(profile.specializations || []);
            setTeachingMethods(profile.teachingMethods || []);
            setAvailability(profile.availability || '');
            setHourlyRate(profile.hourlyRate || 0);
            setLocation(profile.location || '');
            setLanguages(profile.languages || []);
            setCertifications(profile.certifications || []);
            setEducation(profile.education || '');
            setAchievements(profile.achievements || []);
            setTeachingPhilosophy(profile.teachingPhilosophy || '');
            setPreferredStudentLevel(profile.preferredStudentLevel || []);
            setContactPreference(profile.contactPreference || '');
            setSocialLinks(profile.socialLinks || {});
          } else if (userRole === 'student') {
            const profile = userData.profile as StudentProfile;
            setInterests(profile.interests || []);
            setAcademicLevel(profile.academicLevel || '');
            setCurrentInstitution(profile.currentInstitution || '');
            setGraduationYear(profile.graduationYear || 0);
            setGoals(profile.goals || []);
            setLearningStyle(profile.learningStyle || '');
            setPreferredSubjects(profile.preferredSubjects || []);
            setCareerGoals(profile.careerGoals || '');
            setSkills(profile.skills || []);
            setProjects(profile.projects || []);
            setExtracurriculars(profile.extracurriculars || []);
            setPreferredLearningTime(profile.preferredLearningTime || '');
            setBudget(profile.budget || 0);
            setLocation(profile.location || '');
            setLanguages(profile.languages || []);
            setStudentSocialLinks(profile.socialLinks || {});
          } else if (userRole === 'school') {
            const profile = userData.profile;
            setSchoolName(profile.schoolName || '');
            setSchoolAddress(profile.address || '');
            setSchoolCity(profile.city || '');
            setSchoolState(profile.state || '');
            setSchoolCountry(profile.country || '');
            setSchoolPhoneNumber(profile.phoneNumber || '');
            setSchoolWebsite(profile.website || '');
            setSchoolType(profile.schoolType || '');
            setGradeLevels(profile.gradeLevels || []);
            setAccreditation(profile.accreditations || '');
            setStudentCount(profile.studentCount || 0);
            setTeacherCount(profile.teacherCount || 0);
            setEstablishedYear(profile.establishedYear || 0);
            setSchoolDescription(profile.description || '');
            setFacilities(profile.facilities || []);
            setExtracurricularActivities(profile.extracurricularActivities || []);
            setSchoolSocialLinks(profile.socialLinks || {});
          }
        }
      } catch (err) {
        console.error('Profile fetch error:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token, userId, userRole, navigate]);

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Basic validation
      const maxSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

      if (!allowedTypes.includes(file.type)) {
        setError('Please select a valid image file (JPEG, PNG, or GIF)');
        return;
      }

      if (file.size > maxSize) {
        setError('Image size should be less than 5MB');
        return;
      }

      setProfilePicture(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicturePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
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
    console.log('handleSave called');
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // First, upload profile picture if a new one was selected
      if (profilePicture) {
        const formData = new FormData();
        formData.append('profilePicture', profilePicture);
        
        await axios.post(`${import.meta.env.VITE_API_URL}/profile/upload-picture`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
        });
      }
      
      // Prepare profile data based on role
      let profileData = {};
      console.log('User role:', userRole);
      
      if (userRole === 'teacher') {
        profileData = {
          subjects,
          qualifications,
          experience: Number(experience),
          specializations,
          teachingMethods,
          availability,
          hourlyRate: Number(hourlyRate),
          location,
          languages,
          certifications,
          education,
          achievements,
          teachingPhilosophy,
          preferredStudentLevel,
          contactPreference,
          socialLinks
        };
        console.log('Teacher profile data:', {
          hourlyRate: hourlyRate,
          hourlyRateType: typeof hourlyRate,
          hourlyRateNumber: Number(hourlyRate),
          experience: experience,
          experienceType: typeof experience,
          experienceNumber: Number(experience)
        });
      } else if (userRole === 'student') {
        profileData = {
          interests,
          academicLevel,
          currentInstitution,
          graduationYear: Number(graduationYear),
          goals,
          learningStyle,
          preferredSubjects,
          careerGoals,
          skills,
          projects,
          extracurriculars,
          preferredLearningTime,
          budget: Number(budget),
          location,
          languages,
          socialLinks: studentSocialLinks
        };
        console.log('Student profile data:', {
          budget: budget,
          budgetType: typeof budget,
          budgetNumber: Number(budget),
          graduationYear: graduationYear,
          graduationYearType: typeof graduationYear,
          graduationYearNumber: Number(graduationYear)
        });
      } else if (userRole === 'school') {
        profileData = {
          schoolName,
          address: schoolAddress,
          city: schoolCity,
          state: schoolState,
          country: schoolCountry,
          phoneNumber: schoolPhoneNumber,
          website: schoolWebsite,
          schoolType,
          gradeLevels,
          accreditations: accreditation,
          studentCount: Number(studentCount),
          teacherCount: Number(teacherCount),
          establishedYear: Number(establishedYear),
          description: schoolDescription,
          facilities,
          extracurricularActivities,
          socialLinks: schoolSocialLinks
        };
        console.log('School profile data:', profileData);
      }

      // Update profile data
      const updateData = {
        name,
        bio,
        ...profileData
      };
      
      console.log('Profile data to save:', updateData);
      console.log('API URL:', `${import.meta.env.VITE_API_URL}/profile`);
      console.log('Token:', token ? 'Present' : 'Missing');
      
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/profile`, updateData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log('Update response:', response.data);
      
      // Dispatch custom event to notify profile page of update
      window.dispatchEvent(new CustomEvent('profileUpdated'));
      
      setSuccess('Profile updated successfully!');

      // Force a page reload to ensure fresh data
      setTimeout(() => {
        if (userRole === 'school') {
          window.location.href = `/schools/by-user/${userId}`;
        } else {
          window.location.href = '/profile';
        }
      }, 1500);

      // Dispatch custom event to notify profile page of update
      window.dispatchEvent(new CustomEvent('profileUpdated'));
    } catch (err: any) {
      console.error('Save error:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Sticky Navigation Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <button
              onClick={() => navigate(userRole === 'school' ? `/schools/${userId}` : '/profile')}
              className="flex items-center text-gray-600 hover:text-orange-600 transition-colors group"
            >
              <ChevronLeft size={20} className="mr-1 group-hover:-translate-x-0.5 transition-transform" />
              Back
            </button>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              Edit Profile
            </h1>
            <button
              type="submit"
              form="profile-edit-form"
              disabled={saving}
              className={`px-4 py-2 rounded-lg font-semibold transition duration-300 flex items-center ${
                saving
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600'
              }`}
            >
              <Save size={18} className="mr-2" />
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto px-4 py-8"
      >
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 shadow-sm"
          >
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 shadow-sm"
          >
            {success}
          </motion.div>
        )}

        <form 
          id="profile-edit-form"
          onSubmit={handleSave} 
          className="space-y-8"
        >
          {/* Basic Information Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-md p-6 border border-orange-100"
          >
            <div className="flex items-center mb-6">
              <div className="bg-orange-100 p-2 rounded-full mr-3">
                <UserIcon className="text-orange-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Basic Information</h3>
            </div>
            
            {/* Profile Picture */}
            <div className="mb-6 flex flex-col items-center">
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg mb-4">
                {profilePicturePreview ? (
                  <img 
                    src={profilePicturePreview} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-orange-400 to-amber-400 flex items-center justify-center text-white font-bold text-3xl">
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
                  className="inline-flex items-center bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:from-orange-600 hover:to-amber-600 transition-all shadow-md"
                >
                  <Edit size={16} className="mr-2" />
                  Change Picture
                </label>
                <p className="text-xs text-gray-500 mt-2 text-center">Max 5MB (JPEG, PNG, GIF)</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed focus:outline-none"
                  readOnly
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed as it's used for sign-in</p>
              </div>
            </div>
            
            <div className="mt-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300"
                rows={3}
                placeholder="Tell us about yourself..."
              />
            </div>
          </motion.div>

          {/* Role-specific sections */}
          {userRole === 'teacher' ? (
            <TeacherEditSection 
              subjects={subjects}
              setSubjects={setSubjects}
              qualifications={qualifications}
              setQualifications={setQualifications}
              experience={experience}
              setExperience={setExperience}
              specializations={specializations}
              setSpecializations={setSpecializations}
              teachingMethods={teachingMethods}
              setTeachingMethods={setTeachingMethods}
              availability={availability}
              setAvailability={setAvailability}
              hourlyRate={hourlyRate}
              setHourlyRate={setHourlyRate}
              location={location}
              setLocation={setLocation}
              languages={languages}
              setLanguages={setLanguages}
              certifications={certifications}
              setCertifications={setCertifications}
              education={education}
              setEducation={setEducation}
              achievements={achievements}
              setAchievements={setAchievements}
              teachingPhilosophy={teachingPhilosophy}
              setTeachingPhilosophy={setTeachingPhilosophy}
              preferredStudentLevel={preferredStudentLevel}
              setPreferredStudentLevel={setPreferredStudentLevel}
              contactPreference={contactPreference}
              setContactPreference={setContactPreference}
              socialLinks={socialLinks}
              setSocialLinks={setSocialLinks}
              addToArray={addToArray}
              removeFromArray={removeFromArray}
            />
          ) : userRole === 'student' ? (
            <StudentEditSection
              interests={interests}
              setInterests={setInterests}
              academicLevel={academicLevel}
              setAcademicLevel={setAcademicLevel}
              currentInstitution={currentInstitution}
              setCurrentInstitution={setCurrentInstitution}
              graduationYear={graduationYear}
              setGraduationYear={setGraduationYear}
              goals={goals}
              setGoals={setGoals}
              learningStyle={learningStyle}
              setLearningStyle={setLearningStyle}
              preferredSubjects={preferredSubjects}
              setPreferredSubjects={setPreferredSubjects}
              careerGoals={careerGoals}
              setCareerGoals={setCareerGoals}
              skills={skills}
              setSkills={setSkills}
              projects={projects}
              setProjects={setProjects}
              extracurriculars={extracurriculars}
              setExtracurriculars={setExtracurriculars}
              preferredLearningTime={preferredLearningTime}
              setPreferredLearningTime={setPreferredLearningTime}
              budget={budget}
              setBudget={setBudget}
              location={location}
              setLocation={setLocation}
              languages={languages}
              setLanguages={setLanguages}
              socialLinks={studentSocialLinks}
              setSocialLinks={setStudentSocialLinks}
              addToArray={addToArray}
              removeFromArray={removeFromArray}
            />
          ) : userRole === 'school' ? (
            <SchoolEditSection
              schoolName={schoolName}
              setSchoolName={setSchoolName}
              schoolAddress={schoolAddress}
              setSchoolAddress={setSchoolAddress}
              schoolCity={schoolCity}
              setSchoolCity={setSchoolCity}
              schoolState={schoolState}
              setSchoolState={setSchoolState}
              schoolCountry={schoolCountry}
              setSchoolCountry={setSchoolCountry}
              schoolPhoneNumber={schoolPhoneNumber}
              setSchoolPhoneNumber={setSchoolPhoneNumber}
              schoolWebsite={schoolWebsite}
              setSchoolWebsite={setSchoolWebsite}
              schoolType={schoolType}
              setSchoolType={setSchoolType}
              gradeLevels={gradeLevels}
              setGradeLevels={setGradeLevels}
              accreditation={accreditation}
              setAccreditation={setAccreditation}
              studentCount={studentCount}
              setStudentCount={setStudentCount}
              teacherCount={teacherCount}
              setTeacherCount={setTeacherCount}
              establishedYear={establishedYear}
              setEstablishedYear={setEstablishedYear}
              schoolDescription={schoolDescription}
              setSchoolDescription={setSchoolDescription}
              facilities={facilities}
              setFacilities={setFacilities}
              extracurricularActivities={extracurricularActivities}
              setExtracurricularActivities={setExtracurricularActivities}
              socialLinks={schoolSocialLinks}
              setSocialLinks={setSchoolSocialLinks}
              addToArray={addToArray}
              removeFromArray={removeFromArray}
            />
          ) : (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p>User role not recognized: {userRole}</p>
              <p>Please make sure you're logged in properly.</p>
            </div>
          )}

          {/* Save Button */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-md p-6 border border-orange-100"
          >
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => navigate(userRole === 'school' ? `/schools/${userId}` : '/profile')}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition duration-300 flex items-center"
              >
                <ChevronLeft size={18} className="mr-2" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className={`px-8 py-3 rounded-xl font-semibold transition duration-300 flex items-center ${
                  saving
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 shadow-md'
                }`}
              >
                <Save size={18} className="mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
};

// Teacher Edit Section Component
const TeacherEditSection: React.FC<{
  subjects: string[];
  setSubjects: (subjects: string[]) => void;
  qualifications: string;
  setQualifications: (qualifications: string) => void;
  experience: number;
  setExperience: (experience: number) => void;
  specializations: string[];
  setSpecializations: (specializations: string[]) => void;
  teachingMethods: string[];
  setTeachingMethods: (methods: string[]) => void;
  availability: string;
  setAvailability: (availability: string) => void;
  hourlyRate: number;
  setHourlyRate: (rate: number) => void;
  location: string;
  setLocation: (location: string) => void;
  languages: string[];
  setLanguages: (languages: string[]) => void;
  certifications: string[];
  setCertifications: (certifications: string[]) => void;
  education: string;
  setEducation: (education: string) => void;
  achievements: string[];
  setAchievements: (achievements: string[]) => void;
  teachingPhilosophy: string;
  setTeachingPhilosophy: (philosophy: string) => void;
  preferredStudentLevel: string[];
  setPreferredStudentLevel: (levels: string[]) => void;
  contactPreference: string;
  setContactPreference: (preference: string) => void;
  socialLinks: { linkedin?: string; website?: string; twitter?: string };
  setSocialLinks: (links: { linkedin?: string; website?: string; twitter?: string }) => void;
  addToArray: (array: string[], setter: (arr: string[]) => void, value: string) => void;
  removeFromArray: (array: string[], setter: (arr: string[]) => void, index: number) => void;
}> = ({ 
  subjects, setSubjects, qualifications, setQualifications, experience, setExperience,
  specializations, setSpecializations, teachingMethods, setTeachingMethods,
  availability, setAvailability, hourlyRate, setHourlyRate, location, setLocation,
  languages, setLanguages, certifications, setCertifications, education, setEducation,
  achievements, setAchievements, teachingPhilosophy, setTeachingPhilosophy,
  preferredStudentLevel, setPreferredStudentLevel, contactPreference, setContactPreference,
  socialLinks, setSocialLinks, addToArray, removeFromArray
}) => {
  return (
    <div className="space-y-8">
      {/* Teaching Information */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
        <div className="flex items-center mb-6">
          <BookOpen className="text-orange-500 mr-3" size={24} />
          <h3 className="text-xl font-bold text-gray-800">Teaching Information</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Qualifications</label>
            <input
              type="text"
              value={qualifications}
              onChange={(e) => setQualifications(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="e.g., PhD in Mathematics"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
            <input
              type="number"
              value={experience}
              onChange={(e) => setExperience(Number(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              min="0"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hourly Rate (<FontAwesomeIcon icon={faNairaSign} />)</label>
            <input
              type="number"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(Number(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              min="0"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="e.g., New York, NY"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
          <input
            type="text"
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="e.g., Weekdays 9AM-5PM"
          />
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Education</label>
          <textarea
            value={education}
            onChange={(e) => setEducation(e.target.value)}
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Describe your educational background..."
          />
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Teaching Philosophy</label>
          <textarea
            value={teachingPhilosophy}
            onChange={(e) => setTeachingPhilosophy(e.target.value)}
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Describe your teaching philosophy and approach..."
          />
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Contact Preference</label>
          <select
            value={contactPreference}
            onChange={(e) => setContactPreference(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Select preference</option>
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="video">Video Call</option>
            <option value="message">Message</option>
          </select>
        </div>
      </div>

      {/* Subjects */}
      <ArrayInputSection
        title="Subjects"
        icon={<Layout className="text-orange-500" size={24} />}
        items={subjects}
        setItems={setSubjects}
        placeholder="Add subject (e.g., Mathematics)"
        addToArray={addToArray}
        removeFromArray={removeFromArray}
      />

      {/* Specializations */}
      <ArrayInputSection
        title="Specializations"
        icon={<Bookmark className="text-orange-500" size={24} />}
        items={specializations}
        setItems={setSpecializations}
        placeholder="Add specialization"
        addToArray={addToArray}
        removeFromArray={removeFromArray}
      />

      {/* Teaching Methods */}
      <ArrayInputSection
        title="Teaching Methods"
        icon={<CheckCircle className="text-orange-500" size={24} />}
        items={teachingMethods}
        setItems={setTeachingMethods}
        placeholder="Add teaching method"
        addToArray={addToArray}
        removeFromArray={removeFromArray}
      />

      {/* Preferred Student Level */}
      <ArrayInputSection
        title="Preferred Student Level"
        icon={<GraduationCap className="text-orange-500" size={24} />}
        items={preferredStudentLevel}
        setItems={setPreferredStudentLevel}
        placeholder="Add student level (e.g., Beginner, Intermediate)"
        addToArray={addToArray}
        removeFromArray={removeFromArray}
      />

      {/* Languages */}
      <ArrayInputSection
        title="Languages"
        icon={<Languages className="text-orange-500" size={24} />}
        items={languages}
        setItems={setLanguages}
        placeholder="Add language"
        addToArray={addToArray}
        removeFromArray={removeFromArray}
      />

      {/* Certifications */}
      <ArrayInputSection
        title="Certifications"
        icon={<Award className="text-orange-500" size={24} />}
        items={certifications}
        setItems={setCertifications}
        placeholder="Add certification"
        addToArray={addToArray}
        removeFromArray={removeFromArray}
      />

      {/* Achievements */}
      <ArrayInputSection
        title="Achievements"
        icon={<Star className="text-orange-500" size={24} />}
        items={achievements}
        setItems={setAchievements}
        placeholder="Add achievement"
        addToArray={addToArray}
        removeFromArray={removeFromArray}
      />

      {/* Social Links */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
        <div className="flex items-center mb-6">
          <Globe className="text-orange-500 mr-3" size={24} />
          <h3 className="text-xl font-bold text-gray-800">Social Links</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
            <input
              type="url"
              value={socialLinks.linkedin || ''}
              onChange={(e) => setSocialLinks({...socialLinks, linkedin: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="https://linkedin.com/in/yourprofile"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
            <input
              type="url"
              value={socialLinks.website || ''}
              onChange={(e) => setSocialLinks({...socialLinks, website: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="https://yourwebsite.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Twitter</label>
            <input
              type="url"
              value={socialLinks.twitter || ''}
              onChange={(e) => setSocialLinks({...socialLinks, twitter: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="https://twitter.com/yourhandle"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Student Edit Section Component
const StudentEditSection: React.FC<{
  interests: string[];
  setInterests: (interests: string[]) => void;
  academicLevel: string;
  setAcademicLevel: (level: string) => void;
  currentInstitution: string;
  setCurrentInstitution: (institution: string) => void;
  graduationYear: number;
  setGraduationYear: (year: number) => void;
  goals: string[];
  setGoals: (goals: string[]) => void;
  learningStyle: string;
  setLearningStyle: (style: string) => void;
  preferredSubjects: string[];
  setPreferredSubjects: (subjects: string[]) => void;
  careerGoals: string;
  setCareerGoals: (goals: string) => void;
  skills: string[];
  setSkills: (skills: string[]) => void;
  projects: string[];
  setProjects: (projects: string[]) => void;
  extracurriculars: string[];
  setExtracurriculars: (activities: string[]) => void;
  preferredLearningTime: string;
  setPreferredLearningTime: (time: string) => void;
  budget: number;
  setBudget: (budget: number) => void;
  location: string;
  setLocation: (location: string) => void;
  languages: string[];
  setLanguages: (languages: string[]) => void;
  socialLinks: { github?: string; linkedin?: string; portfolio?: string };
  setSocialLinks: (links: { github?: string; linkedin?: string; portfolio?: string }) => void;
  addToArray: (array: string[], setter: (arr: string[]) => void, value: string) => void;
  removeFromArray: (array: string[], setter: (arr: string[]) => void, index: number) => void;
}> = ({ 
  interests, setInterests, academicLevel, setAcademicLevel, currentInstitution, setCurrentInstitution,
  graduationYear, setGraduationYear, goals, setGoals, learningStyle, setLearningStyle,
  preferredSubjects, setPreferredSubjects, careerGoals, setCareerGoals, skills, setSkills,
  projects, setProjects, extracurriculars, setExtracurriculars,
  preferredLearningTime, setPreferredLearningTime, budget, setBudget, location, setLocation,
  languages, setLanguages, socialLinks, setSocialLinks, addToArray, removeFromArray
}) => {
  return (
    <div className="space-y-8">
      {/* Academic Information */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
        <div className="flex items-center mb-6">
          <GraduationCap className="text-orange-500 mr-3" size={24} />
          <h3 className="text-xl font-bold text-gray-800">Academic Information</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Academic Level</label>
            <select
              value={academicLevel}
              onChange={(e) => setAcademicLevel(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Select level</option>
              <option value="High School">High School</option>
              <option value="College/University">College/University</option>
              <option value="Graduate">Graduate</option>
              <option value="Professional">Professional</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Institution</label>
            <input
              type="text"
              value={currentInstitution}
              onChange={(e) => setCurrentInstitution(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="e.g., Harvard University"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Graduation Year</label>
            <input
              type="number"
              value={graduationYear}
              onChange={(e) => setGraduationYear(Number(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              min="1900"
              max="2030"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="e.g., New York, NY"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Learning Style</label>
          <select
            value={learningStyle}
            onChange={(e) => setLearningStyle(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Select learning style</option>
            <option value="Visual">Visual</option>
            <option value="Auditory">Auditory</option>
            <option value="Kinesthetic">Kinesthetic</option>
            <option value="Reading/Writing">Reading/Writing</option>
          </select>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Career Goals</label>
          <textarea
            value={careerGoals}
            onChange={(e) => setCareerGoals(e.target.value)}
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Describe your career aspirations..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Learning Time</label>
            <input
              type="text"
              value={preferredLearningTime}
              onChange={(e) => setPreferredLearningTime(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="e.g., Evenings, Weekends"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Budget (<FontAwesomeIcon icon={faNairaSign} />/hour)</label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Interests */}
      <ArrayInputSection
        title="Interests"
        icon={<BookOpen className="text-orange-500" size={24} />}
        items={interests}
        setItems={setInterests}
        placeholder="Add interest"
        addToArray={addToArray}
        removeFromArray={removeFromArray}
      />

      {/* Goals */}
      <ArrayInputSection
        title="Goals"
        icon={<Target className="text-orange-500" size={24} />}
        items={goals}
        setItems={setGoals}
        placeholder="Add goal"
        addToArray={addToArray}
        removeFromArray={removeFromArray}
      />

      {/* Preferred Subjects */}
      <ArrayInputSection
        title="Preferred Subjects"
        icon={<Layout className="text-orange-500" size={24} />}
        items={preferredSubjects}
        setItems={setPreferredSubjects}
        placeholder="Add preferred subject"
        addToArray={addToArray}
        removeFromArray={removeFromArray}
      />

      {/* Skills */}
      <ArrayInputSection
        title="Skills"
        icon={<Star className="text-orange-500" size={24} />}
        items={skills}
        setItems={setSkills}
        placeholder="Add skill"
        addToArray={addToArray}
        removeFromArray={removeFromArray}
      />

      {/* Projects */}
      <ArrayInputSection
        title="Projects"
        icon={<Briefcase className="text-orange-500" size={24} />}
        items={projects}
        setItems={setProjects}
        placeholder="Add project"
        addToArray={addToArray}
        removeFromArray={removeFromArray}
      />

      {/* Extracurriculars */}
      <ArrayInputSection
        title="Extracurricular Activities"
        icon={<Users className="text-orange-500" size={24} />}
        items={extracurriculars}
        setItems={setExtracurriculars}
        placeholder="Add activity"
        addToArray={addToArray}
        removeFromArray={removeFromArray}
      />

      {/* Languages */}
      <ArrayInputSection
        title="Languages"
        icon={<Languages className="text-orange-500" size={24} />}
        items={languages}
        setItems={setLanguages}
        placeholder="Add language"
        addToArray={addToArray}
        removeFromArray={removeFromArray}
      />

      {/* Social Links */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
        <div className="flex items-center mb-6">
          <Globe className="text-orange-500 mr-3" size={24} />
          <h3 className="text-xl font-bold text-gray-800">Social Links</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">GitHub</label>
            <input
              type="url"
              value={socialLinks.github || ''}
              onChange={(e) => setSocialLinks({...socialLinks, github: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="https://github.com/yourusername"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
            <input
              type="url"
              value={socialLinks.linkedin || ''}
              onChange={(e) => setSocialLinks({...socialLinks, linkedin: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="https://linkedin.com/in/yourprofile"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Portfolio</label>
            <input
              type="url"
              value={socialLinks.portfolio || ''}
              onChange={(e) => setSocialLinks({...socialLinks, portfolio: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="https://yourportfolio.com"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Array Input Section Component
const ArrayInputSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  items: string[];
  setItems: (items: string[]) => void;
  placeholder: string;
  addToArray: (array: string[], setter: (arr: string[]) => void, value: string) => void;
  removeFromArray: (array: string[], setter: (arr: string[]) => void, index: number) => void;
}> = ({ title, icon, items, setItems, placeholder, addToArray, removeFromArray }) => {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    if (inputValue.trim()) {
      addToArray(items, setItems, inputValue);
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
      <div className="flex items-center mb-6">
        {icon}
        <h3 className="text-xl font-bold text-gray-800 ml-3">{title}</h3>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {items.map((item, index) => (
          <span key={index} className="bg-orange-100 text-orange-800 px-3 py-1.5 rounded-full text-sm flex items-center">
            {item}
            <button
              type="button"
              onClick={() => removeFromArray(items, setItems, index)}
              className="ml-2 text-orange-600 hover:text-orange-800"
            >
              <X size={14} />
            </button>
          </span>
        ))}
      </div>
      
      <div className="flex">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="bg-orange-500 text-white px-4 rounded-r-lg hover:bg-orange-600 transition duration-300"
        >
          <Plus size={18} />
        </button>
      </div>
    </div>
  );
};

import { Building } from 'lucide-react';

// School Edit Section Component
const SchoolEditSection: React.FC<{
  schoolName: string;
  setSchoolName: (name: string) => void;
  schoolAddress: string;
  setSchoolAddress: (address: string) => void;
  schoolCity: string;
  setSchoolCity: (city: string) => void;
  schoolState: string;
  setSchoolState: (state: string) => void;
  schoolCountry: string;
  setSchoolCountry: (country: string) => void;
  schoolPhoneNumber: string;
  setSchoolPhoneNumber: (phone: string) => void;
  schoolWebsite: string;
  setSchoolWebsite: (website: string) => void;
  schoolType: string;
  setSchoolType: (type: string) => void;
  gradeLevels: string[];
  setGradeLevels: (levels: string[]) => void;
  accreditation: string;
  setAccreditation: (accreditation: string) => void;
  studentCount: number;
  setStudentCount: (count: number) => void;
  teacherCount: number;
  setTeacherCount: (count: number) => void;
  establishedYear: number;
  setEstablishedYear: (year: number) => void;
  schoolDescription: string;
  setSchoolDescription: (description: string) => void;
  facilities: string[];
  setFacilities: (facilities: string[]) => void;
  extracurricularActivities: string[];
  setExtracurricularActivities: (activities: string[]) => void;
  socialLinks: { facebook?: string; instagram?: string; twitter?: string; linkedin?: string };
  setSocialLinks: (links: { facebook?: string; instagram?: string; twitter?: string; linkedin?: string }) => void;
  addToArray: (array: string[], setter: (arr: string[]) => void, value: string) => void;
  removeFromArray: (array: string[], setter: (arr: string[]) => void, index: number) => void;
}> = ({
  schoolName, setSchoolName, schoolAddress, setSchoolAddress, schoolCity, setSchoolCity,
  schoolState, setSchoolState, schoolCountry, setSchoolCountry, schoolPhoneNumber, setSchoolPhoneNumber,
  schoolWebsite, setSchoolWebsite, schoolType, setSchoolType, gradeLevels, setGradeLevels,
  accreditation, setAccreditation, studentCount, setStudentCount, teacherCount, setTeacherCount,
  establishedYear, setEstablishedYear, schoolDescription, setSchoolDescription,
  facilities, setFacilities, extracurricularActivities, setExtracurricularActivities,
  socialLinks, setSocialLinks, addToArray, removeFromArray
}) => {
  return (
    <div className="space-y-8">
      {/* Basic School Information */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
        <div className="flex items-center mb-6">
          <Building className="text-orange-500 mr-3" size={24} />
          <h3 className="text-xl font-bold text-gray-800">Basic School Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">School Name</label>
            <input
              type="text"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Enter school name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">School Type</label>
            <select
              value={schoolType}
              onChange={(e) => setSchoolType(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Select school type</option>
              <option value="public">Public School</option>
              <option value="private">Private School</option>
              <option value="charter">Charter School</option>
              <option value="international">International School</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
            <input
              type="text"
              value={schoolAddress}
              onChange={(e) => setSchoolAddress(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Enter street address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
            <input
              type="text"
              value={schoolCity}
              onChange={(e) => setSchoolCity(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="City"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">State/Province</label>
            <input
              type="text"
              value={schoolState}
              onChange={(e) => setSchoolState(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="State"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
            <input
              type="text"
              value={schoolCountry}
              onChange={(e) => setSchoolCountry(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Country"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <input
              type="tel"
              value={schoolPhoneNumber}
              onChange={(e) => setSchoolPhoneNumber(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="School phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
            <input
              type="url"
              value={schoolWebsite}
              onChange={(e) => setSchoolWebsite(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="https://www.schoolwebsite.com"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">School Description</label>
          <textarea
            value={schoolDescription}
            onChange={(e) => setSchoolDescription(e.target.value)}
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Describe your school, mission, values, and what makes it special..."
          />
        </div>
      </div>

      {/* School Statistics */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
        <div className="flex items-center mb-6">
          <Users className="text-orange-500 mr-3" size={24} />
          <h3 className="text-xl font-bold text-gray-800">School Statistics</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Number of Students</label>
            <input
              type="number"
              value={studentCount}
              onChange={(e) => setStudentCount(Number(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Number of Teachers</label>
            <input
              type="number"
              value={teacherCount}
              onChange={(e) => setTeacherCount(Number(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Year Established</label>
            <input
              type="number"
              value={establishedYear}
              onChange={(e) => setEstablishedYear(Number(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              min="1800"
              max={new Date().getFullYear()}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Accreditation</label>
            <input
              type="text"
              value={accreditation}
              onChange={(e) => setAccreditation(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="e.g., Ministry of Education"
            />
          </div>
        </div>
      </div>

      {/* Grade Levels */}
      <ArrayInputSection
        title="Grade Levels Offered"
        icon={<GraduationCap className="text-orange-500" size={24} />}
        items={gradeLevels}
        setItems={setGradeLevels}
        placeholder="Add grade level (e.g., Kindergarten, Grade 1-12)"
        addToArray={addToArray}
        removeFromArray={removeFromArray}
      />

      {/* Facilities */}
      <ArrayInputSection
        title="Facilities & Amenities"
        icon={<Layout className="text-orange-500" size={24} />}
        items={facilities}
        setItems={setFacilities}
        placeholder="Add facility (e.g., Library, Science Lab, Sports Complex)"
        addToArray={addToArray}
        removeFromArray={removeFromArray}
      />

      {/* Extracurricular Activities */}
      <ArrayInputSection
        title="Extracurricular Activities"
        icon={<Users className="text-orange-500" size={24} />}
        items={extracurricularActivities}
        setItems={setExtracurricularActivities}
        placeholder="Add activity (e.g., Football, Debate Club, Music)"
        addToArray={addToArray}
        removeFromArray={removeFromArray}
      />

      {/* Social Links */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
        <div className="flex items-center mb-6">
          <Globe className="text-orange-500 mr-3" size={24} />
          <h3 className="text-xl font-bold text-gray-800">Social Media Links</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
            <input
              type="url"
              value={socialLinks.facebook || ''}
              onChange={(e) => setSocialLinks({...socialLinks, facebook: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="https://facebook.com/schoolpage"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
            <input
              type="url"
              value={socialLinks.instagram || ''}
              onChange={(e) => setSocialLinks({...socialLinks, instagram: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="https://instagram.com/schoolaccount"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Twitter</label>
            <input
              type="url"
              value={socialLinks.twitter || ''}
              onChange={(e) => setSocialLinks({...socialLinks, twitter: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="https://twitter.com/schoolhandle"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
            <input
              type="url"
              value={socialLinks.linkedin || ''}
              onChange={(e) => setSocialLinks({...socialLinks, linkedin: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="https://linkedin.com/school/schoolpage"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditPage;