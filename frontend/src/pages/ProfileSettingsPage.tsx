import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import DeleteAccountModal from '../components/DeleteAccountModal';
import PasswordInput from '../components/PasswordInput';

const ProfileSettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('account');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Account settings
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSettings = async () => {
      if (!token) {
        console.log('No token found, redirecting to login');
        navigate('/login');
        return;
      }

      try {
        console.log('Fetching settings with token:', token?.substring(0, 20) + '...');
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/profile/settings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('Settings response:', response.data);
        const settings = response.data;
        setEmail(settings.email || '');
      } catch (err: any) {
        console.error('Failed to fetch settings:', err);
        if (err.response?.status === 401) {
          localStorage.clear();
          navigate('/login');
        }
      }
    };

    fetchSettings();
  }, [token, navigate]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('Changing password...');
      await axios.put(`${import.meta.env.VITE_API_URL}/auth/change-password`, {
        currentPassword,
        newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      console.log('Password changed successfully');
    } catch (err: any) {
      console.error('Password change error:', err);
      setError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Deleting account...');
      await axios.delete(`${import.meta.env.VITE_API_URL}/profile/delete`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Account deleted successfully');
      localStorage.clear();
      navigate('/');
    } catch (err: any) {
      console.error('Delete account error:', err);
      setError(err.response?.data?.error || 'Failed to delete account');
      setShowDeleteModal(false);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'account', name: 'Account', icon: '👤' },
    { id: 'danger', name: 'Danger Zone', icon: '⚠️' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-4xl mx-auto mt-4 md:mt-10 p-4 md:p-8"
    >
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-orange-primary to-orange-secondary p-4 md:p-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Profile Settings</h1>
          <p className="text-orange-100 mt-2 text-sm md:text-base">Manage your account preferences</p>
        </div>

        {/* Mobile Tab Navigation */}
        <div className="md:hidden bg-gray-50 px-4 py-3">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 rounded-lg whitespace-nowrap transition duration-200 ${
                  activeTab === tab.id
                    ? 'bg-orange-primary text-white'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2 text-sm">{tab.icon}</span>
                <span className="text-sm">{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row">
          {/* Desktop Sidebar */}
          <div className="hidden md:block w-1/4 bg-gray-50 p-6">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition duration-200 ${
                    activeTab === tab.id
                      ? 'bg-orange-primary text-white'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="mr-3 text-lg">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 md:p-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 md:mb-6 text-sm md:text-base">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 md:mb-6 text-sm md:text-base">
                {success}
              </div>
            )}

            {/* Account Tab */}
            {activeTab === 'account' && (
              <div className="space-y-4 md:space-y-6">
                <h2 className="text-xl md:text-2xl font-semibold text-gray-800">Account Settings</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full p-3 text-sm md:text-base border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                  />
                  <p className="text-xs md:text-sm text-gray-500 mt-1">Email cannot be changed. Contact support if needed.</p>
                </div>

                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-800">Change Password</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full p-3 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
                      required
                    />
                  </div>

                  <PasswordInput
                    label="New Password"
                    value={newPassword}
                    onChange={setNewPassword}
                    required
                  />

                  <PasswordInput
                    label="Confirm New Password"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    required
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full md:w-auto bg-orange-primary text-white px-6 py-3 rounded-lg hover:bg-orange-secondary transition duration-300 font-semibold disabled:opacity-50 text-sm md:text-base"
                  >
                    {loading ? 'Changing...' : 'Change Password'}
                  </button>
                </form>
              </div>
            )}

            {/* Danger Zone Tab */}
            {activeTab === 'danger' && (
              <div className="space-y-4 md:space-y-6">
                <h2 className="text-xl md:text-2xl font-semibold text-gray-800">Danger Zone</h2>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 md:p-6">
                  <h3 className="text-lg font-semibold text-red-800 mb-2">Delete Account</h3>
                  <p className="text-red-700 mb-4 text-sm md:text-base">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="w-full md:w-auto bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition duration-300 font-semibold text-sm md:text-base"
                  >
                    Delete My Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        loading={loading}
      />
    </motion.div>
  );
};

export default ProfileSettingsPage;