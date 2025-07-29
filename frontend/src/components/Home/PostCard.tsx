import React from 'react';
import { motion } from 'framer-motion';
import type { Post } from '../../types';

const PostCard: React.FC<{ post: Post }> = ({ post }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white p-6 rounded-xl shadow-lg mb-6 border border-gray-100"
    >
      <h3 className="text-xl font-semibold text-gray-800">{post.user.name}</h3>
      <p className="mt-4 text-gray-600">{post.content}</p>
      <div className="mt-4 flex space-x-6">
        <button className="text-orange-primary hover:text-orange-secondary font-medium">Like</button>
        <button className="text-orange-primary hover:text-orange-secondary font-medium">Comment</button>
      </div>
    </motion.div>
  );
};

export default PostCard;