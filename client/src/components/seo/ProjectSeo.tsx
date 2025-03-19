import React from 'react';
import Metadata from './Metadata';
import { BreadcrumbStructuredData } from './StructuredData';
import { useSeo } from '@/contexts/SeoContext';

interface ProjectSeoProps {
  title: string;
  description: string;
  imageUrl: string;
  projectId: number;
  category: string;
}

const ProjectSeo: React.FC<ProjectSeoProps> = ({
  title,
  description,
  imageUrl,
  projectId,
  category
}) => {
  const { 
    siteName, 
    siteUrl 
  } = useSeo();

  const projectUrl = `${siteUrl}/projects/${projectId}`;
  const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${siteUrl}${imageUrl}`;
  
  return (
    <>
      <Metadata
        title={`${title} | ${category} Project | ${siteName}`}
        description={description}
        imageUrl={fullImageUrl}
        type="website"
        canonicalUrl={projectUrl}
        keywords={`${category}, construction project, ${title}, ${siteName}`}
      />
      
      <BreadcrumbStructuredData
        items={[
          { name: 'Home', url: siteUrl },
          { name: 'Projects', url: `${siteUrl}/projects` },
          { name: category, url: `${siteUrl}/projects?category=${encodeURIComponent(category)}` },
          { name: title, url: projectUrl }
        ]}
      />
    </>
  );
};

export default ProjectSeo;