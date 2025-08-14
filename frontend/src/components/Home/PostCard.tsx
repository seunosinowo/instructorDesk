import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import type { Post, Comment } from '../../types';

interface PostCardProps {
  post: Post;
  onPostUpdated?: (updatedPost: Post) => void;
  onPostDeleted?: (postId: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onPostUpdated, onPostDeleted }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likesCount || 0);
  const [commentCount, setCommentCount] = useState(post.commentsCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [postingComment, setPostingComment] = useState(false);
  const [commentEditId, setCommentEditId] = useState<string | null>(null);
  const [editCommentContent, setEditCommentContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  // Add separate state for post deletion
  const [showPostDeleteModal, setShowPostDeleteModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const currentUserId = localStorage.getItem('userId');
  const currentUserName = localStorage.getItem('userName');
  const currentUserProfilePicture = localStorage.getItem('profilePicture');

  const postTypes = {
    general: { icon: '💬', color: 'bg-blue-100 text-blue-800' },
    educational: { icon: '📚', color: 'bg-green-100 text-green-800' },
    job: { icon: '💼', color: 'bg-purple-100 text-purple-800' },
    learning: { icon: '🎓', color: 'bg-orange-100 text-orange-800' },
    achievement: { icon: '🏆', color: 'bg-yellow-100 text-yellow-800' },
    question: { icon: '❓', color: 'bg-red-100 text-red-800' }
  };

  const postType = postTypes[post.type as keyof typeof postTypes] || postTypes.general;
  // More robust comparison - ensure both are strings and not null/undefined
  const isAuthor = currentUserId && post.userId && String(currentUserId) === String(post.userId);

  // Check if user has liked this post
  useEffect(() => {
    const checkLikeStatus = () => {
      if (post.likes && currentUserId) {
        const userLike = post.likes.find(like => like.userId === currentUserId);
        setLiked(!!userLike);
      }
    };
    checkLikeStatus();
  }, [post.likes, currentUserId]);

  // Update comment count when post changes
  useEffect(() => {
    setCommentCount(post.commentsCount || 0);
  }, [post.commentsCount]);

  const handleLike = async () => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/posts/${post.id}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLiked(response.data.liked);
      setLikeCount((prev: number) => response.data.liked ? prev + 1 : prev - 1);
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const handleEdit = async () => {
  console.log('[DEBUG] Edit post attempt:', post.id, editContent);
    try {
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/posts/${post.id}`,
        { content: editContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  console.log('[DEBUG] Edit post response:', response.data);
      if (onPostUpdated && response.data && response.data.id) {
        console.log('[DEBUG] Calling onPostUpdated with:', response.data);
        onPostUpdated(response.data);
      } else {
        alert('Edit succeeded but no updated post returned. Please refresh.');
      }
      setIsEditing(false);
      setShowDropdown(false);
    } catch (error) {
      const err = error as any;
      console.error('Failed to edit post:', err);
      alert(`Failed to edit post: ${err.response?.data?.message || err.message}`);
    }
  };


  // Update confirmDelete function
  const confirmPostDelete = async () => {
  console.log('[DEBUG] Delete post confirmed:', post.id);
    try {
      const response = await axios.delete(`${import.meta.env.VITE_API_URL}/posts/${post.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
  console.log('[DEBUG] Delete post response:', response.data);
      if (onPostDeleted) {
        console.log('[DEBUG] Calling onPostDeleted with:', post.id);
        onPostDeleted(post.id);
      }
      setShowPostDeleteModal(false);
    } catch (error) {
      const err = error as any;
      console.error('Failed to delete post:', err);
      alert(`Failed to delete post: ${err.response?.data?.message || err.message}`);
      setShowPostDeleteModal(false);
    }
  };

  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/posts/${post.id}/comments`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setComments(res.data || []);
    } catch (error: any) {
      console.error('Failed to fetch comments:', error);
      setComments([]);
      // Don't show alert for fetch errors as they're not user-initiated
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    if (showComments) fetchComments();
    // eslint-disable-next-line
  }, [showComments]);

  // Close dropdown when clicking outside (fixed with ref)
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // Close delete modal on Escape key
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showDeleteModal) {
        setShowDeleteModal(false);
        setCommentToDelete(null);
      }
    };

    if (showDeleteModal) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [showDeleteModal]);

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !token || postingComment) return;
    
    setPostingComment(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/posts/${post.id}/comments`, 
        { content: comment.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Add new comment to local state immediately for better UX
      const newComment = response.data;
      setComments(prevComments => [...prevComments, newComment]);
      setCommentCount(prev => prev + 1);
      setComment('');
    } catch (error: any) {
      console.error('Failed to comment:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to post comment. Please try again.';
      alert(errorMessage);
    } finally {
      setPostingComment(false);
    }
  };

  const handleEditComment = (commentId: string, content: string) => {
    setCommentEditId(commentId);
    setEditCommentContent(content);
  };

  const handleSaveEditComment = async (commentId: string) => {
    if (!editCommentContent.trim()) return;
    
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/comments/${commentId}`, 
        { content: editCommentContent.trim() }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update comment in local state immediately for better UX
      setComments(prevComments => 
        prevComments.map(c => 
          c.id === commentId 
            ? { ...c, content: editCommentContent.trim() }
            : c
        )
      );
      
      setCommentEditId(null);
      setEditCommentContent('');
    } catch (error: any) {
      console.error('Failed to edit comment:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to edit comment. Please try again.';
      alert(errorMessage);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/comments/${commentId}`, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Remove comment from local state immediately for better UX
      setComments(prevComments => prevComments.filter(c => c.id !== commentId));
      setCommentCount(prev => prev - 1);
      
      // Close modal
      setShowDeleteModal(false);
      setCommentToDelete(null);
    } catch (error: any) {
      console.error('Failed to delete comment:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to delete comment. Please try again.';
      alert(errorMessage);
      
      // Close modal even on error
      setShowDeleteModal(false);
      setCommentToDelete(null);
    }
  };

  const confirmDeleteComment = (commentId: string) => {
    setCommentToDelete(commentId);
    setShowDeleteModal(true);
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    
    if (diffInDays < 30) {
      const diffInWeeks = Math.floor(diffInDays / 7);
      return `${diffInWeeks} week${diffInWeeks === 1 ? '' : 's'} ago`;
    }
    
    // For older posts, show the actual date
    return postDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-lg mb-6 border border-gray-100 overflow-hidden"
    >
      {/* Post Header */}
  <div className="p-4 pb-3 sm:p-6 sm:pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {/* Profile Picture */}
            <button
              onClick={() => navigate(`/profile/${post.user.id}`)}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-orange-primary flex-shrink-0 hover:ring-2 hover:ring-orange-primary hover:ring-offset-2 transition-all"
            >
              {post.user.profilePicture ? (
                <img 
                  src={post.user.profilePicture} 
                  alt={post.user.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                  {post.user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </button>

            <div className="space-y-0.5 sm:space-y-1">
              <button
                onClick={() => navigate(`/profile/${post.user.id}`)}
                className="font-semibold text-gray-800 hover:text-orange-primary transition-colors"
              >
                {post.user.name}
              </button>
              <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-500">
                <span className="capitalize">{post.user.role}</span>
                <span>•</span>
                <span>{formatTimeAgo(post.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Post Type Badge */}
            <span className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-medium ${postType.color}`}>
              {postType.icon} {post.type?.charAt(0).toUpperCase() + post.type?.slice(1) || 'General'}
            </span>
            
            {/* Edit/Delete Menu for Author */}
            {isAuthor && (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-primary border border-transparent hover:border-gray-200"
                  title="Post options"
                >
                  <svg className="w-5 h-5 text-gray-700 hover:text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
                
                {showDropdown && (
                  <div
                    ref={dropdownRef}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200 overflow-hidden"
                  >
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setShowDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      ✏️ Edit Post
                    </button>
                    <button
                      onClick={() => {
                        setShowPostDeleteModal(true);
                        setShowDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors"
                    >
                      🗑️ Delete Post
                    </button>
                  </div>
                )}
      {/* Delete Confirmation Modal for posts */}
      {showPostDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-80 max-w-full">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Delete Post</h3>
            <p className="mb-6 text-gray-600">Are you sure you want to delete this post? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowPostDeleteModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmPostDelete}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Post Content */}
  <div className="px-4 pb-3 sm:px-6 sm:pb-4">
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-primary resize-none"
              rows={4}
            />
            <div className="flex space-x-2">
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-orange-primary text-white rounded-lg hover:bg-orange-secondary transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(post.content);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{post.content}</p>
            {/* Post Image */}
            {post.imageUrl && (
              <div className="mt-4">
                <img 
                  src={post.imageUrl} 
                  alt="Post content" 
                  className="w-full rounded-lg max-h-96 object-cover"
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Post Actions */}
      <div className="px-6 py-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 transition-colors ${
                liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
              }`}
            >
              <svg className="w-5 h-5" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="text-sm font-medium">{likeCount}</span>
            </button>

            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 text-gray-500 hover:text-orange-primary transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-sm font-medium">
                {commentCount > 0 ? `${commentCount} Comment${commentCount === 1 ? '' : 's'}` : 'Comment'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
          className="border-t border-gray-100 bg-gray-50"
        >
          {/* Comment Input */}
          <div className="p-6 pb-4">
            <form onSubmit={handleComment} className="flex space-x-3">
              <div className="flex-shrink-0">
                {currentUserProfilePicture ? (
                  <img 
                    src={currentUserProfilePicture} 
                    alt="Your profile" 
                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" 
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-orange-primary flex items-center justify-center text-white text-sm font-bold border-2 border-white shadow-sm">
                    {currentUserName?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-primary focus:border-transparent bg-white shadow-sm"
                    disabled={!token}
                  />
                  <button 
                    type="submit" 
                    disabled={!comment.trim() || !token || postingComment}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-orange-primary text-white px-4 py-1.5 rounded-full hover:bg-orange-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center space-x-1"
                  >
                    {postingComment ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                        <span>Posting...</span>
                      </>
                    ) : (
                      <span>Post</span>
                    )}
                  </button>
                </div>
                {!token && (
                  <p className="text-xs text-gray-500 mt-1 ml-4">Please log in to comment</p>
                )}
              </div>
            </form>
          </div>

          {/* Comments List */}
          <div className="px-6 pb-6">
            {loadingComments ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-primary"></div>
                <span className="ml-2 text-gray-500">Loading comments...</span>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-sm">
                  <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  No comments yet. Be the first to comment!
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((c) => (
                  <div key={c.id} className="flex space-x-3">
                    {/* Commenter Profile Picture */}
                    <div className="flex-shrink-0">
                      <button
                        onClick={() => navigate(`/profile/${c.user?.id}`)}
                        className="block"
                      >
                        {c.user?.profilePicture ? (
                          <img 
                            src={c.user.profilePicture} 
                            alt={c.user.name} 
                            className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm hover:ring-2 hover:ring-orange-primary hover:ring-offset-1 transition-all" 
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-sm font-bold border-2 border-white shadow-sm hover:ring-2 hover:ring-orange-primary hover:ring-offset-1 transition-all">
                            {c.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                        )}
                      </button>
                    </div>

                    {/* Comment Content */}
                    <div className="flex-1 min-w-0">
                      <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-200">
                        <div className="flex items-center space-x-2 mb-1">
                          <button
                            onClick={() => navigate(`/profile/${c.user?.id}`)}
                            className="font-semibold text-gray-800 hover:text-orange-primary transition-colors text-sm"
                          >
                            {c.user?.name || 'User'}
                          </button>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-400">{formatTimeAgo(c.createdAt)}</span>
                        </div>
                        
                        {commentEditId === c.id ? (
                          <div className="space-y-2">
                            <textarea
                              value={editCommentContent}
                              onChange={(e) => setEditCommentContent(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-primary resize-none text-sm"
                              rows={2}
                              autoFocus
                            />
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => handleSaveEditComment(c.id)} 
                                className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-xs font-medium"
                              >
                                Save
                              </button>
                              <button 
                                onClick={() => {
                                  setCommentEditId(null);
                                  setEditCommentContent('');
                                }} 
                                className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors text-xs font-medium"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{c.content}</p>
                        )}
                      </div>

                      {/* Comment Actions - Only for comment author */}
                      {c.userId === currentUserId && commentEditId !== c.id && (
                        <div className="flex space-x-3 mt-2 ml-2">
                          <button 
                            onClick={() => handleEditComment(c.id, c.content)} 
                            className="text-xs text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => confirmDeleteComment(c.id)} 
                            className="text-xs text-red-600 hover:text-red-800 hover:underline font-medium transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => {
            setShowDeleteModal(false);
            setCommentToDelete(null);
          }}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Comment</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this comment? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setCommentToDelete(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => commentToDelete && handleDeleteComment(commentToDelete)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default PostCard;