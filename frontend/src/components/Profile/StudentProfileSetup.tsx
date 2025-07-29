import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
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

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Basic Information</h3>
            
            {/* Interests */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Interests *</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {interests.map((interest, index) => (
                  <span key={index} className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm flex items-center">
                    {interest}
                    <button
                      type="button"
                      onClick={() => removeFromArray(interests, setInterests, index)}
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
                  placeholder="Add interest (e.g., Programming, Art, Music)"
                  className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addToArray(interests, setInterests, e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    addToArray(interests, setInterests, input.value);
                    input.value = '';
                  }}
                  className="bg-orange-primary text-white px-4 rounded-r-lg hover:bg-orange-secondary"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Academic Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Academic Level *</label>
              <select
                value={academicLevel}
                onChange={(e) => setAcademicLevel(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
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

            {/* Learning Goals */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Learning Goals</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {goals.map((goal, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
                    {goal}
                    <button
                      type="button"
                      onClick={() => removeFromArray(goals, setGoals, index)}
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
                  placeholder="Add learning goal (e.g., Improve Math Skills, Learn Web Development)"
                  className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addToArray(goals, setGoals, e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    addToArray(goals, setGoals, input.value);
                    input.value = '';
                  }}
                  className="bg-orange-primary text-white px-4 rounded-r-lg hover:bg-orange-secondary"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Learning Style */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Learning Style</label>
              <select
                value={learningStyle}
                onChange={(e) => setLearningStyle(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
              >
                <option value="">Select your learning style</option>
                <option value="Visual">Visual (learn through seeing)</option>
                <option value="Auditory">Auditory (learn through hearing)</option>
                <option value="Kinesthetic">Kinesthetic (learn through doing)</option>
                <option value="Reading/Writing">Reading/Writing</option>
                <option value="Mixed">Mixed approach</option>
              </select>
            </div>

            {/* Preferred Subjects */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subjects You Want to Learn</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {preferredSubjects.map((subject, index) => (
                  <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center">
                    {subject}
                    <button
                      type="button"
                      onClick={() => removeFromArray(preferredSubjects, setPreferredSubjects, index)}
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
                  placeholder="Add subject (e.g., Mathematics, Physics, Programming)"
                  className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addToArray(preferredSubjects, setPreferredSubjects, e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    addToArray(preferredSubjects, setPreferredSubjects, input.value);
                    input.value = '';
                  }}
                  className="bg-orange-primary text-white px-4 rounded-r-lg hover:bg-orange-secondary"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Academic & Personal Details</h3>
            
            {/* Current Institution */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Institution</label>
              <input
                type="text"
                value={currentInstitution}
                onChange={(e) => setCurrentInstitution(e.target.value)}
                placeholder="e.g., Harvard University, Lincoln High School"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
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
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
              />
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Skills</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {skills.map((skill, index) => (
                  <span key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center">
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeFromArray(skills, setSkills, index)}
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
                  placeholder="Add skill (e.g., Python, Photoshop, Public Speaking)"
                  className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addToArray(skills, setSkills, e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    addToArray(skills, setSkills, input.value);
                    input.value = '';
                  }}
                  className="bg-orange-primary text-white px-4 rounded-r-lg hover:bg-orange-secondary"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Projects */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Projects & Portfolio</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {projects.map((project, index) => (
                  <span key={index} className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm flex items-center">
                    {project}
                    <button
                      type="button"
                      onClick={() => removeFromArray(projects, setProjects, index)}
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
                  placeholder="Add project (e.g., E-commerce Website, Science Fair Project)"
                  className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addToArray(projects, setProjects, e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    addToArray(projects, setProjects, input.value);
                    input.value = '';
                  }}
                  className="bg-orange-primary text-white px-4 rounded-r-lg hover:bg-orange-secondary"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Extracurriculars */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Extracurricular Activities</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {extracurriculars.map((activity, index) => (
                  <span key={index} className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm flex items-center">
                    {activity}
                    <button
                      type="button"
                      onClick={() => removeFromArray(extracurriculars, setExtracurriculars, index)}
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
                  placeholder="Add activity (e.g., Debate Club, Soccer Team, Volunteer Work)"
                  className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addToArray(extracurriculars, setExtracurriculars, e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    addToArray(extracurriculars, setExtracurriculars, input.value);
                    input.value = '';
                  }}
                  className="bg-orange-primary text-white px-4 rounded-r-lg hover:bg-orange-secondary"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Career Goals */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Career Goals</label>
              <textarea
                value={careerGoals}
                onChange={(e) => setCareerGoals(e.target.value)}
                placeholder="Describe your career aspirations and goals..."
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Learning Preferences & Contact</h3>
            
            {/* Preferred Learning Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Learning Time</label>
              <select
                value={preferredLearningTime}
                onChange={(e) => setPreferredLearningTime(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Budget per Hour (USD)</label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="e.g., 20"
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
                placeholder="e.g., New York, NY or Online preferred"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
              />
            </div>

            {/* Languages */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Languages Spoken</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {languages.map((lang, index) => (
                  <span key={index} className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm flex items-center">
                    {lang}
                    <button
                      type="button"
                      onClick={() => removeFromArray(languages, setLanguages, index)}
                      className="ml-2 text-pink-600 hover:text-pink-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex">
                <input
                  type="text"
                  placeholder="Add language (e.g., English, Spanish, French)"
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

            {/* Social Links */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Social Links & Portfolio</label>
              <div className="space-y-3">
                <input
                  type="url"
                  value={socialLinks.github}
                  onChange={(e) => setSocialLinks({...socialLinks, github: e.target.value})}
                  placeholder="GitHub profile URL"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
                />
                <input
                  type="url"
                  value={socialLinks.linkedin}
                  onChange={(e) => setSocialLinks({...socialLinks, linkedin: e.target.value})}
                  placeholder="LinkedIn profile URL"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
                />
                <input
                  type="url"
                  value={socialLinks.portfolio}
                  onChange={(e) => setSocialLinks({...socialLinks, portfolio: e.target.value})}
                  placeholder="Portfolio website URL"
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
        <ProfileCompletionWelcome userRole="student" userName={userName} />
      )}
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-2xl"
      >
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-orange-primary mb-2 text-center">Complete Your Student Profile</h2>
        <p className="text-gray-600 text-center">Help teachers understand your learning needs and goals</p>
        
        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Step {currentStep} of 3</span>
            <span className="text-sm font-medium text-gray-700">{Math.round((currentStep / 3) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-orange-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 3) * 100}%` }}
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

          {currentStep < 3 ? (
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
              disabled={loading || interests.length === 0 || !academicLevel}
              className={`px-8 py-3 rounded-lg font-semibold transition duration-300 ${
                loading || interests.length === 0 || !academicLevel
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

export default StudentProfileSetup;