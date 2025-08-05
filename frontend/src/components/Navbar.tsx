import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const Navbar: React.FC = () => {
  const isAuthenticated = !!localStorage.getItem('token');
  const navigate = useNavigate();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    // Clear all authentication-related data
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('profileCompleted');
    navigate('/');
  };

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (isAuthenticated) {
        try {
          const token = localStorage.getItem('token');
          const userId = localStorage.getItem('userId');
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/profile/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUserProfile(response.data);
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
        }
      }
    };
    fetchUserProfile();
  }, [isAuthenticated]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <motion.nav
      initial={{ y: -50 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="bg-orange-primary text-white p-4 shadow-lg"
    >
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-3xl font-bold tracking-wide">EduConnect</Link>
        <div className="space-x-6">
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="hover:text-orange-secondary text-lg font-medium">Sign In</Link>
              <Link to="/register" className="bg-white text-orange-primary px-6 py-2 rounded-full hover:bg-gray-100 font-medium">Sign Up</Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className="hover:text-orange-secondary text-lg font-medium">Dashboard</Link>
              <Link to="/home" className="hover:text-orange-secondary text-lg font-medium">Home</Link>
              <Link to="/messages" className="hover:text-orange-secondary text-lg font-medium">Messages</Link>
              <Link to="/profile" className="hover:text-orange-secondary text-lg font-medium">Profile</Link>
              
              {/* Profile Dropdown */}
              <div className="relative ml-6" ref={dropdownRef}>
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center space-x-2 hover:text-orange-secondary transition-colors duration-200"
                >
                  <div className="w-10 h-10 rounded-full bg-white overflow-hidden border-2 border-white shadow-md">
                    {userProfile?.profilePicture ? (
                      <img 
                        src={userProfile.profilePicture} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-orange-primary flex items-center justify-center text-white font-bold text-lg">
                        {userProfile?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  <svg 
                    className={`w-4 h-4 transition-transform duration-200 ${showProfileDropdown ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <AnimatePresence>
                  {showProfileDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50"
                    >
                      {/* Profile Header */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-full bg-orange-primary overflow-hidden">
                            {userProfile?.profilePicture ? (
                              <img 
                                src={userProfile.profilePicture} 
                                alt="Profile" 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-orange-primary flex items-center justify-center text-white font-bold text-xl">
                                {userProfile?.name?.charAt(0)?.toUpperCase() || 'U'}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{userProfile?.name || 'User'}</p>
                            <p className="text-sm text-gray-500 capitalize">{userProfile?.role || 'User'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Profile Menu Items */}
                      <div className="py-2">
                        <Link
                          to="/profile/edit"
                          onClick={() => setShowProfileDropdown(false)}
                          className="flex items-center px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-primary transition-colors duration-200"
                        >
                          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit Profile
                        </Link>

                        <Link
                          to="/profile/settings"
                          onClick={() => setShowProfileDropdown(false)}
                          className="flex items-center px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-primary transition-colors duration-200"
                        >
                          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Settings
                        </Link>

                        <div className="border-t border-gray-100 mt-2 pt-2">
                          <button
                            onClick={() => {
                              setShowProfileDropdown(false);
                              handleLogout();
                            }}
                            className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
                          >
                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Logout
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;