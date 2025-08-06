import React from 'react';
import { 
  Search,
  BookOpen, 
  MessageSquare, 
  Users, 
  BarChart2,
  Calendar,
  Star,
  Globe,
  UserCheck,
  Bookmark,
  GraduationCap,
  Briefcase
} from 'lucide-react';

// Import all components
import HeroSection from './HeroSection';
import StatsSection from './StatsSection';
import FeaturesSection from './FeaturesSection';
import ForSection from './ForSection';
import SecuritySection from './SecuritySection';
import CTASection from './CTASection';
import Footer from './Footer';

const LandingPage: React.FC = () => {
  return (
    <div className="font-sans">
      {/* Hero Section */}
      <HeroSection />
      
      {/* Stats Section */}
      <StatsSection />
      
      {/* Features Section */}
      <FeaturesSection />
      
      {/* For Students Section */}
      <ForSection 
        title="For Students" 
        icon={<GraduationCap className="text-orange-500" size={24} />}
        features={[
          { icon: <Search size={20} />, text: "Find qualified teachers in any subject" },
          { icon: <BookOpen size={20} />, text: "Create detailed learning profiles" },
          { icon: <MessageSquare size={20} />, text: "Direct messaging with educators" },
          { icon: <Users size={20} />, text: "Join study groups and communities" },
          { icon: <BarChart2 size={20} />, text: "Track your learning progress" },
        ]}
      />
      
      {/* For Teachers Section */}
      <ForSection 
        title="For Teachers" 
        icon={<Briefcase className="text-orange-500" size={24} />}
        features={[
          { icon: <Globe size={20} />, text: "Showcase your qualifications globally" },
          { icon: <UserCheck size={20} />, text: "Connect with motivated students" },
          { icon: <Bookmark size={20} />, text: "Build your educational portfolio" },
          { icon: <Star size={20} />, text: "Share your expertise and insights" },
          { icon: <Calendar size={20} />, text: "Manage your teaching schedule" },
        ]}
        reverse
      />
      
      {/* Security Section */}
      <SecuritySection />
      
      {/* CTA Section */}
      <CTASection />
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;
