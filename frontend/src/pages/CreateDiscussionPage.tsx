import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  MessageSquare,
  ArrowLeft,
  Tag,
  FileText,
  Send,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const CreateDiscussionPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  const categories = [
    { value: 'general', label: 'General Discussion', description: 'General topics and casual conversations' },
    { value: 'academic', label: 'Academic', description: 'Educational topics, curriculum, teaching methods' },
    { value: 'career', label: 'Career', description: 'Career advice, job opportunities, professional development' },
    { value: 'resources', label: 'Resources', description: 'Share educational resources, tools, and materials' },
    { value: 'events', label: 'Events', description: 'School events, workshops, conferences' },
    { value: 'other', label: 'Other', description: 'Any other topics not covered above' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (title.length < 5) {
      setError('Title must be at least 5 characters long');
      return;
    }

    if (content.length < 10) {
      setError('Content must be at least 10 characters long');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/discussions`,
        { title: title.trim(), content: content.trim(), category },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(true);
      setTimeout(() => {
        navigate(`/discussions/${response.data.discussion.id}`);
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create discussion');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full"
        >
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Discussion Created!</h2>
          <p className="text-gray-600 mb-6">Your discussion has been posted successfully. Redirecting...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500 mx-auto"></div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 text-white py-8">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/discussions')}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Create Discussion</h1>
                <p className="text-white/90 mt-1">Share your thoughts with the community</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Title Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
              <div className="flex items-center mb-4">
                <div className="bg-orange-100 p-2 rounded-lg mr-3">
                  <FileText className="text-orange-600" size={24} />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Discussion Title</h2>
              </div>

              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's your discussion about?"
                className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg"
                maxLength={200}
                required
              />
              <p className="text-sm text-gray-500 mt-2">{title.length}/200 characters</p>
            </div>

            {/* Category Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
              <div className="flex items-center mb-4">
                <div className="bg-orange-100 p-2 rounded-lg mr-3">
                  <Tag className="text-orange-600" size={24} />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Category</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((cat) => (
                  <label
                    key={cat.value}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      category === cat.value
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="category"
                      value={cat.value}
                      checked={category === cat.value}
                      onChange={(e) => setCategory(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-start">
                      <div className={`w-4 h-4 rounded-full border-2 mt-1 mr-3 ${
                        category === cat.value ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
                      }`}>
                        {category === cat.value && (
                          <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{cat.label}</h3>
                        <p className="text-sm text-gray-600 mt-1">{cat.description}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Content Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
              <div className="flex items-center mb-4">
                <div className="bg-orange-100 p-2 rounded-lg mr-3">
                  <MessageSquare className="text-orange-600" size={24} />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Discussion Content</h2>
              </div>

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts, ask questions, or start a conversation..."
                className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-vertical"
                rows={12}
                maxLength={5000}
                required
              />
              <p className="text-sm text-gray-500 mt-2">{content.length}/5000 characters</p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center"
              >
                <AlertCircle size={20} className="mr-3 flex-shrink-0" />
                {error}
              </motion.div>
            )}

            {/* Submit Button */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Ready to Post?</h3>
                  <p className="text-gray-600 text-sm">Your discussion will be visible to all community members</p>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => navigate('/discussions')}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center ${
                      loading
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 shadow-md hover:shadow-lg'
                    }`}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Send size={20} className="mr-2" />
                        Create Discussion
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateDiscussionPage;