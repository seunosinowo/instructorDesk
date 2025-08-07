import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import type { Post } from '../../types';

interface PostCardProps {
  post: Post;
  onPostUpdated?: (updatedPost: Post) => void;
  onPostDeleted?: (postId: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onPostUpdated, onPostDeleted }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likesCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const currentUserId = localStorage.getItem('userId');

  const postTypes = {
    general: { icon: '💬', color: 'bg-blue-100 text-blue-800' },
    educational: { icon: '📚', color: 'bg-green-100 text-green-800' },
    job: { icon: '💼', color: 'bg-purple-100 text-purple-800' },
    learning: { icon: '🎓', color: 'bg-orange-100 text-orange-800' },
    achievement: { icon: '🏆', color: 'bg-yellow-100 text-yellow-800' },
    question: { icon: '❓', color: 'bg-red-100 text-red-800' }
  };

  const postType = postTypes[post.type as keyof typeof postTypes] || postTypes.general;
  const isAuthor = currentUserId === post.userId;

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
    try {
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/posts/${post.id}`, 
        { content: editContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (onPostUpdated) {
        onPostUpdated(response.data);
      }
      setIsEditing(false);
      setShowDropdown(false);
    } catch (error) {
      console.error('Failed to edit post:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/posts/${post.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (onPostDeleted) {
          onPostDeleted(post.id);
        }
      } catch (error) {
        console.error('Failed to delete post:', error);
      }
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/posts/${post.id}/comments`, 
        { content: comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComment('');
      // Refresh comments or update state
    } catch (error) {
      console.error('Failed to comment:', error);
    }
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
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {/* Profile Picture */}
            <button
              onClick={() => navigate(`/profile/${post.user.id}`)}
              className="w-12 h-12 rounded-full overflow-hidden bg-orange-primary flex-shrink-0 hover:ring-2 hover:ring-orange-primary hover:ring-offset-2 transition-all"
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

            <div>
              <button
                onClick={() => navigate(`/profile/${post.user.id}`)}
                className="font-semibold text-gray-800 hover:text-orange-primary transition-colors"
              >
                {post.user.name}
              </button>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span className="capitalize">{post.user.role}</span>
                <span>•</span>
                <span>{formatTimeAgo(post.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Post Type Badge */}
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${postType.color}`}>
              {postType.icon} {post.type?.charAt(0).toUpperCase() + post.type?.slice(1) || 'General'}
            </span>
            
            {/* Edit/Delete Menu for Author */}
            {isAuthor && (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
                
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setShowDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      ✏️ Edit Post
                    </button>
                    <button
                      onClick={handleDelete}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      🗑️ Delete Post
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="px-6 pb-4">
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
              <span className="text-sm font-medium">Comment</span>
            </button>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="border-t border-gray-100 p-6 bg-gray-50"
        >
          <form onSubmit={handleComment} className="flex space-x-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-orange-primary flex items-center justify-center text-white text-sm font-bold">
              {localStorage.getItem('userName')?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-primary"
              />
            </div>
          </form>
          
          {/* Comments would be rendered here */}
          <div className="text-sm text-gray-500">
            Comments will be displayed here...
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default PostCard;