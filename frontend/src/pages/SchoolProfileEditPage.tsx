import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const SchoolProfileEditPage: React.FC = () => {
  const [formData, setFormData] = useState({
    schoolName: '',
    address: '',
    city: '',
    state: '',
    country: '',
    phoneNumber: '',
    website: '',
    schoolType: '',
    gradeLevels: [],
    studentCount: '',
    teacherCount: '',
    establishedYear: '',
    description: '',
    facilities: [],
    extracurricularActivities: [],
    accreditations: '',
    socialLinks: {
      facebook: '',
      instagram: '',
      twitter: '',
      linkedin: ''
    },
    profilePictureUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    // Fetch the school profile data
    const fetchSchoolData = async () => {
      if (!userId || !token) return;

      setLoading(true);
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/profile/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const profile = res.data.profile;
        if (profile) {
          setFormData({ ...formData, ...profile });
        }
      } catch (err: any) {
        setError('Failed to load school data.');
        console.error('Error fetching school:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchoolData();
  }, [userId, token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError('');
    try {
      // Convert string values to appropriate types and build submit data
      const submitData: any = {
        schoolName: formData.schoolName,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        schoolType: formData.schoolType,
        gradeLevels: formData.gradeLevels,
        facilities: formData.facilities,
        extracurricularActivities: formData.extracurricularActivities,
        socialLinks: formData.socialLinks
      };

      // Add optional fields only if they have values
      if (formData.phoneNumber) submitData.phoneNumber = formData.phoneNumber;
      if (formData.website) submitData.website = formData.website;
      if (formData.studentCount) submitData.studentCount = parseInt(formData.studentCount);
      if (formData.teacherCount) submitData.teacherCount = parseInt(formData.teacherCount);
      if (formData.establishedYear) submitData.establishedYear = parseInt(formData.establishedYear);
      if (formData.description) submitData.description = formData.description;
      if (formData.accreditations) submitData.accreditations = formData.accreditations;

      await axios.put(`${import.meta.env.VITE_API_URL}/profile`, submitData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('Profile updated successfully!');

      // Dispatch custom event to notify profile page of update
      window.dispatchEvent(new CustomEvent('profileUpdated'));

      // Navigate back to the school profile with page reload
      setTimeout(() => {
        window.location.href = `/schools/by-user/${userId}`;
      }, 1500);
    } catch (err: any) {
      setError('Failed to update profile.');
      console.error('Error updating school:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <motion.form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl space-y-6">
        <h2 className="text-2xl font-bold mb-4">Edit School Profile</h2>
        {error && <div className="text-red-500">{error}</div>}
        {success && <div className="text-green-500">{success}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="schoolName" value={formData.schoolName} onChange={handleChange} placeholder="School Name" className="input" required />
          <input name="address" value={formData.address} onChange={handleChange} placeholder="Address" className="input" required />
          <input name="city" value={formData.city} onChange={handleChange} placeholder="City" className="input" required />
          <input name="state" value={formData.state} onChange={handleChange} placeholder="State" className="input" required />
          <input name="country" value={formData.country} onChange={handleChange} placeholder="Country" className="input" required />
          <input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="Phone Number" className="input" />
          <input name="website" value={formData.website} onChange={handleChange} placeholder="Website" className="input" />
          <input name="schoolType" value={formData.schoolType} onChange={handleChange} placeholder="School Type" className="input" required />
          <input name="studentCount" value={formData.studentCount} onChange={handleChange} placeholder="Student Count" className="input" />
          <input name="teacherCount" value={formData.teacherCount} onChange={handleChange} placeholder="Teacher Count" className="input" />
          <input name="establishedYear" value={formData.establishedYear} onChange={handleChange} placeholder="Established Year" className="input" />
          <input name="accreditations" value={formData.accreditations} onChange={handleChange} placeholder="Accreditation" className="input" />
        </div>
        <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" className="input" />
        {/* Add fields for gradeLevels, facilities, extracurricularActivities, socialLinks, and profilePictureUrl as needed */}
        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">Save Changes</button>
      </motion.form>
    </div>
  );
};

export default SchoolProfileEditPage;
