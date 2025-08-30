import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Building, MapPin, Users, Search, Filter, 
  Globe, Phone, BookOpen, GraduationCap, 
  Calendar, ChevronLeft, ChevronRight
} from 'lucide-react';

interface School {
  id: string;
  schoolName: string;
  address: string;
  city: string;
  state: string;
  country: string;
  phoneNumber?: string;
  website?: string;
  schoolType: string;
  gradeLevels: string[];
  studentCount?: number;
  teacherCount?: number;
  description?: string;
  facilities: string[];
  accreditation?: string;
  establishedYear?: number;
  user: {
    id: string;
    name: string;
    profilePicture?: string;
  };
}

const SchoolsPage: React.FC = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const schoolsPerPage = 12;

  // Fetch schools
  useEffect(() => {
    fetchSchools();
  }, [currentPage]);

  // Filter schools based on search and filters
  useEffect(() => {
    let filtered = schools;

    if (searchTerm) {
      filtered = filtered.filter(school =>
        school.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType) {
      filtered = filtered.filter(school => school.schoolType === selectedType);
    }

    if (selectedCity) {
      filtered = filtered.filter(school => school.city.toLowerCase() === selectedCity.toLowerCase());
    }

    setFilteredSchools(filtered);
  }, [schools, searchTerm, selectedType, selectedCity]);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/schools`, {
        params: {
          page: currentPage,
          limit: schoolsPerPage
        }
      });

      setSchools(response.data.schools);
      setFilteredSchools(response.data.schools);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching schools:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUniqueCities = () => {
    const cities = schools.map(school => school.city);
    return [...new Set(cities)].sort();
  };

  const getSchoolTypeColor = (type: string) => {
    switch (type) {
      case 'public': return 'bg-green-100 text-green-800';
      case 'private': return 'bg-blue-100 text-blue-800';
      case 'charter': return 'bg-purple-100 text-purple-800';
      case 'international': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const SchoolCard: React.FC<{ school: School; index: number }> = ({ school, index }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-orange-100"
      >
        {/* School Header */}
        <div className="relative h-40 bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 overflow-hidden group">
          {school.user.profilePicture ? (
            <img
              src={school.user.profilePicture}
              alt={school.schoolName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-400 to-amber-500">
              <Building size={40} className="text-white/90" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300"></div>
          <div className="absolute top-3 right-3">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shadow-md backdrop-blur-sm ${getSchoolTypeColor(school.schoolType)}`}>
              {school.schoolType.charAt(0).toUpperCase() + school.schoolType.slice(1)}
            </span>
          </div>
        </div>

        {/* School Info */}
        <div className="p-5">
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 hover:text-orange-600 transition-colors">
            {school.schoolName}
          </h3>

          <div className="flex items-center text-gray-600 mb-2">
            <MapPin size={14} className="mr-1.5 text-orange-500" />
            <span className="text-xs font-medium">{school.city}, {school.state}</span>
          </div>

          {school.description && (
            <p className="text-gray-600 text-xs mb-3 line-clamp-2 bg-gradient-to-r from-orange-50 to-amber-50 p-2 rounded-md border-l-2 border-orange-300">
              {school.description.length > 80 ? `${school.description.substring(0, 80)}...` : school.description}
            </p>
          )}

          {/* School Stats - Compact Grid */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {school.studentCount && (
              <div className="flex items-center text-gray-600 bg-gray-50 p-1.5 rounded-md">
                <Users size={12} className="mr-1 text-orange-500" />
                <span className="text-xs font-medium">{school.studentCount > 1000 ? `${Math.floor(school.studentCount/1000)}k` : school.studentCount} students</span>
              </div>
            )}
            {school.teacherCount && (
              <div className="flex items-center text-gray-600 bg-gray-50 p-1.5 rounded-md">
                <GraduationCap size={12} className="mr-1 text-orange-500" />
                <span className="text-xs font-medium">{school.teacherCount} teachers</span>
              </div>
            )}
            {school.gradeLevels.length > 0 && (
              <div className="flex items-center text-gray-600 bg-gray-50 p-1.5 rounded-md">
                <BookOpen size={12} className="mr-1 text-orange-500" />
                <span className="text-xs font-medium">Grades {school.gradeLevels[0]}{school.gradeLevels.length > 1 ? '+' : ''}</span>
              </div>
            )}
            {school.establishedYear && (
              <div className="flex items-center text-gray-600 bg-gray-50 p-1.5 rounded-md">
                <Calendar size={12} className="mr-1 text-orange-500" />
                <span className="text-xs font-medium">Est. {school.establishedYear}</span>
              </div>
            )}
          </div>

          {/* Contact Info - Compact */}
          {(school.phoneNumber || school.website) && (
            <div className="flex items-center justify-between mb-3 text-xs">
              {school.phoneNumber && (
                <div className="flex items-center text-gray-600">
                  <Phone size={12} className="mr-1 text-orange-500" />
                  <span>{school.phoneNumber}</span>
                </div>
              )}
              {school.website && (
                <a
                  href={school.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-600 hover:text-orange-700 font-medium flex items-center"
                >
                  <Globe size={12} className="mr-1" />
                  Website
                </a>
              )}
            </div>
          )}

          {/* View Profile Button */}
          <Link
            to={`/schools/${school.id}`}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-2.5 px-3 rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all duration-200 flex items-center justify-center font-medium text-sm shadow-md hover:shadow-lg hover:scale-[1.02]"
          >
            <Building size={16} className="mr-2" />
            View Profile
          </Link>
        </div>
      </motion.div>
    );
  };

  const PaginationButton: React.FC<{ 
    onClick: () => void; 
    disabled: boolean; 
    children: React.ReactNode;
    active?: boolean;
  }> = ({ onClick, disabled, children, active = false }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center px-4 py-2 rounded-xl transition-all duration-200 ${
        active 
          ? 'bg-orange-500 text-white shadow-md' 
          : 'bg-white text-gray-600 hover:bg-orange-50'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}`}
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 text-white py-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white/15 backdrop-blur-sm p-3 rounded-xl w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Building size={32} className="text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Discover Schools</h1>
            <p className="text-base text-white/90 max-w-lg mx-auto leading-relaxed">
              Find and connect with educational institutions in your area
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 -mt-16 relative z-10">
        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-5 mb-6 border border-orange-100 backdrop-blur-sm"
        >
          <div className="flex items-center mb-4">
            <div className="bg-orange-100 p-2 rounded-lg mr-3">
              <Search className="text-orange-600" size={20} />
            </div>
            <h2 className="text-lg font-bold text-gray-800">Find Your Perfect School</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search schools..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
              />
            </div>

            {/* School Type Filter */}
            <div className="relative group">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={18} />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-gray-50 focus:bg-white transition-all"
              >
                <option value="">All Types</option>
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="charter">Charter</option>
                <option value="international">International</option>
              </select>
            </div>

            {/* City Filter */}
            <div className="relative group">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={18} />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-gray-50 focus:bg-white transition-all"
              >
                <option value="">All Cities</option>
                {getUniqueCities().map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-center bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-3 border border-orange-100">
              <span className="text-orange-800 font-semibold text-sm">
                {filteredSchools.length} school{filteredSchools.length !== 1 ? 's' : ''} found
              </span>
            </div>
          </div>
        </motion.div>

        {/* Schools Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500 mb-4"></div>
              <p className="text-gray-600">Loading schools...</p>
            </div>
          </div>
        ) : filteredSchools.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-white rounded-2xl shadow-lg border border-orange-100"
          >
            <Building size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No schools found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search criteria</p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setSelectedType('');
                setSelectedCity('');
              }}
              className="bg-orange-500 text-white px-6 py-2 rounded-xl hover:bg-orange-600 transition-colors"
            >
              Clear Filters
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredSchools.map((school, index) => (
              <SchoolCard key={school.id} school={school} index={index} />
            ))}
          </motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex justify-center mt-12"
          >
            <div className="flex items-center space-x-2 bg-white p-2 rounded-2xl shadow-lg">
              <PaginationButton
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={20} />
              </PaginationButton>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Show pages around current page
                let pageNum = currentPage - 2 + i;
                if (pageNum < 1) pageNum = i + 1;
                if (pageNum > totalPages) pageNum = totalPages - (4 - i);

                return (
                  <PaginationButton
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    active={currentPage === pageNum}
                    disabled={false}
                  >
                    {pageNum}
                  </PaginationButton>
                );
              })}

              <PaginationButton
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={20} />
              </PaginationButton>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SchoolsPage;