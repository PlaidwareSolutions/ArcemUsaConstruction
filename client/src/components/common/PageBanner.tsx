import React from 'react';

interface PageBannerProps {
  title: string;
  description?: string;
  backgroundImage?: string;
}

const PageBanner: React.FC<PageBannerProps> = ({ 
  title, 
  description, 
  backgroundImage 
}) => {
  const bannerStyle = backgroundImage ? {
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  } : {};

  return (
    <div 
      className="bg-black text-white relative h-[350px] flex items-center"
      style={bannerStyle}
    >
      <div className="container mx-auto px-4 md:px-8">
        <h1 className="text-4xl md:text-5xl font-montserrat font-bold mb-6">{title}</h1>
        {description && (
          <p className="text-lg max-w-3xl">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

export default PageBanner;
