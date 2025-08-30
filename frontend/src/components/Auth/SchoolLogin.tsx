import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Building, LogOut } from 'lucide-react';

const SchoolLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Validate environment variables
  if (!import.meta.env.VITE_API_URL) {
    console.error('VITE_API_URL is not defined in environment variables');
  }

  // Check if user is already authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');
    if (token && userRole === 'school') {
      setIsAuthenticated(true);
      // Check if token is expired and attempt to refresh
      const tokenExpiry = localStorage.getItem('tokenExpiry');
      if (tokenExpiry && Date.now() > Number(tokenExpiry)) {
        refreshAccessToken();
      }
    }
  }, []);

  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      handleLogout();
      return;
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh-token`, {
        refreshToken,
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('tokenExpiry', (Date.now() + response.data.expiresIn * 1000).toString());
    } catch (err) {
      console.error('Token refresh error:', err);
      handleLogout();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('profileCompleted');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem('schoolId');
    setIsAuthenticated(false);
    navigate('/');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/school-auth/login`, {
        email,
        password,
      });

      const { token, refreshToken, expiresIn, user } = response.data;

      // Store tokens and user info in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('role', user.role);
      localStorage.setItem('userId', user.id);
      localStorage.setItem('userName', user.name);
      localStorage.setItem('profileCompleted', user.profileCompleted.toString());
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('tokenExpiry', (Date.now() + expiresIn * 1000).toString());

      // Note: School profile will be created during profile completion
      // No need to fetch schoolId here as it may not exist yet for new users
      console.log('Login successful - school profile will be created during setup if needed');

      if (!user.profileCompleted) {
        navigate('/school/setup');
      } else {
        navigate('/home');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.response?.data?.status === 'error') {
        setError(err.response.data.message);
      } else if (err.response?.data?.status === 'warning') {
        setError(`${err.response.data.message} ${err.response.data.details || ''}`);
      } else {
        setError('Login failed. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-gradient-to-br from-white to-amber-50 rounded-2xl shadow-xl overflow-hidden border border-amber-100"
        >
          <div className="bg-gradient-to-r from-amber-400 to-orange-500 p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <Building size={32} className="text-white mr-2" />
              <h2 className="text-3xl font-bold text-white">School Portal</h2>
            </div>
            <p className="text-amber-100 mt-2">Sign in to manage your institution</p>
          </div>

          <div className="p-8">
            {isAuthenticated && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-50 text-blue-700 p-4 rounded-lg mb-6 border border-blue-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-blue-800">Already Logged In</h3>
                    <p className="text-sm text-blue-600 mt-1">
                      You're currently logged in as a school. If you want to sign in with a different school account, please logout first.
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-center border border-red-100"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-500">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="School email address"
                  className="w-full pl-12 pr-4 py-3 bg-white border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent placeholder-gray-400"
                  required
                />
              </div>

              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-500">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
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

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white p-3.5 rounded-xl font-semibold shadow-lg hover:shadow-amber-200/50 transition-shadow"
              >
                Sign In to School Portal
              </motion.button>

              <div className="text-center space-y-2">
                <Link to="/school/forgot-password" className="text-amber-600 hover:underline text-sm block">
                  Forgot password?
                </Link>

                <p className="text-gray-600">
                  Don't have a school account?{' '}
                  <Link to="/school/register" className="text-amber-600 font-semibold hover:underline">
                    Register Your School
                  </Link>
                </p>

                <p className="text-gray-600">
                  Looking for personal account?{' '}
                  <Link to="/login" className="text-amber-600 font-semibold hover:underline">
                    Student/Teacher Login
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </motion.div>

        <div className="mt-8 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} Teacherrs. All rights reserved.
        </div>
      </motion.div>
    </div>
  );
};

export default SchoolLogin;