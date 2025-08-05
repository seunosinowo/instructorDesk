import React, { useState, useEffect } from 'react';
import { messageService } from '../../services/messageService';
import type { User } from '../../services/messageService';

interface QuickMessageProps {
  onMessageSent?: () => void;
}

const QuickMessage: React.FC<QuickMessageProps> = ({ onMessageSent }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const users = await messageService.getUsers();
      setUsers(users);
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

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-semibold text-orange-primary mb-4">Send Quick Message</h3>
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSendMessage} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Send to:
          </label>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
            required
          >
            <option value="">Select a user</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.role})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message:
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-primary h-24 resize-none"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading || !selectedUser || !message.trim()}
          className="w-full bg-orange-primary text-white py-3 rounded-lg hover:bg-orange-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
};

export default QuickMessage;