import React, { useState } from 'react';
import { motion } from 'framer-motion';

const CommentSection: React.FC = () => {
  const [comment, setComment] = useState('');

  const handleComment = () => {
    console.log('Comment submitted:', comment);
    setComment('');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="mt-6"
    >
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Add a comment..."
        className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
      />
      <button
        onClick={handleComment}
        className="mt-4 bg-orange-primary text-white px-6 py-2 rounded-lg hover:bg-orange-secondary transition duration-300 font-medium"
      >
        Post Comment
      </button>
    </motion.div>
  );
};

export default CommentSection;