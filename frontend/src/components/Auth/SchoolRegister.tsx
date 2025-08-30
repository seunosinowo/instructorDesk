import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, CheckCircle, RotateCcw, X } from 'lucide-react';

const SchoolRegister: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [registrationEmail, setRegistrationEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/school-auth/register`, formData);

      // Store schoolId from response if available
      if (response.data.schoolId) {
        localStorage.setItem('schoolId', response.data.schoolId);
        console.log('School ID stored after registration:', response.data.schoolId);
      }

      // Store role in localStorage for email confirmation redirect
      localStorage.setItem('role', 'school');

      setRegistrationEmail(formData.email);
      setShowEmailConfirmation(true);
      setError('');
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.errors) {
        setError(err.response.data.errors[0].msg);
      } else {
        setError('School registration failed. Please try again.');
      }
    }
  };

  const handleResendEmail = async () => {
    setResendLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/send-confirmation`, { email: registrationEmail });
      setTimeout(() => setResendLoading(false), 2000);
    } catch (err: any) {
      setResendLoading(false);
      setError('Failed to resend email. Please try again.');
    }
  };

  // Email Confirmation Modal Component
  const EmailConfirmationModal = () => (
    <AnimatePresence>
      {showEmailConfirmation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={(e) => e.target === e.currentTarget && setShowEmailConfirmation(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative"
          >
            <button
              onClick={() => setShowEmailConfirmation(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>

            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mx-auto w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <Mail size={40} className="text-white" />
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email!</h3>
                <p className="text-gray-600 mb-4">
                  We've sent a confirmation email to:
                </p>
                <p className="font-semibold text-amber-600 bg-amber-50 px-4 py-2 rounded-lg break-all">
                  {registrationEmail}
                </p>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="space-y-4 mb-6"
            >
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 rounded-full p-1 mt-0.5">
                  <CheckCircle size={16} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-700">
                    <strong>Step 1:</strong> Check your inbox (and spam folder)
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 rounded-full p-1 mt-0.5">
                  <CheckCircle size={16} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-700">
                    <strong>Step 2:</strong> Click the confirmation link in the email
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 rounded-full p-1 mt-0.5">
                  <CheckCircle size={16} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-700">
                    <strong>Step 3:</strong> Return here to sign in to your account
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="space-y-3"
            >
              <button
                onClick={() => {
                  setShowEmailConfirmation(false);
                  navigate('/school/login');
                }}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white p-3 rounded-xl font-semibold hover:shadow-lg transition-shadow"
              >
                Go to School Sign In
              </button>

              <button
                onClick={handleResendEmail}
                disabled={resendLoading}
                className="w-full bg-gray-100 text-gray-700 p-3 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
              >
                {resendLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <RotateCcw size={18} />
                    </motion.div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Mail size={18} />
                    <span>Resend Email</span>
                  </>
                )}
              </button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="text-xs text-gray-500 text-center mt-4"
            >
              Didn't receive the email? Check your spam folder or click resend
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <EmailConfirmationModal />

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-lg"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-gradient-to-br from-white to-amber-50 rounded-2xl shadow-xl overflow-hidden border border-amber-100"
          >
            <div className="bg-gradient-to-r from-amber-400 to-orange-500 p-6 text-center">
              <h2 className="text-3xl font-bold text-white">Register Your School</h2>
              <p className="text-amber-100 mt-2">Join Teacherrs as an educational institution</p>
            </div>

            <div className="p-8">
              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-center border border-red-100"
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleRegister} className="space-y-6">
                {/* Email */}
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-500">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="School email address"
                    className="w-full pl-12 pr-4 py-3 bg-white border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent placeholder-gray-400"
                    required
                  />
                </div>

                {/* Password */}
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-500">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Create password"
                    className="w-full pl-12 pr-11 py-3 bg-white border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent placeholder-gray-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-amber-500 hover:text-amber-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                {/* Confirm Password */}
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-500">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm password"
                    className="w-full pl-12 pr-11 py-3 bg-white border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent placeholder-gray-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-amber-500 hover:text-amber-600"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white p-3.5 rounded-xl font-semibold shadow-lg hover:shadow-amber-200/50 transition-shadow"
                >
                  Create School Account
                </motion.button>

                <p className="text-center text-gray-600 mt-6">
                  Already have a school account?{' '}
                  <Link to="/school/login" className="text-amber-600 font-semibold hover:underline">
                    Sign In to School Portal
                  </Link>
                </p>
              </form>
            </div>
          </motion.div>

          <div className="mt-8 text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} Teacherrs. All rights reserved.
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default SchoolRegister;