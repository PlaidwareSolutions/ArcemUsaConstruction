import React from 'react';

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
      }}
    >
      {/* Overlay for dark background images */}
      {backgroundImage && (
        <div className="absolute inset-0 bg-black/50"></div>
      )}
      
      <div className={`container mx-auto px-4 py-16 md:py-24 relative ${backgroundImage ? 'text-white' : ''}`}>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">{title}</h1>
        {subtitle && <p className="text-xl md:text-2xl mb-6 max-w-3xl">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}