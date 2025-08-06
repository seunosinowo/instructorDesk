import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      quote: "Teacherrs has completely transformed how I connect with students. I've doubled my tutoring business in just three months!",
      author: "Dr. Sarah Johnson",
      role: "Math Professor",
      avatar: "SJ"
    },
    {
      quote: "As a student struggling with chemistry, finding the right tutor was life-changing. The platform made it so easy to connect with experts.",
      author: "Michael Chen",
      role: "College Student",
      avatar: "MC"
    },
    {
      quote: "The community features are incredible. I've connected with other educators worldwide and shared so many valuable resources.",
      author: "Emma Rodriguez",
      role: "Language Teacher",
      avatar: "ER"
    },
  ];

  return (
    <motion.section 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="py-20 bg-gradient-to-b from-white to-amber-50"
    >
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
          >
            What Our Community Says
          </motion.h2>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            viewport={{ once: true }}
            className="text-xl text-gray-600"
          >
            Join thousands of educators and students transforming education together
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-2xl border border-amber-100 shadow-sm"
            >
              <div className="text-amber-400 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={20} className="inline fill-amber-400" />
                ))}
              </div>
              <p className="text-gray-700 italic text-lg mb-8">"{testimonial.quote}"</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-bold text-gray-900">{testimonial.author}</div>
                  <div className="text-gray-600">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default TestimonialsSection;
