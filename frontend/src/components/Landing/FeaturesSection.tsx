import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, MessageSquare, Users, BarChart2, ShieldCheck, Bookmark } from 'lucide-react';

const FeaturesSection: React.FC = () => {
  const features = [
    { 
      icon: <BookOpen className="text-amber-600" size={32} />, 
      title: "Learning Profiles", 
      description: "Create detailed academic profiles showcasing your skills, goals, and learning preferences."
    },
    { 
      icon: <MessageSquare className="text-amber-600" size={32} />, 
      title: "Direct Messaging", 
      description: "Communicate directly with teachers and students for personalized guidance."
    },
    { 
      icon: <Users className="text-amber-600" size={32} />, 
      title: "Study Communities", 
      description: "Join groups based on subjects, interests, or educational levels."
    },
    { 
      icon: <BarChart2 className="text-amber-600" size={32} />, 
      title: "Progress Tracking", 
      description: "Monitor your learning journey with visual progress metrics."
    },
    { 
      icon: <ShieldCheck className="text-amber-600" size={32} />, 
      title: "Verified Educators", 
      description: "All teachers are verified to ensure quality and expertise."
    },
    { 
      icon: <Bookmark className="text-amber-600" size={32} />, 
      title: "Save Resources", 
      description: "Bookmark valuable content and learning materials for later."
    },
  ];

  return (
    <motion.section 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="py-20 bg-gradient-to-b from-amber-50 to-white"
    >
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
          >
            Why Choose <span className="text-orange-600">Teechha</span>
          </motion.h2>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            viewport={{ once: true }}
            className="text-xl text-gray-600"
          >
            Our platform is designed to revolutionize the way students and teachers connect
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-2xl border border-amber-100 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default FeaturesSection;
