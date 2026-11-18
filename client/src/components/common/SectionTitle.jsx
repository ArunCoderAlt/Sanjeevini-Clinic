import { motion } from 'framer-motion';
import { classNames } from '../../utils/helpers';

export default function SectionTitle({ 
  subtitle, 
  title, 
  description, 
  alignment = 'center', 
  light = false 
}) {
  const alignClasses = {
    left: 'text-left items-start',
    center: 'text-center items-center mx-auto'
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
      className={classNames('flex flex-col mb-12', alignClasses[alignment])}
    >
      {subtitle && (
        <span className={classNames(
          "uppercase tracking-wider text-sm font-bold mb-2",
          light ? "text-gold" : "text-dark-blue-gradient"
        )}>
          {subtitle}
        </span>
      )}
      <h2 className={classNames(
        "text-3xl md:text-4xl lg:text-5xl font-heading mb-4",
        light ? "text-white" : "text-dark"
      )}>
        {title}
      </h2>
      <motion.div 
        initial={{ width: 0 }}
        whileInView={{ width: '80px' }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className={classNames(
          "h-1 mb-6 rounded-full",
          light
            ? "bg-gradient-to-r from-[#4BA3DC] to-[#1D6DA8]"
            : "bg-gradient-to-r from-[#0369A1] via-[#1D4ED8] to-[#1E40AF]"
        )}
      />
      {description && (
        <p className={classNames(
          "max-w-2xl text-lg",
          light ? "text-gray-200" : "text-gray-600"
        )}>
          {description}
        </p>
      )}
    </motion.div>
  );
}
