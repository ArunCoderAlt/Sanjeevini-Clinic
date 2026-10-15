import React from 'react';
import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';
import { classNames } from '../../utils/helpers';

export default function Loading({ fullPage = false, className = '' }) {
  const content = (
    <div className={classNames("flex flex-col items-center justify-center space-y-4", className)}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="relative"
      >
        <div className="w-16 h-16 border-4 border-sage border-t-primary rounded-full animate-spin"></div>
        <Leaf className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-primary w-6 h-6" />
      </motion.div>
      <p className="text-primary font-medium animate-pulse">Loading...</p>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-cream/90 backdrop-blur-sm z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
}
