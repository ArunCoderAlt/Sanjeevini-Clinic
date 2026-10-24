import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { classNames } from '../../utils/helpers';

export default function Button({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  className = '', 
  href, 
  to,
  onClick, 
  icon: Icon, 
  loading = false,
  ...props 
}) {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-md transition-colors duration-300 gap-2 cursor-pointer";
  
  const variants = {
    primary: "bg-[#1880B8] text-white hover:bg-[#146B9B] shadow-md",
    secondary: "bg-transparent border-2 border-[#1880B8] text-[#1880B8] hover:bg-[#1880B8] hover:text-white",
    outline: "bg-transparent border-2 border-white/60 text-white hover:bg-white/10 shadow-sm",
    gold: "bg-[#0284C7] text-white hover:bg-[#0275B1] shadow-md",
    white: "bg-white text-[#1880B8] hover:bg-gray-50 shadow-sm"
  };
  
  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };

  const buttonClasses = classNames(baseStyles, variants[variant] || variants.primary, sizes[size], className);
  
  const content = (
    <>
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {!loading && Icon && <Icon className="w-5 h-5" />}
      {children}
    </>
  );

  const motionProps = {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 }
  };

  const destination = to || href;

  if (destination) {
    const isExternal = destination.startsWith('http') || destination.startsWith('mailto:') || destination.startsWith('tel:');
    if (isExternal) {
      return (
        <motion.div {...motionProps} className="inline-block">
          <a href={destination} className={buttonClasses} onClick={onClick} target="_blank" rel="noopener noreferrer" {...props}>
            {content}
          </a>
        </motion.div>
      );
    }
    return (
      <motion.div {...motionProps} className="inline-block">
        <Link to={destination} className={buttonClasses} onClick={onClick} {...props}>
          {content}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.button 
      {...motionProps}
      onClick={onClick} 
      className={buttonClasses} 
      disabled={loading}
      {...props}
    >
      {content}
    </motion.button>
  );
}
