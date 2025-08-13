import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User as UserIcon, Send, ChevronDown, Search } from 'lucide-react';
import { messageService } from '../../services/messageService';
import type { User } from '../../services/messageService';
import { cache } from '../../utils/cache';

interface QuickMessageProps {
  onMessageSent?: () => void;
}

const QuickMessage: React.FC<QuickMessageProps> = ({ onMessageSent }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedUserData, setSelectedUserData] = useState<User | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Check cache first
    const cachedUsers = cache.get<User[]>('message-users');
    if (cachedUsers) {
      setUsers(cachedUsers);
    } else if (users.length === 0) {
      fetchUsers();
    }
  }, []);

  const fetchUsers = async () => {
    try {
      const users = await messageService.getUsers();
      console.log('Fetched users:', users);
      setUsers(users);
      // Cache users for 5 minutes
      cache.set('message-users', users, 5);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setError('Failed to load users');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !message.trim()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await messageService.sendMessage(selectedUser, message);
      setMessage('');
      setSelectedUser('');
      setSelectedUserData(null);
      setSearchTerm('');
      setIsDropdownOpen(false);
      setSuccess('Message sent successfully!');
      onMessageSent?.();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user.id);
    setSelectedUserData(user);
    setSearchTerm(user.name);
    setIsDropdownOpen(false);
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl shadow-xl p-6 border border-orange-100"
    >
      <div className="flex items-center mb-6">
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-3 rounded-xl mr-4">
          <Send className="text-white" size={24} />
        </div>
        <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
          Send Quick Message
        </h3>
      </div>
      
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center"
          >
            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
            {success}
          </motion.div>
        )}
        
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center"
          >
            <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSendMessage} className="space-y-6">
        {/* Enhanced User Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Send to:
          </label>
          <div className="relative">
            <div
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 cursor-pointer hover:border-orange-300 transition-all bg-gray-50 hover:bg-white"
            >
              {selectedUserData ? (
                <div className="flex items-center">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-orange-200 mr-3">
                      {selectedUserData.profilePicture ? (
                        <img 
                          src={selectedUserData.profilePicture} 
                          alt={selectedUserData.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold text-xs">
                          {selectedUserData.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                      selectedUserData.role === 'teacher' ? 'bg-blue-500' : 'bg-green-500'
                    }`}></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-800 truncate">{selectedUserData.name}</div>
                    <div className="text-sm text-gray-500 capitalize">• {selectedUserData.role}</div>
                  </div>
                  <ChevronDown 
                    className={`text-gray-400 transition-transform ml-2 ${isDropdownOpen ? 'rotate-180' : ''}`} 
                    size={18} 
                  />
                </div>
              ) : (
                <div className="flex items-center text-gray-500">
                  <UserIcon className="mr-3" size={18} />
                  <span className="flex-1">Select a user to message</span>
                  <ChevronDown 
                    className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
                    size={18} 
                  />
                </div>
              )}
            </div>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-64 overflow-hidden"
                >
                  {/* Search Input */}
                  <div className="p-3 border-b border-gray-100">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                      />
                    </div>
                  </div>

                  {/* User List */}
                  <div className="max-h-48 overflow-y-auto">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <motion.div
                          key={user.id}
                          whileHover={{ backgroundColor: '#FFF7ED' }}
                          onClick={() => handleUserSelect(user)}
                          className="p-3 cursor-pointer hover:bg-orange-50 transition-colors flex items-center"
                        >
                          <div className="relative">
                            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-gray-200 mr-3">
                              {user.profilePicture ? (
                                <img 
                                  src={user.profilePicture} 
                                  alt={user.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold text-xs">
                                  {user.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                              user.role === 'teacher' ? 'bg-blue-500' : 'bg-green-500'
                            }`}></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-800 truncate">{user.name}</div>
                            <div className="text-sm text-gray-500 capitalize">• {user.role}</div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        {searchTerm ? 'No users found matching your search' : 'No users available'}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Message Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Message:
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 h-32 resize-none transition-all hover:border-orange-300"
            required
          />
          <div className="text-right text-sm text-gray-400 mt-1">
            {message.length}/500
          </div>
        </div>

        {/* Send Button */}
        <motion.button
          type="submit"
          disabled={loading || !selectedUser || !message.trim()}
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          className={`w-full py-4 rounded-xl font-semibold text-white transition-all flex items-center justify-center ${
            loading || !selectedUser || !message.trim()
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg hover:shadow-xl'
          }`}
        >
          <Send className="mr-2" size={18} />
          {loading ? 'Sending...' : 'Send Message'}
        </motion.button>
      </form>

      {/* User Count Info */}
      <div className="mt-6 p-3 bg-gray-50 rounded-xl">
        <div className="text-sm text-gray-600 text-center">
          {users.length > 0 ? (
            <>
              <span className="font-semibold text-orange-600">{users.length}</span> users available to message
            </>
          ) : (
            'Loading users...'
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default QuickMessage;