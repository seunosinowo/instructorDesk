// Login.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, LogOut } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Check if user is already authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('profileCompleted');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpiry');
    setIsAuthenticated(false);
    navigate('/');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Use regular axios for login to avoid token interceptor issues
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, { 
        email, 
        password, 
        rememberMe 
      });
      
      // Always use localStorage for persistent login (ignore rememberMe checkbox)
      const storage = localStorage;
      
      storage.setItem('token', response.data.token);
      storage.setItem('role', response.data.user.role);
      storage.setItem('userId', response.data.user.id);
      storage.setItem('userName', response.data.user.name);
      storage.setItem('profileCompleted', response.data.user.profileCompleted.toString());
      
      // Always store refresh token and expiry for automatic token renewal
      if (response.data.refreshToken && response.data.expiresIn) {
        storage.setItem('refreshToken', response.data.refreshToken);
        storage.setItem('tokenExpiry', (Date.now() + response.data.expiresIn * 1000).toString());
      }
      
      if (!response.data.user.profileCompleted) {
        navigate('/profile/setup');
      } else {
        navigate('/home');
      }
    } catch (err: any) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
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
            <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
            <p className="text-amber-100 mt-2">Sign in to continue your journey</p>
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
                      You're currently logged in. If you want to sign in with a different account, please logout first.
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
                  placeholder="Email address"
                  className="w-full pl-12 pr-4 py-3 bg-white border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent placeholder-gray-400"
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
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-amber-500 hover:text-amber-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-amber-500 focus:ring-amber-300 border-amber-300 rounded"
                  />
                  <label htmlFor="remember" className="ml-2 text-gray-600">
                    Remember me
                  </label>
                </div>
                
                <Link to="/forgot-password" className="text-amber-600 hover:underline text-sm">
                  Forgot password?
                </Link>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white p-3.5 rounded-xl font-semibold shadow-lg hover:shadow-amber-200/50 transition-shadow"
              >
                Sign In
              </motion.button>
              
              {/* TODO: Implement Google and Facebook sign-in later */}
              {/*
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-amber-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-amber-50 text-gray-500">Or continue with</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <button 
                  type="button"
                  className="flex items-center justify-center gap-2 bg-white border border-amber-200 py-2.5 rounded-xl text-gray-600 hover:bg-amber-50 transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
                  </svg>
                  Google
                </button>
                
                <button 
                  type="button"
                  className="flex items-center justify-center gap-2 bg-white border border-amber-200 py-2.5 rounded-xl text-gray-600 hover:bg-amber-50 transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8.351 1.734v3.735H5.982v4.127h2.37v12.73h4.915v-12.73h3.202l.423-4.127h-3.625V5.045c0-1.128.3-1.897 1.83-1.897h1.92V.077C17.85.052 16.36 0 14.666 0 11.026 0 8.351 2.373 8.351 6.709V7.86H5.982v4.127h2.37v12.73h4.915v-12.73h3.202l.423-4.127h-3.625V5.045c0-1.128.3-1.897 1.83-1.897h1.92V.077C17.85.052 16.36 0 14.666 0 11.026 0 8.351 2.373 8.351 6.709V7.86z"/>
                  </svg>
                  Facebook
                </button>
              </div>
              */}
              
              <p className="text-center text-gray-600 mt-6">
                Don't have an account?{' '}
                <Link to="/register" className="text-amber-600 font-semibold hover:underline">
                  Sign Up
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
  );
};

export default Login;