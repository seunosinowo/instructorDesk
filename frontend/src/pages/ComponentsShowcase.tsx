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

import {
  HeroSection,
  StatsSection,
  FeaturesSection,
  ForSection,
  SecuritySection,
  CTASection,
  Footer
} from '../components/Landing';

const ComponentsShowcase: React.FC = () => {
  return (
    <div className="font-sans">
      <div className="bg-blue-50 p-8 text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Landing Page Components Showcase</h1>
        <p className="text-xl text-gray-700">All components separated and organized for the landing page</p>
      </div>
      
      <div className="space-y-16">
        {/* Hero Section */}
        <section>
          <div className="bg-gray-100 p-4 text-center mb-4">
            <h2 className="text-2xl font-bold">Hero Section</h2>
          </div>
          <HeroSection />
        </section>

        {/* Stats Section */}
        <section>
          <div className="bg-gray-100 p-4 text-center mb-4">
            <h2 className="text-2xl font-bold">Stats Section</h2>
          </div>
          <StatsSection />
        </section>

        {/* Features Section */}
        <section>
          <div className="bg-gray-100 p-4 text-center mb-4">
            <h2 className="text-2xl font-bold">Features Section</h2>
          </div>
          <FeaturesSection />
        </section>

        {/* For Students Section */}
        <section>
          <div className="bg-gray-100 p-4 text-center mb-4">
            <h2 className="text-2xl font-bold">For Students Section</h2>
          </div>
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
        </section>

        {/* For Teachers Section */}
        <section>
          <div className="bg-gray-100 p-4 text-center mb-4">
            <h2 className="text-2xl font-bold">For Teachers Section</h2>
          </div>
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
        </section>

        {/* Security Section */}
        <section>
          <div className="bg-gray-100 p-4 text-center mb-4">
            <h2 className="text-2xl font-bold">Security Section</h2>
          </div>
          <SecuritySection />
        </section>

        {/* CTA Section */}
        <section>
          <div className="bg-gray-100 p-4 text-center mb-4">
            <h2 className="text-2xl font-bold">CTA Section</h2>
          </div>
          <CTASection />
        </section>

        {/* Footer */}
        <section>
          <div className="bg-gray-100 p-4 text-center mb-4">
            <h2 className="text-2xl font-bold">Footer</h2>
          </div>
          <Footer />
        </section>
      </div>
    </div>
  );
};

export default ComponentsShowcase;
