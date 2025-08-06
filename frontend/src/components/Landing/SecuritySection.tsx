import React from 'react';
import { motion } from 'framer-motion';
import { Lock, ShieldCheck, UserCheck, Bell } from 'lucide-react';

const SecuritySection: React.FC = () => {
  const securityFeatures = [
    { icon: <Lock className="text-orange-600" size={24} />, title: "Secure Authentication", description: "Role-based access control with email verification" },
    { icon: <ShieldCheck className="text-orange-600" size={24} />, title: "Data Protection", description: "End-to-end encryption for all sensitive information" },
    { icon: <UserCheck className="text-orange-600" size={24} />, title: "Verified Profiles", description: "All educators undergo verification before joining" },
    { icon: <Bell className="text-orange-600" size={24} />, title: "Activity Monitoring", description: "Real-time alerts for unusual account activity" },
  ];

  return (
    <motion.section 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white"
    >
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Your Security is Our Priority
          </motion.h2>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            viewport={{ once: true }}
            className="text-xl text-gray-300"
          >
            We implement industry-leading security measures to protect your data and privacy
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {securityFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-gray-800 to-gray-700 p-8 rounded-2xl border border-gray-700 hover:border-orange-500 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default SecuritySection;
