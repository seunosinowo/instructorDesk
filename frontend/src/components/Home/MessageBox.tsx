import React from 'react';
import { motion } from 'framer-motion';
import QuickMessage from '../Messages/QuickMessage';

const MessageBox: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-6"
    >
      <QuickMessage />
    </motion.div>
  );
};

export default MessageBox;