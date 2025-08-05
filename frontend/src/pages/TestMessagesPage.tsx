import React, { useState, useEffect } from 'react';
import { messageService } from '../services/messageService';
import ProfileAvatar from '../components/Common/ProfileAvatar';
import type { User, Message, Conversation } from '../services/messageService';

const TestMessagesPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, conversationsData] = await Promise.all([
        messageService.getUsers(),
        messageService.getConversations()
      ]);
      setUsers(usersData);
      setConversations(conversationsData);
      setStatus('Data loaded successfully!');
    } catch (error) {
      console.error('Failed to load data:', error);
      setStatus('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const sendTestMessage = async () => {
    if (!selectedUser || !messageContent.trim()) {
      setStatus('Please select a user and enter a message');
      return;
    }

    try {
      setLoading(true);
      await messageService.sendMessage(selectedUser, messageContent);
      setMessageContent('');
      setStatus('Message sent successfully!');
      await loadData(); // Refresh data
    } catch (error) {
      console.error('Failed to send message:', error);
      setStatus('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (userId: string) => {
    try {
      setLoading(true);
      const messagesData = await messageService.getMessages(userId);
      setMessages(messagesData);
      setStatus(`Loaded ${messagesData.length} messages`);
    } catch (error) {
      console.error('Failed to load messages:', error);
      setStatus('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Message System Test</h1>
        
        {/* Status */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-blue-800">
            Status: {loading ? 'Loading...' : status}
          </p>
        </div>

        {/* Send Message Test */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Send Test Message</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select User:
              </label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
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
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Enter test message..."
                className="w-full p-3 border border-gray-300 rounded-lg h-24"
              />
            </div>
            <button
              onClick={sendTestMessage}
              disabled={loading}
              className="bg-orange-primary text-white px-6 py-3 rounded-lg hover:bg-orange-secondary disabled:opacity-50"
            >
              Send Test Message
            </button>
          </div>
        </div>

        {/* Users List */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Available Users ({users.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {users.map((user) => (
              <div key={user.id} className="p-3 border border-gray-200 rounded-lg flex items-start space-x-3">
                <ProfileAvatar 
                  name={user.name}
                  profilePicture={user.profilePicture}
                  size="md"
                />
                <div className="flex-1">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <p className="text-sm text-gray-500 capitalize">{user.role}</p>
                  <button
                    onClick={() => loadMessages(user.id)}
                    className="mt-2 text-orange-primary hover:text-orange-secondary text-sm"
                  >
                    Load Messages
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Conversations */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Conversations ({conversations.length})</h2>
          <div className="space-y-3">
            {conversations.map((conversation, index) => (
              <div key={index} className="p-3 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-3">
                    <ProfileAvatar 
                      name={conversation.partner.name}
                      profilePicture={conversation.partner.profilePicture}
                      size="md"
                    />
                    <div>
                      <p className="font-medium">{conversation.partner.name}</p>
                      <p className="text-sm text-gray-600 capitalize">{conversation.partner.role}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(conversation.lastMessage.createdAt).toLocaleString()}
                  </p>
                </div>
                <p className="text-sm text-gray-700 mt-2">
                  Last: {conversation.lastMessage.content}
                </p>
                <button
                  onClick={() => loadMessages(conversation.partner.id)}
                  className="mt-2 text-orange-primary hover:text-orange-secondary text-sm"
                >
                  View Messages ({conversation.messages.length})
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Messages */}
        {messages.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Messages ({messages.length})</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-3 rounded-lg ${
                    message.senderId === localStorage.getItem('userId')
                      ? 'bg-orange-100 ml-8'
                      : 'bg-gray-100 mr-8'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      <ProfileAvatar 
                        name={message.sender.name}
                        profilePicture={message.sender.profilePicture}
                        size="sm"
                      />
                      <p className="font-medium text-sm">
                        {message.sender.name} ({message.sender.role})
                      </p>
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(message.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <p className="text-gray-800">{message.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestMessagesPage;