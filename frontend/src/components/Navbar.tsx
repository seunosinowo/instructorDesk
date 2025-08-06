import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  Home, 
  MessageSquare, 
  User, 
  LayoutDashboard,
  Settings,
  Edit3,
  LogOut,
  Menu,
  X
} from 'lucide-react';

const Navbar: React.FC = () => {
  const isAuthenticated = !!localStorage.getItem('token');
  const navigate = useNavigate();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('profileCompleted');
    navigate('/');
    setMobileMenuOpen(false);
  };

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (isAuthenticated) {
        const profileCompleted = localStorage.getItem('profileCompleted');
        if (profileCompleted !== 'true') return;
        
        try {
          const token = localStorage.getItem('token');
          const userId = localStorage.getItem('userId');
          if (!userId) return;
          
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/profile/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUserProfile(response.data);
        } catch (error: any) {
          if (error.response?.status !== 404) {
            console.error('Failed to fetch user profile:', error);
          }
        }
      }
    };
    fetchUserProfile();
  }, [isAuthenticated]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
      if (mobileMenuRef.current && 
          !mobileMenuRef.current.contains(event.target as Node) &&
          !(event.target as Element).closest('.mobile-menu-button')) {
        setMobileMenuOpen(false);
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
      className="bg-orange-primary text-white shadow-lg sticky top-0 z-50"
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-3xl font-bold tracking-tight flex items-center">
            <span className="bg-white text-orange-primary px-3 py-1 rounded-lg mr-2">T</span>
            <span>eacherrs</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {!isAuthenticated ? (
              <>
                <Link 
                  to="/login" 
                  className="hover:text-orange-secondary transition-colors duration-300 font-medium px-3 py-2 rounded-lg hover:bg-white/10"
                >
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="bg-white text-orange-primary px-6 py-2 rounded-full hover:bg-gray-100 font-medium transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                <div className="flex items-center space-x-5">
                  <NavLink to="/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" />
                  <NavLink to="/home" icon={<Home size={20} />} label="Home" />
                  <NavLink to="/messages" icon={<MessageSquare size={20} />} label="Messages" />
                  <NavLink to="/profile" icon={<User size={20} />} label="Profile" />
                </div>
                
                {/* Profile Dropdown */}
                <div className="relative ml-4" ref={dropdownRef}>
                  <button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="flex items-center space-x-2 hover:text-orange-secondary transition-colors duration-200 focus:outline-none"
                  >
                    <ProfileAvatar userProfile={userProfile} />
                    <motion.span
                      animate={{ rotate: showProfileDropdown ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <svg 
                        className="w-4 h-4"
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </motion.span>
                  </button>

                  <AnimatePresence>
                    {showProfileDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 overflow-hidden"
                      >
                        {/* Profile Header */}
                        <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-amber-50">
                          <div className="flex items-center space-x-3">
                            <ProfileAvatar userProfile={userProfile} size={12} />
                            <div>
                              <p className="font-semibold text-gray-800 truncate max-w-[140px]">
                                {userProfile?.name || 'User'}
                              </p>
                              <p className="text-xs text-gray-500 capitalize">
                                {userProfile?.role || 'User'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Profile Menu Items */}
                        <div className="py-2">
                          <DropdownItem 
                            to="/profile/edit" 
                            icon={<Edit3 size={16} />}
                            label="Edit Profile"
                            onClick={() => setShowProfileDropdown(false)}
                          />
                          <DropdownItem 
                            to="/profile/settings" 
                            icon={<Settings size={16} />}
                            label="Settings"
                            onClick={() => setShowProfileDropdown(false)}
                          />
                          
                          <div className="border-t border-gray-100 mt-2 pt-2">
                            <button
                              onClick={handleLogout}
                              className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200 group"
                            >
                              <LogOut size={16} className="mr-3 text-red-500 group-hover:text-red-600" />
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

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            {isAuthenticated && (
              <div className="mr-4">
                <ProfileAvatar 
                  userProfile={userProfile} 
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                />
              </div>
            )}
            <button
              className="mobile-menu-button text-white focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X size={28} className="text-white" />
              ) : (
                <Menu size={28} className="text-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            ref={mobileMenuRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-orange-600 overflow-hidden"
          >
            <div className="container mx-auto px-4 py-3">
              {!isAuthenticated ? (
                <div className="flex flex-col space-y-4 py-4">
                  <Link 
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center hover:text-orange-secondary transition-colors duration-300 font-medium px-3 py-3 rounded-lg hover:bg-white/10"
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="bg-white text-orange-primary px-6 py-3 rounded-full hover:bg-gray-100 font-medium transition-all duration-300 shadow-md hover:shadow-lg text-center"
                  >
                    Sign Up
                  </Link>
                </div>
              ) : (
                <>
                  <div className="py-4 border-b border-white/20">
                    <div className="flex items-center space-x-3">
                      <ProfileAvatar userProfile={userProfile} />
                      <div>
                        <p className="font-semibold text-lg">
                          {userProfile?.name || 'User'}
                        </p>
                        <p className="text-sm text-white/80 capitalize">
                          {userProfile?.role || 'User'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 py-6">
                    <MobileNavLink 
                      to="/dashboard" 
                      icon={<LayoutDashboard size={24} />}
                      label="Dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                    />
                    <MobileNavLink 
                      to="/home" 
                      icon={<Home size={24} />}
                      label="Home"
                      onClick={() => setMobileMenuOpen(false)}
                    />
                    <MobileNavLink 
                      to="/messages" 
                      icon={<MessageSquare size={24} />}
                      label="Messages"
                      onClick={() => setMobileMenuOpen(false)}
                    />
                    <MobileNavLink 
                      to="/profile" 
                      icon={<User size={24} />}
                      label="Profile"
                      onClick={() => setMobileMenuOpen(false)}
                    />
                    <MobileNavLink 
                      to="/profile/edit" 
                      icon={<Edit3 size={24} />}
                      label="Edit Profile"
                      onClick={() => setMobileMenuOpen(false)}
                    />
                    <MobileNavLink 
                      to="/profile/settings" 
                      icon={<Settings size={24} />}
                      label="Settings"
                      onClick={() => setMobileMenuOpen(false)}
                    />
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center space-x-2 py-4 text-white/90 hover:text-white mt-4 border-t border-white/20"
                  >
                    <LogOut size={20} />
                    <span>Logout</span>
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

// Reusable Components
const ProfileAvatar = ({ 
  userProfile, 
  size = 10,
  onClick
}: { 
  userProfile?: any; 
  size?: number;
  onClick?: () => void;
}) => (
  <div 
    className={`w-${size} h-${size} rounded-full bg-white overflow-hidden border-2 border-white shadow-md flex items-center justify-center cursor-pointer`}
    onClick={onClick}
  >
    {userProfile?.profilePicture ? (
      <img 
        src={userProfile.profilePicture} 
        alt="Profile" 
        className="w-full h-full object-cover"
      />
    ) : (
      <div className="w-full h-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold">
        {userProfile?.name?.charAt(0)?.toUpperCase() || 'U'}
      </div>
    )}
  </div>
);

const NavLink = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => (
  <Link 
    to={to} 
    className="flex flex-col items-center group hover:text-orange-secondary transition-colors duration-200"
  >
    <div className="p-2 rounded-lg group-hover:bg-white/10 transition-colors duration-200">
      {icon}
    </div>
    <span className="text-xs mt-1">{label}</span>
  </Link>
);

const MobileNavLink = ({ 
  to, 
  icon, 
  label,
  onClick
}: { 
  to: string; 
  icon: React.ReactNode; 
  label: string;
  onClick: () => void;
}) => (
  <Link 
    to={to} 
    onClick={onClick}
    className="flex flex-col items-center p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors duration-200"
  >
    <div className="mb-2">{icon}</div>
    <span className="text-sm">{label}</span>
  </Link>
);

const DropdownItem = ({ 
  to, 
  icon, 
  label,
  onClick
}: { 
  to: string; 
  icon: React.ReactNode; 
  label: string;
  onClick: () => void;
}) => (
  <Link
    to={to}
    onClick={onClick}
    className="flex items-center px-4 py-2.5 text-gray-700 hover:bg-orange-50 hover:text-orange-primary transition-colors duration-200 group"
  >
    <span className="text-orange-500 group-hover:text-orange-600 mr-3">
      {icon}
    </span>
    {label}
  </Link>
);

export default Navbar;