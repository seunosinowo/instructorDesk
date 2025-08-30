import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Plus, X, ChevronLeft, ChevronRight, Building, MapPin, Phone, Globe } from 'lucide-react';
import ProfileCompletionWelcome from './ProfileCompletionWelcome';

const SchoolProfileSetup: React.FC = () => {
  // Basic Information
  const [schoolName, setSchoolName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [website, setWebsite] = useState('');

  // Detailed Information
  const [schoolType, setSchoolType] = useState('');
  const [gradeLevels, setGradeLevels] = useState<string[]>([]);
  const [accreditation, setAccreditation] = useState('');
  const [studentCount, setStudentCount] = useState('');
  const [teacherCount, setTeacherCount] = useState('');
  const [establishedYear, setEstablishedYear] = useState('');
  const [description, setDescription] = useState('');
  const [facilities, setFacilities] = useState<string[]>([]);
  const [extracurricularActivities, setExtracurricularActivities] = useState<string[]>([]);

  // Social Links
  const [socialLinks, setSocialLinks] = useState({
    facebook: '',
    instagram: '',
    twitter: '',
    linkedin: ''
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
  const userName = localStorage.getItem('userName') || 'School Administrator';

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
        setError('School logo must be less than 5MB');
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
      console.error('School logo upload failed:', err);
      throw new Error('Failed to upload school logo');
    } finally {
      setUploadingPicture(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Get userId from localStorage (this is what the backend expects)
    const userId = localStorage.getItem('userId');
    if (!userId || userId === 'null' || userId === 'undefined') {
      setError('User ID not found. Please try logging in again.');
      setLoading(false);
      return;
    }

    // Validate required fields across all steps
    if (!schoolName || !address || !city || !state || !country) {
      setError('Please complete all required fields in Step 1.');
      setCurrentStep(1);
      setLoading(false);
      return;
    }

    if (!schoolType || gradeLevels.length === 0) {
      setError('Please complete school type and grade levels in Step 2.');
      setCurrentStep(2);
      setLoading(false);
      return;
    }

    // Profile picture validation - REQUIRED
    if (!profilePicture) {
      setError('Please upload a school logo in Step 3 to complete your profile.');
      setCurrentStep(3);
      setLoading(false);
      return;
    }

    try {
      // Upload profile picture first
      const profilePictureUrl = await uploadProfilePicture();

      // Prepare and validate profile data
      const profileData = {
        schoolName: schoolName.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        country: country.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
        website: website.trim() || undefined,
        schoolType,
        gradeLevels,
        accreditation: accreditation.trim() || undefined,
        studentCount: studentCount ? parseInt(studentCount) : undefined,
        teacherCount: teacherCount ? parseInt(teacherCount) : undefined,
        establishedYear: establishedYear ? parseInt(establishedYear) : undefined,
        description: description.trim() || undefined,
        facilities,
        extracurricularActivities,
        socialLinks,
        profilePictureUrl
      };

      // Debug logging
      console.log('Profile data being sent:', profileData);

      await axios.put(`${import.meta.env.VITE_API_URL}/school-auth/complete-profile/${userId}`, profileData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      localStorage.setItem('profileCompleted', 'true');
      setShowWelcome(true);

      // Auto-redirect after 5 seconds
      setTimeout(() => {
        navigate('/home');
      }, 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Profile setup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    // Validate current step before moving to next
    if (currentStep === 1) {
      if (!schoolName || !address || !city || !state || !country) {
        setError('Please fill in all required fields before proceeding.');
        return;
      }
    }

    if (currentStep === 2) {
      if (!schoolType || gradeLevels.length === 0) {
        setError('Please select school type and add grade levels before proceeding.');
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
    color = "bg-blue-100 text-blue-800"
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
          className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          className="bg-blue-500 text-white px-4 rounded-r-lg hover:bg-blue-600 transition-colors flex items-center"
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
              Basic School Information
            </h3>

            {/* School Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">School Name *</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500">
                  <Building size={18} />
                </div>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="Enter your school name"
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Street Address *</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500">
                  <MapPin size={18} />
                </div>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter street address"
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* City and State */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State/Province *</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="State"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Country"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500">
                  <Phone size={18} />
                </div>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="School phone number"
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500">
                  <Globe size={18} />
                </div>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://www.yourschool.com"
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <span className="bg-orange-500 text-white w-6 h-6 rounded-full flex items-center justify-center mr-2 text-sm">2</span>
              School Details & Accreditation
            </h3>

            {/* School Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">School Type *</label>
              <select
                value={schoolType}
                onChange={(e) => setSchoolType(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select school type</option>
                <option value="public">Public School</option>
                <option value="private">Private School</option>
                <option value="charter">Charter School</option>
                <option value="international">International School</option>
              </select>
            </div>

            {/* Grade Levels */}
            <TagInput
              label="Grade Levels Offered *"
              placeholder="Add grade level (e.g., Kindergarten, Grade 1-12)"
              values={gradeLevels}
              setValues={setGradeLevels}
              color="bg-green-100 text-green-800"
            />

            {/* Accreditation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Accreditation</label>
              <input
                type="text"
                value={accreditation}
                onChange={(e) => setAccreditation(e.target.value)}
                placeholder="e.g., Ministry of Education, Cambridge International"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Student and Teacher Count */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of Students</label>
                <input
                  type="number"
                  value={studentCount}
                  onChange={(e) => setStudentCount(e.target.value)}
                  placeholder="e.g., 500"
                  min="0"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of Teachers</label>
                <input
                  type="number"
                  value={teacherCount}
                  onChange={(e) => setTeacherCount(e.target.value)}
                  placeholder="e.g., 30"
                  min="0"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Established Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year Established</label>
              <input
                type="number"
                value={establishedYear}
                onChange={(e) => setEstablishedYear(e.target.value)}
                placeholder="e.g., 1990"
                min="1800"
                max={new Date().getFullYear()}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">School Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your school, mission, values, and what makes it special..."
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Facilities */}
            <TagInput
              label="Facilities & Amenities"
              placeholder="Add facility (e.g., Library, Science Lab, Sports Complex)"
              values={facilities}
              setValues={setFacilities}
              color="bg-purple-100 text-purple-800"
            />

            {/* Extracurricular Activities */}
            <TagInput
              label="Extracurricular Activities"
              placeholder="Add activity (e.g., Football, Debate Club, Music)"
              values={extracurricularActivities}
              setValues={setExtracurricularActivities}
              color="bg-orange-100 text-orange-800"
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <span className="bg-orange-500 text-white w-6 h-6 rounded-full flex items-center justify-center mr-2 text-sm">3</span>
              School Logo & Social Links
            </h3>

            {/* School Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">School Logo *</label>
              <div className="flex items-center space-x-4">
                {profilePicturePreview ? (
                  <div className="relative">
                    <img
                      src={profilePicturePreview}
                      alt="School Logo Preview"
                      className="w-24 h-24 rounded-lg object-cover border-2 border-gray-300"
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
                  <div className="w-24 h-24 rounded-lg bg-gray-200 flex items-center justify-center border-2 border-dashed border-gray-300">
                    <Building size={32} className="text-gray-400" />
                  </div>
                )}

                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">Upload your school logo (max 5MB)</p>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Social Media Links</label>
              <div className="space-y-3">
                <input
                  type="url"
                  value={socialLinks.facebook}
                  onChange={(e) => setSocialLinks({...socialLinks, facebook: e.target.value})}
                  placeholder="Facebook page URL"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="url"
                  value={socialLinks.instagram}
                  onChange={(e) => setSocialLinks({...socialLinks, instagram: e.target.value})}
                  placeholder="Instagram profile URL"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="url"
                  value={socialLinks.twitter}
                  onChange={(e) => setSocialLinks({...socialLinks, twitter: e.target.value})}
                  placeholder="Twitter profile URL"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="url"
                  value={socialLinks.linkedin}
                  onChange={(e) => setSocialLinks({...socialLinks, linkedin: e.target.value})}
                  placeholder="LinkedIn page URL"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <ProfileCompletionWelcome userRole="school" userName={schoolName || userName} />
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto my-6 md:my-10 px-4 md:p-8 bg-white rounded-xl shadow-lg"
      >
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 text-center">
            Complete Your School Profile
          </h2>
          <p className="text-gray-600 text-center">
            Help students and teachers discover your institution by providing detailed information
          </p>

          {/* Progress Bar */}
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
                disabled={loading || uploadingPicture || !profilePicture}
                className={`px-6 py-2.5 rounded-lg font-medium transition-all flex items-center ${
                  loading || uploadingPicture || !profilePicture
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
                    {uploadingPicture ? 'Uploading Logo...' : 'Saving Profile...'}
                  </>
                ) : 'Complete School Profile'}
              </button>
            )}
          </div>
        </form>
      </motion.div>
    </>
  );
};

export default SchoolProfileSetup;
