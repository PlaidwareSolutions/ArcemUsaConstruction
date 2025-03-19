import React from 'react';
import { Helmet } from 'react-helmet';

interface MetadataProps {
  title?: string;
  description?: string;
  keywords?: string;
  imageUrl?: string;
  canonicalUrl?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  twitterHandle?: string;
}

/**
 * Metadata component for SEO optimization
 * Uses react-helmet to inject metadata tags into the document head
 */
const Metadata: React.FC<MetadataProps> = ({
  title = 'ARCEM Construction Company | Excellence in Construction',
  description = 'ARCEM Construction Company offers premium construction services including commercial, residential, and renovation projects with a focus on quality and sustainability.',
  keywords = 'construction, ARCEM, commercial construction, residential construction, renovation, building contractor, sustainable construction',
  imageUrl = '/images/arcemusa-social-share.jpg',
  canonicalUrl,
  type = 'website',
  publishedTime,
  modifiedTime,
  author = 'ARCEM Construction Company',
  twitterHandle = '@arcemusa',
}) => {
  // Generate the canonical URL based on the current path if not provided
  const canonical = canonicalUrl || `${window.location.origin}${window.location.pathname}`;
  
  // Generate full image URL if it's a relative path
  const fullImageUrl = imageUrl.startsWith('http') 
    ? imageUrl 
    : `${window.location.origin}${imageUrl}`;

  return (
    <Helmet>
      {/* Basic Metadata */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />

      {/* Additional SEO tags */}
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="author" content={author} />
    </Helmet>
  );
};

export default Metadata;