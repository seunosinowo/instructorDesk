import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TeacherProfileSetup from '../components/Profile/TeacherProfileSetup';
import StudentProfileSetup from '../components/Profile/StudentProfileSetup';

const ProfileSetupPage: React.FC = () => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        
        if (!token || !userId) {
          navigate('/login');
          return;
        }

        const response = await axios.get(`${import.meta.env.VITE_API_URL}/profile/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Check if profile is already completed
        if (response.data.profileCompleted) {
          navigate('/dashboard');
          return;
        }

        setUserRole(response.data.role);
      } catch (error) {
        console.error('Failed to fetch user role:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    checkUserRole();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {userRole === 'teacher' ? <TeacherProfileSetup /> : <StudentProfileSetup />}
    </div>
  );
};

export default ProfileSetupPage;