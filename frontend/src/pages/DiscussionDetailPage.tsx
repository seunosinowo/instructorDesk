import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  MessageSquare,
  ArrowLeft,
  ThumbsUp,
  MessageCircle,
  Eye,
  Clock,
  Send,
  MoreVertical,
  Pin,
  Lock,
  Reply
} from 'lucide-react';

interface Discussion {
  id: string;
  title: string;
  content: string;
  category: string;
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
  comments: DiscussionComment[];
}

interface DiscussionComment {
  id: string;
  content: string;
  discussionId: string;
  userId: string;
  parentId?: string;
  upvoteCount: number;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    profilePicture?: string;
    role: string;
  };
  replies?: DiscussionComment[];
}

const DiscussionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');
  const currentUserId = localStorage.getItem('userId');

  useEffect(() => {
    if (id) {
      fetchDiscussion();
    }
  }, [id]);

  const fetchDiscussion = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/discussions/${id}`);
      setDiscussion(response.data.discussion);
    } catch (err: any) {
      console.error('Error fetching discussion:', err);
      setError('Failed to load discussion');
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async () => {
    if (!discussion) return;

    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/discussions/${discussion.id}/upvote`,
        {},
        { headers }
      );

      setDiscussion(prev => prev ? {
        ...prev,
        upvoteCount: response.data.upvoteCount
      } : null);
    } catch (error) {
      console.error('Error upvoting discussion:', error);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent, parentId?: string) => {
    e.preventDefault();
    if (!discussion || !token) return;

    const content = parentId ? replyContent : newComment;
    if (!content.trim()) return;

    setSubmittingComment(true);

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/discussions/${discussion.id}/comments`,
        { content: content.trim(), parentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refresh discussion to get updated comments
      await fetchDiscussion();

      if (parentId) {
        setReplyContent('');
      } else {
        setNewComment('');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - commentDate.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return commentDate.toLocaleDateString();
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

  const CommentComponent: React.FC<{ comment: DiscussionComment; isReply?: boolean }> = ({ comment, isReply = false }) => {
    const [showReplyForm, setShowReplyForm] = useState(false);

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white rounded-xl p-4 shadow-sm border border-gray-100 ${isReply ? 'ml-8 mt-3' : 'mb-4'}`}
      >
        <div className="flex items-start space-x-3">
          {comment.user.profilePicture ? (
            <img
              src={comment.user.profilePicture}
              alt={comment.user.name}
              className="w-10 h-10 rounded-full border-2 border-orange-200"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-400 to-amber-400 flex items-center justify-center text-white font-medium">
              {comment.user.name.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="font-semibold text-gray-900">{comment.user.name}</span>
              <span className="text-xs text-gray-500 capitalize bg-gray-100 px-2 py-1 rounded-full">
                {comment.user.role}
              </span>
              <span className="text-xs text-gray-500 flex items-center">
                <Clock size={12} className="mr-1" />
                {formatTimeAgo(comment.createdAt)}
              </span>
              {comment.isEdited && (
                <span className="text-xs text-gray-400">(edited)</span>
              )}
            </div>

            <p className="text-gray-700 mb-3 whitespace-pre-wrap">{comment.content}</p>

            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-1 text-gray-600 hover:text-orange-600 transition-colors text-sm">
                <ThumbsUp size={14} />
                <span>{comment.upvoteCount}</span>
              </button>

              {!isReply && (
                <button
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="flex items-center space-x-1 text-gray-600 hover:text-orange-600 transition-colors text-sm"
                >
                  <Reply size={14} />
                  <span>Reply</span>
                </button>
              )}

              {comment.userId === currentUserId && (
                <div className="relative">
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical size={14} />
                  </button>
                </div>
              )}
            </div>

            {showReplyForm && (
              <form onSubmit={(e) => handleCommentSubmit(e, comment.id)} className="mt-3">
                <div className="flex space-x-2">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder={`Reply to ${comment.user.name}...`}
                    className="flex-1 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                    rows={2}
                  />
                  <div className="flex flex-col space-y-2">
                    <button
                      type="submit"
                      disabled={submittingComment || !replyContent.trim()}
                      className="bg-orange-500 text-white p-2 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowReplyForm(false);
                        setReplyContent('');
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </form>
            )}

            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-3 space-y-3">
                {comment.replies.map(reply => (
                  <CommentComponent key={reply.id} comment={reply} isReply={true} />
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500 mb-4"></div>
          <p className="text-gray-600">Loading discussion...</p>
        </div>
      </div>
    );
  }

  if (!discussion) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <MessageSquare size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-600 mb-2">Discussion Not Found</h2>
          <p className="text-gray-500 mb-6">The discussion you're looking for doesn't exist.</p>
          <Link
            to="/discussions"
            className="bg-orange-500 text-white px-6 py-3 rounded-xl hover:bg-orange-600 transition-colors"
          >
            Back to Discussions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 text-white py-6">
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
                <h1 className="text-xl md:text-2xl font-bold">Discussion</h1>
                <p className="text-white/90 text-sm">Community conversation</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center"
            >
              <span className="mr-2">⚠️</span>
              {error}
            </motion.div>
          )}
          {/* Discussion Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-orange-100"
          >
            {discussion.isPinned && (
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-lg mb-4 text-sm font-medium flex items-center w-fit">
                <Pin size={16} className="mr-2" />
                Pinned Discussion
              </div>
            )}

            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                  {discussion.title}
                </h1>

                <div className="flex items-center space-x-4 mb-4">
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
                    <span className="font-semibold text-gray-900">{discussion.user.name}</span>
                    <span className="text-sm text-gray-500 capitalize bg-gray-100 px-2 py-1 rounded-full">
                      {discussion.user.role}
                    </span>
                  </div>

                  <div className="flex items-center text-sm text-gray-500">
                    <Clock size={14} className="mr-1" />
                    {formatTimeAgo(discussion.createdAt)}
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(discussion.category)}`}>
                    {discussion.category.charAt(0).toUpperCase() + discussion.category.slice(1)}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3 ml-4">
                <button
                  onClick={handleUpvote}
                  className="flex items-center space-x-1 bg-orange-50 text-orange-600 px-3 py-2 rounded-lg hover:bg-orange-100 transition-colors"
                >
                  <ThumbsUp size={16} />
                  <span className="font-medium">{discussion.upvoteCount}</span>
                </button>

                <div className="flex items-center space-x-1 text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                  <MessageCircle size={16} />
                  <span className="font-medium">{discussion.commentCount}</span>
                </div>

                <div className="flex items-center space-x-1 text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                  <Eye size={16} />
                  <span className="font-medium">{discussion.viewCount}</span>
                </div>
              </div>
            </div>

            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg">
                {discussion.content}
              </p>
            </div>
          </motion.div>

          {/* Comments Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-orange-100"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <MessageCircle size={24} className="mr-2 text-orange-500" />
                Comments ({discussion.commentCount})
              </h2>

              {discussion.isClosed && (
                <div className="flex items-center text-orange-600 bg-orange-50 px-3 py-1 rounded-full text-sm font-medium">
                  <Lock size={14} className="mr-1" />
                  Discussion Closed
                </div>
              )}
            </div>

            {/* Add Comment Form */}
            {!discussion.isClosed && token && (
              <form onSubmit={(e) => handleCommentSubmit(e)} className="mb-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts..."
                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                  <div className="flex justify-end mt-3">
                    <button
                      type="submit"
                      disabled={submittingComment || !newComment.trim()}
                      className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-2 rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all duration-200 flex items-center font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submittingComment ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                          Posting...
                        </>
                      ) : (
                        <>
                          <Send size={16} className="mr-2" />
                          Post Comment
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Comments List */}
            <div className="space-y-4">
              {discussion.comments && discussion.comments.length > 0 ? (
                discussion.comments
                  .filter(comment => !comment.parentId) // Only top-level comments
                  .map(comment => (
                    <CommentComponent key={comment.id} comment={comment} />
                  ))
              ) : (
                <div className="text-center py-8">
                  <MessageCircle size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No comments yet. Be the first to share your thoughts!</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DiscussionDetailPage;