import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import ProfileCompletionWelcome from './ProfileCompletionWelcome';

const StudentProfileSetup: React.FC = () => {
  // Basic Information
  const [interests, setInterests] = useState<string[]>([]);
  const [academicLevel, setAcademicLevel] = useState('');
  const [goals, setGoals] = useState<string[]>([]);
  const [learningStyle, setLearningStyle] = useState('');
  
  // Academic Information
  const [preferredSubjects, setPreferredSubjects] = useState<string[]>([]);
  const [currentInstitution, setCurrentInstitution] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [projects, setProjects] = useState<string[]>([]);
  const [extracurriculars, setExtracurriculars] = useState<string[]>([]);
  
  // Career & Learning Preferences
  const [careerGoals, setCareerGoals] = useState('');
  const [preferredLearningTime, setPreferredLearningTime] = useState('');
  const [budget, setBudget] = useState('');
  const [location, setLocation] = useState('');
  const [languages, setLanguages] = useState<string[]>([]);
  
  // Social Links
  const [socialLinks, setSocialLinks] = useState({
    github: '',
    linkedin: '',
    portfolio: ''
  });

  // Profile Picture
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string>('');
  const [uploadingPicture, setUploadingPicture] = useState(false);

  // Form state
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userName = localStorage.getItem('userName') || 'Student';

  // Helper functions for managing arrays
  const addToArray = (array: string[], setter: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
    if (value.trim() && !array.includes(value.trim())) {
      setter([...array, value.trim()]);
    }
  };

  const removeFromArray = (array: string[], setter: React.Dispatch<React.SetStateAction<string[]>>, index: number) => {
    setter(array.filter((_, i) => i !== index));
  };

  // Profile Picture Upload Handler
  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Profile picture must be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      setProfilePicture(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setProfilePicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(''); // Clear any previous errors
    }
  };

  const uploadProfilePicture = async (): Promise<string | null> => {
    if (!profilePicture) return null;

    setUploadingPicture(true);
    try {
      const formData = new FormData();
      formData.append('profilePicture', profilePicture);

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/upload/profile-picture`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data.profilePicture;
    } catch (err: any) {
      console.error('Profile picture upload failed:', err);
      throw new Error('Failed to upload profile picture');
    } finally {
      setUploadingPicture(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate required fields across all steps
    if (interests.length === 0) {
      setError('Please add at least one interest in Step 1.');
      setCurrentStep(1);
      setLoading(false);
      return;
    }

    if (!academicLevel) {
      setError('Please select your academic level in Step 1.');
      setCurrentStep(1);
      setLoading(false);
      return;
    }

    if (preferredSubjects.length === 0) {
      setError('Please add at least one subject you want to learn in Step 1.');
      setCurrentStep(1);
      setLoading(false);
      return;
    }

    // Step 2 validations - at least some fields should be filled
    const step2HasContent = currentInstitution || graduationYear || skills.length > 0 || 
                           projects.length > 0 || extracurriculars.length > 0 || careerGoals;
    
    if (!step2HasContent) {
      setError('Please fill in at least some information in Step 2 (Academic & Personal Details).');
      setCurrentStep(2);
      setLoading(false);
      return;
    }

    // Step 3 validations - at least some fields should be filled AND profile picture uploaded
    const step3HasContent = preferredLearningTime || budget || location || 
                           languages.length > 0 || socialLinks.github || 
                           socialLinks.linkedin || socialLinks.portfolio;
    
    if (!step3HasContent) {
      setError('Please fill in at least some information in Step 3 (Learning Preferences & Contact).');
      setCurrentStep(3);
      setLoading(false);
      return;
    }

    // Profile picture validation - REQUIRED
    if (!profilePicture) {
      setError('Please upload a profile picture in Step 3 to complete your profile.');
      setCurrentStep(3);
      setLoading(false);
      return;
    }

    try {
      // Upload profile picture first
      const profilePictureUrl = await uploadProfilePicture();
      
      const profileData = {
        interests,
        academicLevel,
        goals,
        learningStyle,
        preferredSubjects,
        currentInstitution,
        graduationYear: graduationYear ? parseInt(graduationYear) : undefined,
        skills,
        projects,
        extracurriculars,
        careerGoals,
        preferredLearningTime,
        budget: budget ? parseFloat(budget) : undefined,
        location,
        languages,
        socialLinks,
        profilePictureUrl
      };

      await axios.post(`${import.meta.env.VITE_API_URL}/profile`, profileData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      localStorage.setItem('profileCompleted', 'true');
      setShowWelcome(true);
      
      // Auto-redirect after 5 seconds
      setTimeout(() => {
        navigate('/home');
      }, 5000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Profile setup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    // Validate current step before moving to next
    if (currentStep === 1) {
      if (interests.length === 0) {
        setError('Please add at least one interest before proceeding.');
        return;
      }
      if (!academicLevel) {
        setError('Please select your academic level before proceeding.');
        return;
      }
      if (preferredSubjects.length === 0) {
        setError('Please add at least one subject you want to learn before proceeding.');
        return;
      }
    }
    
    if (currentStep === 2) {
      const step2HasContent = currentInstitution || graduationYear || skills.length > 0 || 
                             projects.length > 0 || extracurriculars.length > 0 || careerGoals;
      if (!step2HasContent) {
        setError('Please fill in at least some information in this step before proceeding.');
        return;
      }
    }
    
    setError(''); // Clear any previous errors
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };
  
  const prevStep = () => {
    setError(''); // Clear any errors when going back
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Tag Input Component
  const TagInput = ({ 
    label, 
    placeholder, 
    values, 
    setValues,
    color = "bg-orange-100 text-orange-800"
  }: {
    label: string;
    placeholder: string;
    values: string[];
    setValues: React.Dispatch<React.SetStateAction<string[]>>;
    color?: string;
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {values.map((value, index) => (
          <motion.span 
            key={index}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`${color} px-3 py-1.5 rounded-full text-sm flex items-center`}
          >
            {value}
            <button
              type="button"
              onClick={() => removeFromArray(values, setValues, index)}
              className="ml-2 rounded-full p-0.5 hover:bg-black/10 transition-colors"
            >
              <X size={14} />
            </button>
          </motion.span>
        ))}
      </div>
      <div className="flex">
        <input
          type="text"
          placeholder={placeholder}
          className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addToArray(values, setValues, e.currentTarget.value);
              e.currentTarget.value = '';
            }
          }}
        />
        <button
          type="button"
          onClick={(e) => {
            const input = e.currentTarget.previousElementSibling as HTMLInputElement;
            addToArray(values, setValues, input.value);
            input.value = '';
          }}
          className="bg-orange-500 text-white px-4 rounded-r-lg hover:bg-orange-600 transition-colors flex items-center"
        >
          <Plus size={16} className="mr-1" /> Add
        </button>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <span className="bg-orange-500 text-white w-6 h-6 rounded-full flex items-center justify-center mr-2 text-sm">1</span>
              Basic Information
            </h3>
            
            <TagInput
              label="Interests *"
              placeholder="Add interest (e.g., Programming, Art)"
              values={interests}
              setValues={setInterests}
              color="bg-orange-100 text-orange-800"
            />

            {/* Academic Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Academic Level *</label>
              <select
                value={academicLevel}
                onChange={(e) => setAcademicLevel(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              >
                <option value="">Select your academic level</option>
                <option value="Elementary School">Elementary School</option>
                <option value="Middle School">Middle School</option>
                <option value="High School">High School</option>
                <option value="College/University">College/University</option>
                <option value="Graduate School">Graduate School</option>
                <option value="Professional Development">Professional Development</option>
                <option value="Adult Learning">Adult Learning</option>
              </select>
            </div>

            <TagInput
              label="Learning Goals"
              placeholder="Add goal (e.g., Improve Math Skills)"
              values={goals}
              setValues={setGoals}
              color="bg-blue-100 text-blue-800"
            />

            {/* Learning Style */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Learning Style</label>
              <select
                value={learningStyle}
                onChange={(e) => setLearningStyle(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Select your learning style</option>
                <option value="Visual">Visual (learn through seeing)</option>
                <option value="Auditory">Auditory (learn through hearing)</option>
                <option value="Kinesthetic">Kinesthetic (learn through doing)</option>
                <option value="Reading/Writing">Reading/Writing</option>
                <option value="Mixed">Mixed approach</option>
              </select>
            </div>

            <TagInput
              label="Subjects You Want to Learn"
              placeholder="Add subject (e.g., Mathematics, Physics)"
              values={preferredSubjects}
              setValues={setPreferredSubjects}
              color="bg-green-100 text-green-800"
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <span className="bg-orange-500 text-white w-6 h-6 rounded-full flex items-center justify-center mr-2 text-sm">2</span>
              Academic & Personal Details
            </h3>
            
            {/* Current Institution */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Institution</label>
              <input
                type="text"
                value={currentInstitution}
                onChange={(e) => setCurrentInstitution(e.target.value)}
                placeholder="e.g., Harvard University, Lincoln High School"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Graduation Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Expected Graduation Year</label>
              <input
                type="number"
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
                placeholder="e.g., 2025"
                min="2020"
                max="2035"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <TagInput
              label="Current Skills"
              placeholder="Add skill (e.g., Python, Public Speaking)"
              values={skills}
              setValues={setSkills}
              color="bg-purple-100 text-purple-800"
            />

            <TagInput
              label="Projects & Portfolio"
              placeholder="Add project (e.g., E-commerce Website, Science Fair Project)"
              values={projects}
              setValues={setProjects}
              color="bg-indigo-100 text-indigo-800"
            />

            <TagInput
              label="Extracurricular Activities"
              placeholder="Add activity (e.g., Debate Club, Soccer Team, Volunteer Work)"
              values={extracurriculars}
              setValues={setExtracurriculars}
              color="bg-yellow-100 text-yellow-800"
            />

            {/* Career Goals */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Career Goals</label>
              <textarea
                value={careerGoals}
                onChange={(e) => setCareerGoals(e.target.value)}
                placeholder="Describe your career aspirations and goals..."
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <span className="bg-orange-500 text-white w-6 h-6 rounded-full flex items-center justify-center mr-2 text-sm">3</span>
              Learning Preferences, Contact & Profile Picture
            </h3>
            
            {/* Profile Picture Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture *</label>
              <div className="flex items-center space-x-4">
                {profilePicturePreview ? (
                  <div className="relative">
                    <img
                      src={profilePicturePreview}
                      alt="Profile Preview"
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setProfilePicture(null);
                        setProfilePicturePreview('');
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center border-2 border-dashed border-gray-300">
                    <span className="text-gray-400 text-xs">No Image</span>
                  </div>
                )}
                
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">Upload a clear photo of yourself (max 5MB)</p>
                </div>
              </div>
            </div>
            
            {/* Preferred Learning Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Learning Time</label>
              <select
                value={preferredLearningTime}
                onChange={(e) => setPreferredLearningTime(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Select preferred time</option>
                <option value="Morning (6AM - 12PM)">Morning (6AM - 12PM)</option>
                <option value="Afternoon (12PM - 6PM)">Afternoon (12PM - 6PM)</option>
                <option value="Evening (6PM - 10PM)">Evening (6PM - 10PM)</option>
                <option value="Weekends only">Weekends only</option>
                <option value="Flexible">Flexible</option>
              </select>
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Budget per Hour (₦)</label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="e.g., 2000"
                min="0"
                step="0.01"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., New York, NY or Online preferred"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <TagInput
              label="Languages Spoken"
              placeholder="Add language (e.g., English, Spanish)"
              values={languages}
              setValues={setLanguages}
              color="bg-pink-100 text-pink-800"
            />

            {/* Social Links */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Social Links & Portfolio</label>
              <div className="space-y-3">
                <input
                  type="url"
                  value={socialLinks.github}
                  onChange={(e) => setSocialLinks({...socialLinks, github: e.target.value})}
                  placeholder="GitHub profile URL"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <input
                  type="url"
                  value={socialLinks.linkedin}
                  onChange={(e) => setSocialLinks({...socialLinks, linkedin: e.target.value})}
                  placeholder="LinkedIn profile URL"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <input
                  type="url"
                  value={socialLinks.portfolio}
                  onChange={(e) => setSocialLinks({...socialLinks, portfolio: e.target.value})}
                  placeholder="Portfolio website URL"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {showWelcome && (
        <ProfileCompletionWelcome userRole="student" userName={userName} />
      )}
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto my-6 md:my-10 px-4 md:p-8 bg-white rounded-xl shadow-lg"
      >
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 text-center">
            Complete Your Student Profile
          </h2>
          <p className="text-gray-600 text-center">
            Help teachers understand your learning needs and goals
          </p>
          
          {/* Enhanced Progress Bar */}
          <div className="mt-8 relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 z-0"></div>
            <div className="flex justify-between relative z-10">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(step)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      currentStep >= step
                        ? 'bg-orange-500 text-white shadow-md'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step}
                  </button>
                  <span className="mt-2 text-xs font-medium text-gray-600">
                    Step {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="bg-gray-50 p-6 rounded-xl mb-6">
            {renderStepContent()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-4 py-2.5 rounded-lg font-medium transition-all flex items-center ${
                currentStep === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ChevronLeft size={18} className="mr-1" /> Previous
            </button>

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-5 py-2.5 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-all flex items-center"
              >
                Next <ChevronRight size={18} className="ml-1" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading || 
                         uploadingPicture ||
                         interests.length === 0 || 
                         !academicLevel || 
                         preferredSubjects.length === 0 ||
                         !(currentInstitution || graduationYear || skills.length > 0 || projects.length > 0 || extracurriculars.length > 0 || careerGoals) ||
                         !(preferredLearningTime || budget || location || languages.length > 0 || socialLinks.github || socialLinks.linkedin || socialLinks.portfolio) ||
                         !profilePicture
                        }
                className={`px-6 py-2.5 rounded-lg font-medium transition-all flex items-center ${
                  loading || 
                  uploadingPicture ||
                  interests.length === 0 || 
                  !academicLevel || 
                  preferredSubjects.length === 0 ||
                  !(currentInstitution || graduationYear || skills.length > 0 || projects.length > 0 || extracurriculars.length > 0 || careerGoals) ||
                  !(preferredLearningTime || budget || location || languages.length > 0 || socialLinks.github || socialLinks.linkedin || socialLinks.portfolio) ||
                  !profilePicture
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-orange-500 text-white hover:bg-orange-600'
                }`}
              >
                {loading || uploadingPicture ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {uploadingPicture ? 'Uploading Picture...' : 'Saving Profile...'}
                  </>
                ) : 'Complete Profile'}
              </button>
            )}
          </div>
        </form>
      </motion.div>
    </>
  );
};

export default StudentProfileSetup;