import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import ProfileCompletionWelcome from './ProfileCompletionWelcome';

const TeacherProfileSetup: React.FC = () => {
  // Basic Information
  const [subjects, setSubjects] = useState<string[]>([]);
  const [qualifications, setQualifications] = useState('');
  const [experience, setExperience] = useState('');
  const [education, setEducation] = useState('');
  
  // Detailed Information
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [teachingMethods, setTeachingMethods] = useState<string[]>([]);
  const [availability, setAvailability] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [location, setLocation] = useState('');
  const [languages, setLanguages] = useState<string[]>([]);
  const [certifications, setCertifications] = useState<string[]>([]);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [teachingPhilosophy, setTeachingPhilosophy] = useState('');
  const [preferredStudentLevel, setPreferredStudentLevel] = useState<string[]>([]);
  const [contactPreference, setContactPreference] = useState('');
  
  // Social Links
  const [socialLinks, setSocialLinks] = useState({
    linkedin: '',
    website: '',
    twitter: ''
  });

  // Form state
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userName = localStorage.getItem('userName') || 'Teacher';

  // Helper functions for managing arrays
  const addToArray = (array: string[], setter: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
    if (value.trim() && !array.includes(value.trim())) {
      setter([...array, value.trim()]);
    }
  };

  const removeFromArray = (array: string[], setter: React.Dispatch<React.SetStateAction<string[]>>, index: number) => {
    setter(array.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const profileData = {
        subjects,
        qualifications,
        experience: parseInt(experience) || 0,
        education,
        specializations,
        teachingMethods,
        availability,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : undefined,
        location,
        languages,
        certifications,
        achievements,
        teachingPhilosophy,
        preferredStudentLevel,
        contactPreference,
        socialLinks
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

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Basic Information</h3>
            
            {/* Subjects */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subjects You Teach *</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {subjects.map((subject, index) => (
                  <span key={index} className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm flex items-center">
                    {subject}
                    <button
                      type="button"
                      onClick={() => removeFromArray(subjects, setSubjects, index)}
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
                  placeholder="Add a subject (e.g., Mathematics)"
                  className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addToArray(subjects, setSubjects, e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    addToArray(subjects, setSubjects, input.value);
                    input.value = '';
                  }}
                  className="bg-orange-primary text-white px-4 rounded-r-lg hover:bg-orange-secondary"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Qualifications */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Qualifications *</label>
              <input
                type="text"
                value={qualifications}
                onChange={(e) => setQualifications(e.target.value)}
                placeholder="e.g., M.Sc. in Mathematics, B.Ed."
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
                required
              />
            </div>

            {/* Experience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience *</label>
              <input
                type="number"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="e.g., 5"
                min="0"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
                required
              />
            </div>

            {/* Education */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Education Background</label>
              <textarea
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                placeholder="Describe your educational background..."
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Teaching Details</h3>
            
            {/* Specializations */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Specializations</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {specializations.map((spec, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
                    {spec}
                    <button
                      type="button"
                      onClick={() => removeFromArray(specializations, setSpecializations, index)}
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
                  placeholder="Add specialization (e.g., Calculus, Algebra)"
                  className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addToArray(specializations, setSpecializations, e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    addToArray(specializations, setSpecializations, input.value);
                    input.value = '';
                  }}
                  className="bg-orange-primary text-white px-4 rounded-r-lg hover:bg-orange-secondary"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Teaching Methods */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Teaching Methods</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {teachingMethods.map((method, index) => (
                  <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center">
                    {method}
                    <button
                      type="button"
                      onClick={() => removeFromArray(teachingMethods, setTeachingMethods, index)}
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
                  placeholder="Add teaching method (e.g., Interactive Learning, Visual Aids)"
                  className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addToArray(teachingMethods, setTeachingMethods, e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    addToArray(teachingMethods, setTeachingMethods, input.value);
                    input.value = '';
                  }}
                  className="bg-orange-primary text-white px-4 rounded-r-lg hover:bg-orange-secondary"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Teaching Philosophy */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Teaching Philosophy</label>
              <textarea
                value={teachingPhilosophy}
                onChange={(e) => setTeachingPhilosophy(e.target.value)}
                placeholder="Describe your teaching philosophy and approach..."
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
              />
            </div>

            {/* Preferred Student Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Student Levels</label>
              <div className="grid grid-cols-2 gap-2">
                {['Elementary', 'Middle School', 'High School', 'College', 'Graduate', 'Adult Learning'].map((level) => (
                  <label key={level} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={preferredStudentLevel.includes(level)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setPreferredStudentLevel([...preferredStudentLevel, level]);
                        } else {
                          setPreferredStudentLevel(preferredStudentLevel.filter(l => l !== level));
                        }
                      }}
                      className="mr-2 text-orange-primary focus:ring-orange-primary"
                    />
                    <span className="text-sm">{level}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Professional Details</h3>
            
            {/* Availability */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
              >
                <option value="">Select availability</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Weekends only">Weekends only</option>
                <option value="Evenings only">Evenings only</option>
                <option value="Flexible">Flexible</option>
              </select>
            </div>

            {/* Hourly Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hourly Rate (USD)</label>
              <input
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                placeholder="e.g., 25"
                min="0"
                step="0.01"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., New York, NY or Online"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
              />
            </div>

            {/* Languages */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Languages Spoken</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {languages.map((lang, index) => (
                  <span key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center">
                    {lang}
                    <button
                      type="button"
                      onClick={() => removeFromArray(languages, setLanguages, index)}
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
                  placeholder="Add language (e.g., English, Spanish)"
                  className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addToArray(languages, setLanguages, e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    addToArray(languages, setLanguages, input.value);
                    input.value = '';
                  }}
                  className="bg-orange-primary text-white px-4 rounded-r-lg hover:bg-orange-secondary"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Contact Preference */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Contact Method</label>
              <select
                value={contactPreference}
                onChange={(e) => setContactPreference(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
              >
                <option value="">Select preference</option>
                <option value="Email">Email</option>
                <option value="Phone">Phone</option>
                <option value="Video Call">Video Call</option>
                <option value="In-person">In-person</option>
                <option value="Platform messaging">Platform messaging</option>
              </select>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Additional Information</h3>
            
            {/* Certifications */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Certifications</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {certifications.map((cert, index) => (
                  <span key={index} className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm flex items-center">
                    {cert}
                    <button
                      type="button"
                      onClick={() => removeFromArray(certifications, setCertifications, index)}
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
                  placeholder="Add certification (e.g., TESOL, PMP)"
                  className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addToArray(certifications, setCertifications, e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    addToArray(certifications, setCertifications, input.value);
                    input.value = '';
                  }}
                  className="bg-orange-primary text-white px-4 rounded-r-lg hover:bg-orange-secondary"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Achievements */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Achievements & Awards</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {achievements.map((achievement, index) => (
                  <span key={index} className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm flex items-center">
                    {achievement}
                    <button
                      type="button"
                      onClick={() => removeFromArray(achievements, setAchievements, index)}
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
                  placeholder="Add achievement (e.g., Teacher of the Year 2023)"
                  className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addToArray(achievements, setAchievements, e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    addToArray(achievements, setAchievements, input.value);
                    input.value = '';
                  }}
                  className="bg-orange-primary text-white px-4 rounded-r-lg hover:bg-orange-secondary"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Social Links</label>
              <div className="space-y-3">
                <input
                  type="url"
                  value={socialLinks.linkedin}
                  onChange={(e) => setSocialLinks({...socialLinks, linkedin: e.target.value})}
                  placeholder="LinkedIn profile URL"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
                />
                <input
                  type="url"
                  value={socialLinks.website}
                  onChange={(e) => setSocialLinks({...socialLinks, website: e.target.value})}
                  placeholder="Personal website URL"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
                />
                <input
                  type="url"
                  value={socialLinks.twitter}
                  onChange={(e) => setSocialLinks({...socialLinks, twitter: e.target.value})}
                  placeholder="Twitter profile URL"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
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
        <ProfileCompletionWelcome userRole="teacher" userName={userName} />
      )}
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-2xl"
      >
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-orange-primary mb-2 text-center">Complete Your Teacher Profile</h2>
        <p className="text-gray-600 text-center">Help students find you by providing detailed information about your teaching expertise</p>
        
        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Step {currentStep} of 4</span>
            <span className="text-sm font-medium text-gray-700">{Math.round((currentStep / 4) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-orange-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {renderStepContent()}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`px-6 py-3 rounded-lg font-semibold transition duration-300 ${
              currentStep === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Previous
          </button>

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-6 py-3 bg-orange-primary text-white rounded-lg font-semibold hover:bg-orange-secondary transition duration-300"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading || subjects.length === 0 || !qualifications || !experience}
              className={`px-8 py-3 rounded-lg font-semibold transition duration-300 ${
                loading || subjects.length === 0 || !qualifications || !experience
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-orange-primary text-white hover:bg-orange-secondary'
              }`}
            >
              {loading ? 'Saving Profile...' : 'Complete Profile'}
            </button>
          )}
        </div>
      </form>
    </motion.div>
    </>
  );
};

export default TeacherProfileSetup;