import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import PostCard from '../components/Home/PostCard';
import CreatePost from '../components/Feed/CreatePost';
import ProfileBrowser from '../components/Profile/ProfileBrowser';
import LeftSidebar from '../components/Home/LeftSidebar';
import RightSidebar from '../components/Home/RightSidebar';
import { motion } from 'framer-motion';
import type { Post } from '../types';

// Define UserProfile interface for type safety
interface UserProfile {
  id: string;
  role: 'teacher' | 'student' | 'school';
  name?: string;
  profile: {
    subjects?: string[];
    interests?: string[];
    schoolName?: string;
    city?: string;
    country?: string;
    address?: string;
    state?: string;
    [key: string]: any; // For additional fields
  };
}

const HomePage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [profileCompleted, setProfileCompleted] = useState<boolean | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'feed' | 'discover'>('feed');
  const [error, setError] = useState<string | null>(null); // Added for error handling
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();
  const location = useLocation();

  // Memoize checkProfileCompletion to prevent unnecessary re-creations
  const checkProfileCompletion = useCallback(async () => {
    if (!token || !userId) {
      setError('Authentication required. Please log in.');
      navigate('/login');
      return;
    }

    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/profile/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Use backend's profileCompleted property if available
  const { profileCompleted } = response.data;
      setProfileCompleted(profileCompleted);
      setUserProfile(response.data);

      // If on /profile/setup and profile is completed, redirect to home
      if (location.pathname === '/profile/setup' && profileCompleted) {
        navigate('/');
        return;
      }

      // If not completed, redirect to setup
      if (!profileCompleted && location.pathname !== '/profile/setup') {
        navigate('/profile/setup');
        return;
      }
    } catch (error) {
      console.error('Failed to check profile completion:', error);
      setError('Failed to load profile. Please try again.');
      setProfileCompleted(false);
      if (location.pathname !== '/profile/setup') {
        navigate('/profile/setup');
      }
    }
  }, [token, userId, navigate, location.pathname]);

  // Memoize fetchPosts to prevent unnecessary re-creations
  const fetchPosts = useCallback(async () => {
    if (!token) {
      setError('Authentication required. Please log in.');
      return;
    }

    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/posts`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const postsData = Array.isArray(response.data.posts) ? response.data.posts : response.data;
      setPosts(postsData);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
      setError('Failed to load posts. Please try again.');
    }
  }, [token]);

  // Check profile completion on mount
  useEffect(() => {
    if (location.pathname === '/profile/setup') return;
    checkProfileCompletion();
  }, [checkProfileCompletion, location.pathname]);

  // Fetch posts when profile is completed
  useEffect(() => {
    if (profileCompleted === true) {
      fetchPosts();
    }
  }, [profileCompleted, fetchPosts]);

  // Handle post creation
  const handlePostCreated = useCallback((newPost: Post) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]);
  }, []);

  // Handle post update
  const handlePostUpdated = useCallback((updatedPost: Post) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => (post.id === updatedPost.id ? updatedPost : post))
    );
  }, []);

  // Handle post deletion
  const handlePostDeleted = useCallback((postId: string) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
  }, []);

  // Show error state
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-lg">{error}</div>
      </div>
    );
  }

  // Show loading while checking profile completion
  if (profileCompleted === null) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 lg:p-6 max-w-7xl">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6"
      >
        {/* Left Sidebar - Hidden on mobile, shown on lg+ */}
        <div className="lg:col-span-3 hidden lg:block">
          <LeftSidebar userProfile={userProfile} />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-6 col-span-1">
          {/* Tab Navigation */}
          <div className="bg-white rounded-xl shadow-lg mb-6 p-2">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('feed')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'feed'
                    ? 'bg-orange-primary text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                🏠 My Feed
              </button>
              <button
                onClick={() => setActiveTab('discover')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'discover'
                    ? 'bg-orange-primary text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                🔍 Discover People
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'feed' ? (
            <div>
              {/* Create Post */}
              <CreatePost onPostCreated={handlePostCreated} userProfile={userProfile} />
              
              {/* Posts Feed */}
              <div className="space-y-6">
                {posts.length > 0 ? (
                  posts.map((post) => (
                    <PostCard 
                      key={post.id} 
                      post={post} 
                      onPostUpdated={handlePostUpdated}
                      onPostDeleted={handlePostDeleted}
                    />
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white rounded-xl shadow-lg p-12 text-center"
                  >
                    <div className="text-gray-400 mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-600 mb-2">No posts yet</h3>
                    <p className="text-gray-500">Be the first to share something with the community!</p>
                  </motion.div>
                )}
              </div>
            </div>
          ) : (
            <ProfileBrowser />
          )}
          
          {/* Mobile Right Sidebar Content */}
          <div className="lg:hidden mt-6">
            <RightSidebar />
          </div>
        </div>

        {/* Right Sidebar - Hidden on mobile, shown on lg+ */}
        <div className="lg:col-span-3 hidden lg:block">
          <RightSidebar />
        </div>
      </motion.div>
    </div>
  );
};

export default HomePage;