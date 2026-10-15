import React from 'react';
import { Star, Quote } from 'lucide-react';
import { motion } from 'framer-motion';

const TestimonialCard = ({ testimonial }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white p-8 rounded-3xl shadow-sm border border-sage h-full flex flex-col relative"
    >
      <div className="absolute -top-5 right-8 bg-sage w-10 h-10 rounded-full flex items-center justify-center text-primary-700">
        <Quote className="w-5 h-5" fill="currentColor" />
      </div>
      <div className="flex gap-1 mb-4 mt-2">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={`w-4 h-4 ${i < testimonial.rating ? 'text-gold fill-gold' : 'text-gray-200'}`} />
        ))}
      </div>
      <p className="text-gray-700 italic flex-grow mb-6 leading-relaxed">"{testimonial.review || testimonial.text}"</p>
      <div className="border-t border-sage pt-4">
        <h4 className="font-serif text-primary-700 font-semibold">{testimonial.name}</h4>
        <p className="text-sm text-gray-500">{testimonial.location}</p>
      </div>
    </motion.div>
  );
};

export default TestimonialCard;
