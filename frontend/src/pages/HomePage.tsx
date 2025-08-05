import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PostCard from '../components/Home/PostCard';
import CreatePost from '../components/Feed/CreatePost';
import ProfileBrowser from '../components/Profile/ProfileBrowser';
import LeftSidebar from '../components/Home/LeftSidebar';
import RightSidebar from '../components/Home/RightSidebar';
import { motion } from 'framer-motion';
import type { Post } from '../types';

const HomePage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [profileCompleted, setProfileCompleted] = useState<boolean | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'feed' | 'discover'>('feed');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    const checkProfileCompletion = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/profile/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const hasProfile = response.data.profile && 
          ((response.data.role === 'teacher' && response.data.profile.subjects?.length > 0) ||
           (response.data.role === 'student' && response.data.profile.interests?.length > 0));
        
        setProfileCompleted(hasProfile);
        setUserProfile(response.data);
        
        if (!hasProfile) {
          // Redirect to profile setup if profile is not completed
          navigate('/profile/setup');
          return;
        }
      } catch (error) {
        console.error('Failed to check profile completion:', error);
        // If profile doesn't exist, redirect to profile setup
        navigate('/profile/setup');
        return;
      }
    };

    const fetchPosts = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/posts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPosts(response.data.posts || response.data);
      } catch (err) {
        console.error('Failed to fetch posts');
      }
    };

    checkProfileCompletion().then(() => {
      if (profileCompleted !== false) {
        fetchPosts();
      }
    });
  }, [token, navigate, profileCompleted]);

  // Show loading while checking profile completion
  if (profileCompleted === null) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-primary"></div>
      </div>
    );
  }

  const handlePostCreated = (newPost: Post) => {
    setPosts([newPost, ...posts]);
  };

  const handlePostUpdated = (updatedPost: Post) => {
    setPosts(posts.map(post => post.id === updatedPost.id ? updatedPost : post));
  };

  const handlePostDeleted = (postId: string) => {
    setPosts(posts.filter(post => post.id !== postId));
  };

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