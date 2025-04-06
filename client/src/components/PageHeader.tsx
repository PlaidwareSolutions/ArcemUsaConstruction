import React from 'react';
import { motion } from 'framer-motion';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  children?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, backgroundImage, children }: PageHeaderProps) {
  return (
    <div 
      className="w-full relative"
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '450px',
      }}
    >
      {/* Overlay for dark background images */}
      {backgroundImage && (
        <div className="absolute inset-0 bg-black/60"></div>
      )}
      
      <div className={`container mx-auto px-4 py-20 md:py-28 lg:py-32 relative ${backgroundImage ? 'text-white' : ''}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">{title}</h1>
          {subtitle && (
            <p className="text-xl md:text-2xl mb-8 max-w-3xl">
              {subtitle.split('\\n').map((line, index) => (
                <span key={index} className="block">{line}</span>
              ))}
            </p>
          )}
          {children && 
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {children}
            </motion.div>
          }
        </motion.div>
      </div>
    </div>
  );
}