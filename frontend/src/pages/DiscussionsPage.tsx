import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  MessageSquare,
  Plus,
  Search,
  Filter,
  TrendingUp,
  Clock,
  Eye,
  ThumbsUp,
  MessageCircle,
  User,
  Calendar,
  Tag,
  ChevronRight
} from 'lucide-react';

interface Discussion {
  id: string;
  title: string;
  content: string;
  category: 'general' | 'academic' | 'career' | 'resources' | 'events' | 'other';
  userId: string;
  isPinned: boolean;
  isClosed: boolean;
  viewCount: number;
  upvoteCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    profilePicture?: string;
    role: string;
  };
}

const DiscussionsPage: React.FC = () => {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [filteredDiscussions, setFilteredDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const discussionsPerPage = 10;

  const categories = [
    { value: 'all', label: 'All Discussions', icon: MessageSquare },
    { value: 'general', label: 'General', icon: MessageSquare },
    { value: 'academic', label: 'Academic', icon: TrendingUp },
    { value: 'career', label: 'Career', icon: User },
    { value: 'resources', label: 'Resources', icon: Tag },
    { value: 'events', label: 'Events', icon: Calendar },
    { value: 'other', label: 'Other', icon: MessageSquare }
  ];

  const sortOptions = [
    { value: 'createdAt', label: 'Latest' },
    { value: 'upvoteCount', label: 'Most Upvoted' },
    { value: 'commentCount', label: 'Most Comments' },
    { value: 'viewCount', label: 'Most Viewed' }
  ];

  useEffect(() => {
    fetchDiscussions();
  }, [currentPage, selectedCategory, sortBy]);

  useEffect(() => {
    let filtered = discussions;

    if (searchTerm) {
      filtered = filtered.filter(discussion =>
        discussion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        discussion.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredDiscussions(filtered);
  }, [discussions, searchTerm]);

  const fetchDiscussions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/discussions`, {
        params: {
          page: currentPage,
          limit: discussionsPerPage,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          sortBy,
          sortOrder: 'DESC'
        }
      });

      setDiscussions(response.data.discussions);
      setFilteredDiscussions(response.data.discussions);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching discussions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (discussionId: string) => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/discussions/${discussionId}/upvote`,
        {},
        { headers }
      );

      // Update the discussion in the local state
      setDiscussions(prevDiscussions =>
        prevDiscussions.map(discussion =>
          discussion.id === discussionId
            ? { ...discussion, upvoteCount: response.data.upvoteCount }
            : discussion
        )
      );

      setFilteredDiscussions(prevFiltered =>
        prevFiltered.map(discussion =>
          discussion.id === discussionId
            ? { ...discussion, upvoteCount: response.data.upvoteCount }
            : discussion
        )
      );
    } catch (error) {
      console.error('Error upvoting discussion:', error);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'general': return 'bg-gray-100 text-gray-800';
      case 'academic': return 'bg-blue-100 text-blue-800';
      case 'career': return 'bg-green-100 text-green-800';
      case 'resources': return 'bg-purple-100 text-purple-800';
      case 'events': return 'bg-orange-100 text-orange-800';
      case 'other': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const discussionDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - discussionDate.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return discussionDate.toLocaleDateString();
  };

  const DiscussionCard: React.FC<{ discussion: Discussion; index: number }> = ({ discussion, index }) => {
    const categoryInfo = categories.find(cat => cat.value === discussion.category);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-orange-100 overflow-hidden group ${
          discussion.isPinned ? 'ring-2 ring-orange-300' : ''
        }`}
      >
        {discussion.isPinned && (
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 text-sm font-medium flex items-center">
            <TrendingUp size={16} className="mr-2" />
            Pinned Discussion
          </div>
        )}

        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <Link
                to={`/discussions/${discussion.id}`}
                className="text-xl font-bold text-gray-900 hover:text-orange-600 transition-colors line-clamp-2 group-hover:text-orange-600"
              >
                {discussion.title}
              </Link>

              <div className="flex items-center space-x-4 mt-3 text-sm text-gray-600">
                <div className="flex items-center">
                  <User size={14} className="mr-1" />
                  <span>{discussion.user.name}</span>
                </div>
                <div className="flex items-center">
                  <Clock size={14} className="mr-1" />
                  <span>{formatTimeAgo(discussion.createdAt)}</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(discussion.category)}`}>
                  {categoryInfo?.label || discussion.category}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-1 ml-4">
              <button
                onClick={() => handleUpvote(discussion.id)}
                className="flex items-center space-x-1 text-gray-600 hover:text-orange-600 transition-colors"
              >
                <ThumbsUp size={16} />
                <span className="text-sm">{discussion.upvoteCount}</span>
              </button>
              <div className="flex items-center space-x-1 text-gray-600">
                <MessageCircle size={16} />
                <span className="text-sm">{discussion.commentCount}</span>
              </div>
              <div className="flex items-center space-x-1 text-gray-600">
                <Eye size={16} />
                <span className="text-sm">{discussion.viewCount}</span>
              </div>
            </div>
          </div>

          <p className="text-gray-700 text-sm mb-4 line-clamp-3">
            {discussion.content}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {discussion.user.profilePicture ? (
                <img
                  src={discussion.user.profilePicture}
                  alt={discussion.user.name}
                  className="w-8 h-8 rounded-full border-2 border-orange-200"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-400 to-amber-400 flex items-center justify-center text-white font-medium text-sm">
                  {discussion.user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-sm text-gray-600 capitalize">{discussion.user.role}</span>
            </div>

            <Link
              to={`/discussions/${discussion.id}`}
              className="flex items-center text-orange-600 hover:text-orange-700 font-medium text-sm transition-colors group"
            >
              Read More
              <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 text-white py-6 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center"
          >
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
              <h1 className="text-lg md:text-xl font-semibold">Discussions</h1>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 -mt-8 relative z-10">
        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-orange-100"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center">
              <div className="bg-orange-100 p-2 rounded-lg mr-3">
                <Search className="text-orange-600" size={20} />
              </div>
              <h2 className="text-lg font-bold text-gray-800">Find Discussions</h2>
            </div>

            <Link
              to="/discussions/create"
              className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all duration-200 flex items-center font-semibold shadow-md hover:shadow-lg"
            >
              <Plus size={20} className="mr-2" />
              Start Discussion
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search discussions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="relative">
              <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Discussions List */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500 mb-4"></div>
              <p className="text-gray-600">Loading discussions...</p>
            </div>
          </div>
        ) : filteredDiscussions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-white rounded-2xl shadow-lg border border-orange-100"
          >
            <MessageSquare size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No discussions found</h3>
            <p className="text-gray-500 mb-6">Be the first to start a conversation!</p>
            <Link
              to="/discussions/create"
              className="bg-orange-500 text-white px-6 py-3 rounded-xl hover:bg-orange-600 transition-colors inline-flex items-center"
            >
              <Plus size={20} className="mr-2" />
              Start First Discussion
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-6"
          >
            {filteredDiscussions.map((discussion, index) => (
              <DiscussionCard key={discussion.id} discussion={discussion} index={index} />
            ))}
          </motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex justify-center mt-12"
          >
            <div className="flex items-center space-x-2 bg-white p-2 rounded-2xl shadow-lg">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center justify-center px-4 py-2 rounded-xl transition-all duration-200 bg-white text-gray-600 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md"
              >
                <ChevronRight size={20} className="rotate-180" />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = currentPage - 2 + i;
                if (pageNum < 1) pageNum = i + 1;
                if (pageNum > totalPages) pageNum = totalPages - (4 - i);

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`flex items-center justify-center px-4 py-2 rounded-xl transition-all duration-200 ${
                      currentPage === pageNum
                        ? 'bg-orange-500 text-white shadow-md'
                        : 'bg-white text-gray-600 hover:bg-orange-50 hover:shadow-md'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center justify-center px-4 py-2 rounded-xl transition-all duration-200 bg-white text-gray-600 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DiscussionsPage;