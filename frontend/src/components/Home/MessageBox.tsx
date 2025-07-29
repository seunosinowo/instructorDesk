import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const MessageBox: React.FC = () => {
  const [teachers, setTeachers] = useState<{ id: string; name: string; email: string }[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/messages/teachers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTeachers(response.data);
      } catch (err) {
        setError('Failed to load teachers.');
      }
    };
    fetchTeachers();
  }, [token]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/messages`,
        { teacherId: selectedTeacher, content: message },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('');
      setError('Message sent!');
      setTimeout(() => setError(''), 3000);
    } catch (err) {
      setError('Failed to send message.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white p-6 rounded-xl shadow-lg mb-6"
    >
      <h3 className="text-xl font-semibold text-orange-primary mb-4">Message a Teacher</h3>
      {error && <p className={error.includes('sent') ? 'text-green-500' : 'text-red-500'}>{error}</p>}
      <select
        value={selectedTeacher}
        onChange={(e) => setSelectedTeacher(e.target.value)}
        className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-orange-primary"
      >
        <option value="">Select a Teacher</option>
        {teachers.map((teacher) => (
          <option key={teacher.id} value={teacher.id}>
            {teacher.name}
          </option>
        ))}
      </select>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-orange-primary"
      />
      <button
        onClick={handleSendMessage}
        className="w-full bg-orange-primary text-white p-3 rounded-lg hover:bg-orange-secondary transition duration-300 font-semibold"
      >
        Send
      </button>
    </motion.div>
  );
};

export default MessageBox;