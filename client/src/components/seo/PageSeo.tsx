import React from 'react';
import Metadata from './Metadata';
import { BreadcrumbStructuredData } from './StructuredData';
import { useSeo } from '@/contexts/SeoContext';

interface PageSeoProps {
  title: string;
  description: string;
  pageName: string;
  imageUrl?: string;
  keywords?: string;
}

const PageSeo: React.FC<PageSeoProps> = ({
  title,
  description,
  pageName,
  imageUrl,
  keywords
}) => {
  const { 
    siteName, 
    siteUrl, 
    siteImage 
  } = useSeo();

  const pageUrl = `${siteUrl}/${pageName.toLowerCase()}`;
  const fullImageUrl = imageUrl 
    ? (imageUrl.startsWith('http') ? imageUrl : `${siteUrl}${imageUrl}`)
    : `${siteUrl}${siteImage}`;
  
  return (
    <>
      <Metadata
        title={`${title} | ${siteName}`}
        description={description}
        imageUrl={fullImageUrl}
        type="website"
        canonicalUrl={pageUrl}
        keywords={keywords}
      />
      
      <BreadcrumbStructuredData
        items={[
          { name: 'Home', url: siteUrl },
          { name: pageName, url: pageUrl }
        ]}
      />
    </>
  );
};

export default PageSeo;