import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { messageService } from '../services/messageService';
import ProfileAvatar from '../components/Common/ProfileAvatar';
import type { User, Message, Conversation } from '../services/messageService';
import { 
  ArrowLeft, Plus, Send, Edit, Trash2, 
  X, MessageCircle, Search, Menu, ChevronDown, User as UserIcon, AlertTriangle
} from 'lucide-react';

const MessagesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedUserData, setSelectedUserData] = useState<User | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = localStorage.getItem('userId');

  useEffect(() => {
    fetchConversations();
    fetchUsers();
    
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
      if (window.innerWidth < 768) setShowSidebar(false);
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
      fetchConversations();
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
      setSelectedUserData(null);
      setUserSearchTerm('');
      setIsDropdownOpen(false);
      setNewMessage('');
      fetchConversations();
      fetchMessages(selectedUser);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user.id);
    setSelectedUserData(user);
    setUserSearchTerm(user.name);
    setIsDropdownOpen(false);
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

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
    setMessageToDelete(messageId);
    setShowDeleteModal(true);
  };

  const confirmDeleteMessage = async () => {
    if (!messageToDelete) return;

    try {
      await messageService.deleteMessage(messageToDelete);
      setMessages(messages.filter(msg => msg.id !== messageToDelete));
      fetchConversations();
      setShowDeleteModal(false);
      setMessageToDelete(null);
    } catch (error) {
      console.error('Failed to delete message:', error);
      setShowDeleteModal(false);
      setMessageToDelete(null);
    }
  };

  const cancelDeleteMessage = () => {
    setShowDeleteModal(false);
    setMessageToDelete(null);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    // Same day - just show time
    if (diffInDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    }
    // Yesterday
    else if (diffInDays === 1) {
      return `Yesterday ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}`;
    }
    // This week (2-6 days ago)
    else if (diffInDays < 7) {
      return `${date.toLocaleDateString([], { weekday: 'long' })} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}`;
    }
    // This year - show date without year
    else if (date.getFullYear() === now.getFullYear()) {
      return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}`;
    }
    // Different year - show full date
    else {
      return `${date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}`;
    }
  };

  // WhatsApp-style time formatting for individual messages
  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  // Format date for separators (WhatsApp style)
  const formatDateSeparator = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return date.toLocaleDateString([], { weekday: 'long' });
    } else if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], { month: 'long', day: 'numeric' });
    } else {
      return date.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
    }
  };

  // Check if we need to show a date separator
  const shouldShowDateSeparator = (currentMessage: Message, previousMessage: Message | null) => {
    if (!previousMessage) return true;
    
    const currentDate = new Date(currentMessage.createdAt).toDateString();
    const previousDate = new Date(previousMessage.createdAt).toDateString();
    
    return currentDate !== previousDate;
  };

  const filteredConversations = conversations.filter(conversation => 
    conversation.partner.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-2 sm:p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="bg-white rounded-2xl shadow-xl overflow-hidden"
        style={{ height: 'calc(100vh - 120px)' }}
      >
        <div className="flex h-full">
          {/* Conversations Sidebar - Mobile Toggle */}
          <div className="md:hidden absolute top-4 left-4 z-10">
            <button
              onClick={() => setShowSidebar(true)}
              className="bg-orange-500 text-white p-2 rounded-full shadow-lg"
            >
              <Menu size={20} />
            </button>
          </div>

          {/* Conversations Sidebar */}
          <AnimatePresence>
            {(showSidebar || window.innerWidth >= 768) && (
              <motion.div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: 'spring', damping: 25 }}
                className="w-full md:w-1/3 lg:w-96 border-r border-gray-200 flex flex-col absolute md:relative z-20 bg-white h-full shadow-lg md:shadow-none"
              >
                {/* Header */}
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-amber-50">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <button 
                        onClick={() => setShowSidebar(false)} 
                        className="md:hidden mr-3 text-gray-600"
                      >
                        <ArrowLeft size={20} />
                      </button>
                      <h2 className="text-xl font-bold text-gray-800 flex items-center">
                        <MessageCircle className="text-orange-500 mr-2" size={24} />
                        Messages
                      </h2>
                    </div>
                    <button
                      onClick={() => setShowNewMessageModal(true)}
                      className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-2 rounded-full hover:from-orange-600 hover:to-amber-600 transition-all shadow-md"
                      title="New Message"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                  
                  <div className="mt-4 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="text-gray-400" size={18} />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search conversations..."
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300"
                    />
                  </div>
                </div>

                {/* Conversations List */}
                <div className="flex-1 overflow-y-auto">
                  {filteredConversations.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                      <MessageCircle className="w-16 h-16 mb-4 text-gray-300" />
                      <p className="text-lg font-medium mb-1">No conversations yet</p>
                      <p className="mb-6">Start a new conversation!</p>
                      <button
                        onClick={() => setShowNewMessageModal(true)}
                        className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-2.5 rounded-full font-medium hover:from-orange-600 hover:to-amber-600 transition-all"
                      >
                        New Message
                      </button>
                    </div>
                  ) : (
                    filteredConversations.map((conversation) => (
                      <div
                        key={conversation.partner.id}
                        onClick={() => fetchMessages(conversation.partner.id)}
                        className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                          selectedConversation === conversation.partner.id 
                            ? 'bg-orange-50 border-orange-200' 
                            : 'hover:bg-gray-50'
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
                              <h3 className="font-semibold text-gray-900 truncate">{conversation.partner.name}</h3>
                              <span className="text-xs text-gray-500 whitespace-nowrap">
                                {formatTime(conversation.lastMessage.createdAt)}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full inline-block capitalize">
                              {conversation.partner.role}
                            </p>
                            <p className="text-sm text-gray-600 truncate mt-1">
                              {conversation.lastMessage.senderId === currentUserId ? (
                                <span className="font-medium text-orange-600">You: </span>
                              ) : null}
                              {conversation.lastMessage.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Messages Area */}
          <div className={`flex-1 flex flex-col ${!selectedConversation ? 'hidden md:flex' : ''}`}>
            {selectedConversation ? (
              <>
                {/* Messages Header */}
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-amber-50 flex items-center">
                  <button 
                    onClick={() => {
                      setSelectedConversation(null);
                      if (window.innerWidth < 768) setShowSidebar(true);
                    }} 
                    className="md:hidden mr-3 text-gray-600"
                  >
                    <ArrowLeft size={20} />
                  </button>
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
                          <h3 className="font-semibold text-gray-900">{partner.name}</h3>
                          <p className="text-xs text-gray-600 capitalize">{partner.role}</p>
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-white to-orange-50">
                  <div className="max-w-3xl mx-auto">
                    {messages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center py-12">
                        <MessageCircle className="w-16 h-16 mb-4 text-orange-200" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No messages yet</h3>
                        <p className="text-gray-500 mb-6">
                          Start the conversation by sending your first message
                        </p>
                      </div>
                    ) : (
                      messages.map((message, index) => (
                        <div key={message.id}>
                          {/* Date Separator */}
                          {shouldShowDateSeparator(message, index > 0 ? messages[index - 1] : null) && (
                            <div className="flex justify-center my-4">
                              <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                                {formatDateSeparator(message.createdAt)}
                              </div>
                            </div>
                          )}
                          
                          {/* Message */}
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex mb-6 ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
                          >
                          {message.senderId !== currentUserId && (
                            <ProfileAvatar 
                              name={message.sender.name}
                              profilePicture={message.sender.profilePicture}
                              size="sm"
                              className="mr-2 mt-1"
                            />
                          )}
                          <div className="max-w-[80%]">
                            <motion.div
                              className={`px-4 py-3 rounded-2xl ${
                                message.senderId === currentUserId
                                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-br-none'
                                  : 'bg-gray-100 text-gray-800 rounded-bl-none'
                              }`}
                            >
                              {editingMessage === message.id ? (
                                <div className="space-y-2">
                                  <textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="w-full p-2 text-gray-800 bg-white rounded-xl resize-none"
                                    rows={2}
                                    autoFocus
                                  />
                                  <div className="flex space-x-2 justify-end">
                                    <button
                                      onClick={() => {
                                        setEditingMessage(null);
                                        setEditContent('');
                                      }}
                                      className="text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded-lg"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={() => editMessage(message.id)}
                                      className="text-sm bg-gradient-to-r from-orange-500 to-amber-500 text-white px-3 py-1 rounded-lg"
                                    >
                                      Save
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <p className="break-words">{message.content}</p>
                                  <div className="flex justify-between items-center mt-1">
                                    <span className={`text-xs ${message.senderId === currentUserId ? 'text-orange-100' : 'text-gray-500'}`}>
                                      {formatMessageTime(message.createdAt)}
                                    </span>
                                    {message.senderId === currentUserId && (
                                      <div className="flex space-x-2 ml-3">
                                        <button
                                          onClick={() => {
                                            setEditingMessage(message.id);
                                            setEditContent(message.content);
                                          }}
                                          className={`${message.senderId === currentUserId ? 'text-orange-100 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                                          title="Edit"
                                        >
                                          <Edit size={16} />
                                        </button>
                                        <button
                                          onClick={() => deleteMessage(message.id)}
                                          className={`${message.senderId === currentUserId ? 'text-orange-100 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                                          title="Delete"
                                        >
                                          <Trash2 size={16} />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </>
                              )}
                            </motion.div>
                          </div>
                        </motion.div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Message Input */}
                <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className={`p-3 rounded-xl transition-all flex items-center justify-center ${
                        newMessage.trim()
                          ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 shadow-md'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <Send size={20} />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8 text-center">
                <div className="bg-gradient-to-r from-orange-100 to-amber-100 rounded-full p-6 mb-6">
                  <MessageCircle className="w-16 h-16 mx-auto text-orange-300" />
                </div>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">Select a conversation</h3>
                <p className="text-gray-600 max-w-md mb-6">
                  Choose an existing conversation or start a new one to begin messaging
                </p>
                <button
                  onClick={() => setShowNewMessageModal(true)}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-full font-medium hover:from-orange-600 hover:to-amber-600 transition-all flex items-center shadow-lg"
                >
                  <Plus className="mr-2" size={20} />
                  New Message
                </button>
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
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => {
              setShowNewMessageModal(false);
              setSelectedUser('');
              setSelectedUserData(null);
              setUserSearchTerm('');
              setIsDropdownOpen(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">New Message</h3>
                <button
                  onClick={() => {
                    setShowNewMessageModal(false);
                    setSelectedUser('');
                    setSelectedUserData(null);
                    setUserSearchTerm('');
                    setIsDropdownOpen(false);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={startNewConversation} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Send to:</label>
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
                          <span className="flex-1">Select a user</span>
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
                                value={userSearchTerm}
                                onChange={(e) => setUserSearchTerm(e.target.value)}
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
                                {userSearchTerm ? 'No users found matching your search' : 'No users available'}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message:</label>
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 h-32 resize-none"
                    required
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3 rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all font-medium"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={cancelDeleteMessage}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-gray-100"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Warning Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="text-red-500" size={32} />
                </div>
              </div>

              {/* Title and Message */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Message</h3>
                <p className="text-gray-600 leading-relaxed">
                  Are you sure you want to delete this message? This action cannot be undone.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={cancelDeleteMessage}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={confirmDeleteMessage}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium hover:from-red-600 hover:to-red-700 transition-all shadow-lg"
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MessagesPage;