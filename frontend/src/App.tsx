import React from 'react';
import { Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ComponentsShowcase from './pages/ComponentsShowcase';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import ProfileEditPage from './pages/ProfileEditPage';
import ProfileSettingsPage from './pages/ProfileSettingsPage';
import ProfileSetupPage from './pages/ProfileSetupPage';
import SchoolProfileSetup from './components/Profile/SchoolProfileSetup';
import SchoolsPage from './pages/SchoolsPage';
import UserProfilePage from './pages/UserProfilePage';
import DiscussionsPage from './pages/DiscussionsPage';
import CreateDiscussionPage from './pages/CreateDiscussionPage';
import DiscussionDetailPage from './pages/DiscussionDetailPage';
import MessagesPage from './pages/MessagesPage';
import TestMessagesPage from './pages/TestMessagesPage';
import NotFoundPage from './pages/NotFoundPage';
import Navbar from './components/Navbar';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import SchoolLogin from './components/Auth/SchoolLogin';
import SchoolRegister from './components/Auth/SchoolRegister';
import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';
import ConfirmPage from './components/ConfirmPage';
import ProtectedRoute from './components/ProtectedRoute';
import { motion } from 'framer-motion';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-light text-gray-dark font-sans overflow-x-hidden max-w-full">
      <Navbar />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="overflow-x-hidden max-w-full"
      >
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/components" element={<ComponentsShowcase />} />
          <Route path="/home" element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/profile/edit" element={
            <ProtectedRoute>
              <ProfileEditPage />
            </ProtectedRoute>
          } />
          <Route path="/school/profile/edit" element={
            <ProtectedRoute>
              <ProfileEditPage />
            </ProtectedRoute>
          } />
          <Route path="/profile/settings" element={
            <ProtectedRoute>
              <ProfileSettingsPage />
            </ProtectedRoute>
          } />
          <Route path="/profile/setup" element={
            <ProtectedRoute requireProfileCompletion={false}>
              <ProfileSetupPage />
            </ProtectedRoute>
          } />
          <Route path="/school/setup" element={
            <ProtectedRoute requireProfileCompletion={false}>
              <SchoolProfileSetup />
            </ProtectedRoute>
          } />
          <Route path="/schools" element={
            <ProtectedRoute>
              <SchoolsPage />
            </ProtectedRoute>
          } />
          <Route path="/schools/:id" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/schools/by-user/:userId" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/profile/:id" element={
            <ProtectedRoute>
              <UserProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/messages" element={
            <ProtectedRoute>
              <MessagesPage />
            </ProtectedRoute>
          } />
          <Route path="/discussions" element={
            <ProtectedRoute>
              <DiscussionsPage />
            </ProtectedRoute>
          } />
          <Route path="/discussions/create" element={
            <ProtectedRoute>
              <CreateDiscussionPage />
            </ProtectedRoute>
          } />
          <Route path="/discussions/:id" element={
            <ProtectedRoute>
              <DiscussionDetailPage />
            </ProtectedRoute>
          } />
          <Route path="/test-messages" element={
            <ProtectedRoute>
              <TestMessagesPage />
            </ProtectedRoute>
          } />
          <Route path="/login" element={
            <ProtectedRoute requireAuth={false}>
              <Login />
            </ProtectedRoute>
          } />
          <Route path="/register" element={
            <ProtectedRoute requireAuth={false}>
              <Register />
            </ProtectedRoute>
          } />
          <Route path="/school/login" element={
            <ProtectedRoute requireAuth={false}>
              <SchoolLogin />
            </ProtectedRoute>
          } />
          <Route path="/school/register" element={
            <ProtectedRoute requireAuth={false}>
              <SchoolRegister />
            </ProtectedRoute>
          } />
          <Route path="/forgot-password" element={
            <ProtectedRoute requireAuth={false}>
              <ForgotPassword />
            </ProtectedRoute>
          } />
          <Route path="/reset-password" element={
            <ProtectedRoute requireAuth={false}>
              <ResetPassword />
            </ProtectedRoute>
          } />
          <Route path="/confirm" element={<ConfirmPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </motion.div>
    </div>
  );
};

export default App;