import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

const ConfirmPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      confirmEmail(token);
    } else {
      setStatus('error');
      setMessage('No confirmation token found');
    }
  }, [searchParams]);

  const confirmEmail = async (token: string) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/confirm`, { token });
      setStatus('success');
      setMessage('Email confirmed successfully!');
    } catch (error: any) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Confirmation failed');
    }
  };

  const handleProceed = () => {
    // Check user's role and redirect to appropriate login page
    const userRole = localStorage.getItem('role');

    if (userRole === 'school') {
      navigate('/school/login');
    } else {
      // Default to regular login for students and teachers
      navigate('/login');
    }
  };

  if (status === 'loading') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="max-w-md mx-auto mt-20 p-8 bg-white rounded-xl shadow-2xl text-center"
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-primary mx-auto mb-4"></div>
        <p className="text-lg text-gray-600">Confirming your email...</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="max-w-md mx-auto mt-20 p-8 bg-white rounded-xl shadow-2xl text-center"
    >
      <motion.h2
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4 }}
        className={`text-3xl font-bold mb-6 ${
          status === 'success' ? 'text-green-600' : 'text-red-600'
        }`}
      >
        {status === 'success' ? 'Email Confirmed!' : 'Confirmation Failed'}
      </motion.h2>
      <p className="text-lg text-gray-600 mb-6">
        {message}
      </p>
      {status === 'success' && (
        <button
          onClick={handleProceed}
          className="bg-orange-primary text-white px-6 py-3 rounded-lg hover:bg-orange-secondary transition duration-300 font-semibold"
        >
          Proceed to Login
        </button>
      )}
    </motion.div>
  );
};

export default ConfirmPage;