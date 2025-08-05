import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

const ProfileSettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('account');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  // Account settings
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Privacy settings
  const [profileVisibility, setProfileVisibility] = useState('public');
  const [showEmail, setShowEmail] = useState(false);
  const [allowMessages, setAllowMessages] = useState(true);
  const [allowConnections, setAllowConnections] = useState(true);
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(true);
  const [connectionNotifications, setConnectionNotifications] = useState(true);
  const [postNotifications, setPostNotifications] = useState(false);
  
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/profile/settings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const settings = response.data;
        setEmail(settings.email || '');
        setProfileVisibility(settings.profileVisibility || 'public');
        setShowEmail(settings.showEmail || false);
        setAllowMessages(settings.allowMessages !== false);
        setAllowConnections(settings.allowConnections !== false);
        setEmailNotifications(settings.emailNotifications !== false);
        setMessageNotifications(settings.messageNotifications !== false);
        setConnectionNotifications(settings.connectionNotifications !== false);
        setPostNotifications(settings.postNotifications || false);
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      }
    };

    fetchSettings();
  }, [token]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
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
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handlePrivacyUpdate = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/profile/privacy`, {
        profileVisibility,
        showEmail,
        allowMessages,
        allowConnections
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('Privacy settings updated successfully');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update privacy settings');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationUpdate = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/profile/notifications`, {
        emailNotifications,
        messageNotifications,
        connectionNotifications,
        postNotifications
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('Notification settings updated successfully');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update notification settings');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/profile/delete`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        localStorage.clear();
        navigate('/');
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to delete account');
      }
    }
  };

  const tabs = [
    { id: 'account', name: 'Account', icon: '👤' },
    { id: 'privacy', name: 'Privacy', icon: '🔒' },
    { id: 'notifications', name: 'Notifications', icon: '🔔' },
    { id: 'danger', name: 'Danger Zone', icon: '⚠️' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-4xl mx-auto mt-10 p-8"
    >
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-orange-primary to-orange-secondary p-6">
          <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
          <p className="text-orange-100 mt-2">Manage your account preferences and privacy settings</p>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="w-1/4 bg-gray-50 p-6">
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
          <div className="flex-1 p-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
                {success}
              </div>
            )}

            {/* Account Tab */}
            {activeTab === 'account' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-800">Account Settings</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">Email cannot be changed. Contact support if needed.</p>
                </div>

                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-800">Change Password</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-orange-primary text-white px-6 py-3 rounded-lg hover:bg-orange-secondary transition duration-300 font-semibold disabled:opacity-50"
                  >
                    {loading ? 'Changing...' : 'Change Password'}
                  </button>
                </form>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-800">Privacy Settings</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Profile Visibility</label>
                  <select
                    value={profileVisibility}
                    onChange={(e) => setProfileVisibility(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
                  >
                    <option value="public">Public - Anyone can view your profile</option>
                    <option value="connections">Connections Only - Only your connections can view</option>
                    <option value="private">Private - Only you can view your profile</option>
                  </select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-800">Show Email Address</h3>
                      <p className="text-sm text-gray-600">Allow others to see your email address</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showEmail}
                        onChange={(e) => setShowEmail(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-800">Allow Messages</h3>
                      <p className="text-sm text-gray-600">Allow others to send you messages</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={allowMessages}
                        onChange={(e) => setAllowMessages(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-800">Allow Connection Requests</h3>
                      <p className="text-sm text-gray-600">Allow others to send you connection requests</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={allowConnections}
                        onChange={(e) => setAllowConnections(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-primary"></div>
                    </label>
                  </div>
                </div>

                <button
                  onClick={handlePrivacyUpdate}
                  disabled={loading}
                  className="bg-orange-primary text-white px-6 py-3 rounded-lg hover:bg-orange-secondary transition duration-300 font-semibold disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Privacy Settings'}
                </button>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-800">Notification Settings</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-800">Email Notifications</h3>
                      <p className="text-sm text-gray-600">Receive notifications via email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={emailNotifications}
                        onChange={(e) => setEmailNotifications(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-800">Message Notifications</h3>
                      <p className="text-sm text-gray-600">Get notified when you receive messages</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={messageNotifications}
                        onChange={(e) => setMessageNotifications(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-800">Connection Notifications</h3>
                      <p className="text-sm text-gray-600">Get notified about connection requests</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={connectionNotifications}
                        onChange={(e) => setConnectionNotifications(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-800">Post Notifications</h3>
                      <p className="text-sm text-gray-600">Get notified about new posts from connections</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={postNotifications}
                        onChange={(e) => setPostNotifications(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-primary"></div>
                    </label>
                  </div>
                </div>

                <button
                  onClick={handleNotificationUpdate}
                  disabled={loading}
                  className="bg-orange-primary text-white px-6 py-3 rounded-lg hover:bg-orange-secondary transition duration-300 font-semibold disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Notification Settings'}
                </button>
              </div>
            )}

            {/* Danger Zone Tab */}
            {activeTab === 'danger' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-800">Danger Zone</h2>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-red-800 mb-2">Delete Account</h3>
                  <p className="text-red-700 mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <button
                    onClick={handleDeleteAccount}
                    className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition duration-300 font-semibold"
                  >
                    Delete My Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileSettingsPage;