import React from 'react';

const ProfileResetButton: React.FC = () => {
  const resetProfile = () => {
    // Clear profile completion flag
    localStorage.removeItem('profileCompleted');
    
    // Clear any other profile-related data
    localStorage.removeItem('userProfile');
    localStorage.removeItem('profileData');
    
    // Clear session storage too
    sessionStorage.removeItem('profileCompleted');
    sessionStorage.removeItem('userProfile');
    sessionStorage.removeItem('profileData');
    
    alert('Profile data cleared! Refresh the page to test profile setup again.');
    
    // Optionally reload the page
    window.location.reload();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={resetProfile}
        className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-red-600 transition duration-300"
        title="Clear profile data for testing"
      >
        🔄 Reset Profile
      </button>
    </div>
  );
};

export default ProfileResetButton;