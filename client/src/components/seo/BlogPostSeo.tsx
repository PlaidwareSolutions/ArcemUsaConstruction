import React from 'react';
import Metadata from './Metadata';
import { ArticleStructuredData, BreadcrumbStructuredData } from './StructuredData';
import { useSeo } from '@/contexts/SeoContext';

interface BlogPostSeoProps {
  title: string;
  description: string;
  imageUrl: string;
  author: string;
  publishedDate: string;
  modifiedDate?: string; // Optional
  url: string;
  slug: string;
}

const BlogPostSeo: React.FC<BlogPostSeoProps> = ({
  title,
  description,
  imageUrl,
  author,
  publishedDate,
  modifiedDate,
  url,
  slug
}) => {
  const { 
    siteName, 
    siteUrl 
  } = useSeo();

  const fullUrl = url || `${siteUrl}/blog/${slug}`;
  const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${siteUrl}${imageUrl}`;
  
  return (
    <>
      <Metadata
        title={`${title} | ${siteName} Blog`}
        description={description}
        imageUrl={fullImageUrl}
        type="article"
        publishedTime={publishedDate}
        modifiedTime={modifiedDate}
        author={author}
        canonicalUrl={fullUrl}
      />
      
      <ArticleStructuredData
        headline={title}
        image={fullImageUrl}
        datePublished={publishedDate}
        dateModified={modifiedDate}
        author={{
          name: author,
        }}
        publisher={{
          name: siteName,
          logo: `${siteUrl}/images/logo.png`,
        }}
        description={description}
        url={fullUrl}
      />
      
      <BreadcrumbStructuredData
        items={[
          { name: 'Home', url: siteUrl },
          { name: 'Blog', url: `${siteUrl}/blog` },
          { name: title, url: fullUrl }
        ]}
      />
    </>
  );
};

export default BlogPostSeo;