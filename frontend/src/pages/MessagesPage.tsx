import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { messageService } from '../services/messageService';
import ProfileAvatar from '../components/Common/ProfileAvatar';
import type { User, Message, Conversation } from '../services/messageService';

const MessagesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = localStorage.getItem('userId');

  useEffect(() => {
    fetchConversations();
    fetchUsers();
    
    // Check if there's a user parameter in the URL
    const userParam = searchParams.get('user');
    if (userParam) {
      setSelectedConversation(userParam);
      fetchMessages(userParam);
    }
  }, [searchParams]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const conversations = await messageService.getConversations();
      setConversations(conversations);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const users = await messageService.getUsers();
      setUsers(users);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchMessages = async (userId: string) => {
    try {
      const messages = await messageService.getMessages(userId);
      setMessages(messages);
      setSelectedConversation(userId);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const message = await messageService.sendMessage(selectedConversation, newMessage);
      setMessages([...messages, message]);
      setNewMessage('');
      fetchConversations(); // Refresh conversations to update last message
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const startNewConversation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    try {
      await messageService.sendMessage(selectedUser, newMessage);
      setShowNewMessageModal(false);
      setSelectedUser('');
      setNewMessage('');
      fetchConversations();
      fetchMessages(selectedUser);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const editMessage = async (messageId: string) => {
    if (!editContent.trim()) return;

    try {
      const updatedMessage = await messageService.editMessage(messageId, editContent);
      setMessages(messages.map(msg => msg.id === messageId ? updatedMessage : msg));
      setEditingMessage(null);
      setEditContent('');
    } catch (error) {
      console.error('Failed to edit message:', error);
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      await messageService.deleteMessage(messageId);
      setMessages(messages.filter(msg => msg.id !== messageId));
      fetchConversations(); // Refresh conversations
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="bg-white rounded-xl shadow-lg overflow-hidden"
        style={{ height: 'calc(100vh - 120px)' }}
      >
        <div className="flex h-full">
          {/* Conversations Sidebar */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-orange-50">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">Messages</h2>
                <button
                  onClick={() => setShowNewMessageModal(true)}
                  className="bg-orange-primary text-white p-2 rounded-full hover:bg-orange-secondary transition-colors"
                  title="New Message"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p>No conversations yet</p>
                  <p className="text-sm">Start a new conversation!</p>
                </div>
              ) : (
                conversations.map((conversation) => (
                  <div
                    key={conversation.partner.id}
                    onClick={() => fetchMessages(conversation.partner.id)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedConversation === conversation.partner.id ? 'bg-orange-50 border-orange-200' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <ProfileAvatar 
                        name={conversation.partner.name}
                        profilePicture={conversation.partner.profilePicture}
                        size="lg"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-gray-900 truncate">{conversation.partner.name}</h3>
                          <span className="text-xs text-gray-500">{formatTime(conversation.lastMessage.createdAt)}</span>
                        </div>
                        <p className="text-sm text-gray-600 capitalize">{conversation.partner.role}</p>
                        <p className="text-sm text-gray-500 truncate mt-1">
                          {conversation.lastMessage.senderId === currentUserId ? 'You: ' : ''}
                          {conversation.lastMessage.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Messages Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  {(() => {
                    const partner = conversations.find(c => c.partner.id === selectedConversation)?.partner;
                    return partner ? (
                      <div className="flex items-center space-x-3">
                        <ProfileAvatar 
                          name={partner.name}
                          profilePicture={partner.profilePicture}
                          size="md"
                        />
                        <div>
                          <h3 className="font-medium text-gray-900">{partner.name}</h3>
                          <p className="text-sm text-gray-600 capitalize">{partner.role}</p>
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'} mb-4`}
                    >
                      {message.senderId !== currentUserId && (
                        <ProfileAvatar 
                          name={message.sender.name}
                          profilePicture={message.sender.profilePicture}
                          size="sm"
                          className="mr-2 mt-1"
                        />
                      )}
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.senderId === currentUserId
                            ? 'bg-orange-primary text-white'
                            : 'bg-gray-200 text-gray-800'
                        }`}
                      >
                        {editingMessage === message.id ? (
                          <div className="space-y-2">
                            <textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="w-full p-2 text-gray-800 bg-white rounded resize-none"
                              rows={2}
                            />
                            <div className="flex space-x-2">
                              <button
                                onClick={() => editMessage(message.id)}
                                className="text-xs bg-green-500 text-white px-2 py-1 rounded"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => {
                                  setEditingMessage(null);
                                  setEditContent('');
                                }}
                                className="text-xs bg-gray-500 text-white px-2 py-1 rounded"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p>{message.content}</p>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-xs opacity-75">{formatTime(message.createdAt)}</span>
                              {message.senderId === currentUserId && (
                                <div className="flex space-x-1">
                                  <button
                                    onClick={() => {
                                      setEditingMessage(message.id);
                                      setEditContent(message.content);
                                    }}
                                    className="text-xs opacity-75 hover:opacity-100"
                                    title="Edit"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    onClick={() => deleteMessage(message.id)}
                                    className="text-xs opacity-75 hover:opacity-100"
                                    title="Delete"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={sendMessage} className="p-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
                    />
                    <button
                      type="submit"
                      className="bg-orange-primary text-white px-6 py-3 rounded-lg hover:bg-orange-secondary transition-colors"
                    >
                      Send
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-lg">Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* New Message Modal */}
      <AnimatePresence>
        {showNewMessageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowNewMessageModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold mb-4">New Message</h3>
              <form onSubmit={startNewConversation} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Send to:</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message:</label>
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-primary h-24 resize-none"
                    required
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-orange-primary text-white py-3 rounded-lg hover:bg-orange-secondary transition-colors"
                  >
                    Send Message
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewMessageModal(false);
                      setSelectedUser('');
                      setNewMessage('');
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MessagesPage;