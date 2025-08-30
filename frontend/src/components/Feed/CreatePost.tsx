import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

interface CreatePostProps {
  onPostCreated: (post: any) => void;
  userProfile: any;
}

const CreatePost: React.FC<CreatePostProps> = ({ onPostCreated, userProfile }) => {
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState('general');
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const token = localStorage.getItem('token');

  const postTypes = [
    { value: 'general', label: '💬 General', color: 'bg-blue-100 text-blue-800' },
    { value: 'educational', label: '📚 Educational Content', color: 'bg-green-100 text-green-800' },
    { value: 'job', label: '💼 Job Opportunity', color: 'bg-purple-100 text-purple-800' },
    { value: 'learning', label: '🎓 Learning Opportunity', color: 'bg-orange-100 text-orange-800' },
    { value: 'achievement', label: '🏆 Achievement', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'question', label: '❓ Question', color: 'bg-red-100 text-red-800' }
  ];

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Clean up previous video preview if it exists
      // No cleanup needed for data URLs

      // Check video duration
      const video = document.createElement('video');
      video.preload = 'metadata';

      const objectUrl = URL.createObjectURL(file);
      video.src = objectUrl;

      video.onloadedmetadata = () => {
        if (video.duration > 60) {
          URL.revokeObjectURL(objectUrl);
          setVideoError('Video must be 1 minute or less. Please select a shorter video.');
          setSelectedVideo(null);
          setVideoPreview(null);
          return;
        }
        setVideoError(null);
        setSelectedVideo(file);
        // Use FileReader for preview instead of object URL
        const reader = new FileReader();
        reader.onload = (e) => {
          setVideoPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
        URL.revokeObjectURL(objectUrl);
      };

      video.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        setVideoError('Invalid video file. Please select a valid video.');
        setSelectedVideo(null);
        setVideoPreview(null);
      };
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!selectedImage) return null;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', selectedImage);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/upload/post-image`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      return response.data.imageUrl;
    } catch (error) {
      console.error('Failed to upload image:', error);
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const uploadVideo = async (): Promise<string | null> => {
    if (!selectedVideo) return null;

    setUploadingVideo(true);
    try {
      const formData = new FormData();
      formData.append('video', selectedVideo);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/upload/post-video`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      return response.data.videoUrl;
    } catch (error: any) {
      console.error('Failed to upload video:', error);
      if (error.response?.data?.error) {
        setVideoError(error.response.data.error);
      } else {
        setVideoError('Failed to upload video. Please try again.');
      }
      return null;
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !selectedImage && !selectedVideo) return;

    setLoading(true);
    try {
      let imageUrl = null;
      let videoUrl = null;

      if (selectedImage) {
        imageUrl = await uploadImage();
      }

      if (selectedVideo) {
        videoUrl = await uploadVideo();
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/posts`,
        {
          content: content.trim(),
          type: postType,
          imageUrl,
          videoUrl
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      onPostCreated(response.data);
      setContent('');
      setPostType('general');
      setSelectedImage(null);
      setImagePreview(null);
      setSelectedVideo(null);
      setVideoPreview(null);
      setVideoError(null);
      setIsExpanded(false);
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const removeVideo = () => {
    setSelectedVideo(null);
    setVideoPreview(null);
    setVideoError(null);
  };

  const selectedPostType = postTypes.find(type => type.value === postType);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6 mb-6"
    >
      <div className="flex items-start space-x-4">
        {/* Profile Picture */}
        <div className="w-12 h-12 rounded-full overflow-hidden bg-orange-primary flex-shrink-0">
          {userProfile?.profilePicture ? (
            <img 
              src={userProfile.profilePicture} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
              {userProfile?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          )}
        </div>

        <div className="flex-1">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Post Type Selector */}
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex flex-wrap gap-2 mb-4"
              >
                {postTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setPostType(type.value)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                      postType === type.value 
                        ? type.color + ' ring-2 ring-offset-2 ring-orange-primary' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </motion.div>
            )}

            {/* Content Input */}
            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onFocus={() => setIsExpanded(true)}
                placeholder={`What's on your mind, ${userProfile?.name?.split(' ')[0] || 'there'}?`}
                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-primary resize-none transition-all duration-200"
                rows={isExpanded ? 4 : 2}
              />
              
              {isExpanded && selectedPostType && (
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedPostType.color}`}>
                    {selectedPostType.label}
                  </span>
                </div>
              )}
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="relative"
              >
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full max-h-64 object-cover rounded-lg border border-gray-300"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </motion.div>
            )}

            {/* Video Error */}
            {videoError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg"
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{videoError}</span>
                </div>
              </motion.div>
            )}

            {/* Video Preview */}
            {videoPreview && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="relative"
              >
                <video
                  src={videoPreview}
                  controls
                  className="w-full max-h-64 object-cover rounded-lg border border-gray-300"
                />
                <button
                  type="button"
                  onClick={removeVideo}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </motion.div>
            )}

            {/* Action Buttons */}
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-between items-center pt-2"
              >
                <div className="flex items-center space-x-4 text-gray-500">
                  <label className="flex items-center space-x-2 hover:text-orange-primary transition-colors cursor-pointer">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm">Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>
                  <label className="flex items-center space-x-2 hover:text-orange-primary transition-colors cursor-pointer">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm">Video</span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoSelect}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsExpanded(false);
                      setContent('');
                      setPostType('general');
                      setSelectedImage(null);
                      setImagePreview(null);
                      setSelectedVideo(null);
                      setVideoPreview(null);
                      setVideoError(null);
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={(!content.trim() && !selectedImage && !selectedVideo) || loading || uploadingImage || uploadingVideo}
                    className="px-6 py-2 bg-orange-primary text-white rounded-lg hover:bg-orange-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
                  >
                    {(loading || uploadingImage || uploadingVideo) && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    )}
                    <span>{uploadingImage ? 'Uploading...' : uploadingVideo ? 'Uploading...' : loading ? 'Posting...' : 'Post'}</span>
                  </button>
                </div>
              </motion.div>
            )}
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default CreatePost;