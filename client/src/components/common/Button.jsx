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
    primary: "bg-gradient-to-r from-[#144979] via-[#0E355C] to-[#0A2644] hover:from-[#1A5B96] hover:via-[#134778] hover:to-[#0D3157] text-white shadow-md hover:shadow-lg border border-[#144979]/40",
    secondary: "bg-white/80 border-2 border-[#0E355C] text-[#0E355C] hover:bg-gradient-to-r hover:from-[#144979] hover:to-[#0A2644] hover:text-white shadow-sm",
    outline: "bg-transparent border-2 border-[#0E355C] text-[#0E355C] hover:bg-gradient-to-r hover:from-[#144979] hover:to-[#0A2644] hover:text-white hover:border-transparent shadow-sm",
    gold: "bg-gradient-to-r from-[#0284C7] to-[#0369A1] hover:from-[#0369A1] hover:to-[#075985] text-white shadow-md",
    white: "bg-gradient-to-r from-white to-[#E3EFF9] text-[#0A2644] border border-[#B8D7EF] hover:from-[#EBF4FC] hover:to-[#D8EAF7] shadow-sm font-semibold"
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
