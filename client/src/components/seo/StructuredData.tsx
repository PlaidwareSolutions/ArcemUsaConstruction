import React from 'react';
import { Helmet } from 'react-helmet';

interface OrganizationStructuredDataProps {
  name: string;
  url: string;
  logo: string;
  description: string;
  sameAs?: string[];
  address?: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  telephone?: string;
  email?: string;
}

interface LocalBusinessStructuredDataProps extends OrganizationStructuredDataProps {
  priceRange?: string;
  openingHours?: string[];
  geo?: {
    latitude: number;
    longitude: number;
  };
}

interface ArticleStructuredDataProps {
  headline: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  author: {
    name: string;
    url?: string;
  };
  publisher: {
    name: string;
    logo: string;
  };
  description: string;
  url: string;
}

interface BreadcrumbStructuredDataProps {
  items: {
    name: string;
    url: string;
  }[];
}

export const OrganizationStructuredData: React.FC<OrganizationStructuredDataProps> = ({
  name,
  url,
  logo,
  description,
  sameAs = [],
  address,
  telephone,
  email,
}) => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    logo,
    description,
    sameAs,
    ...(address && {
      address: {
        '@type': 'PostalAddress',
        ...address,
      },
    }),
    ...(telephone && { telephone }),
    ...(email && { email }),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
    </Helmet>
  );
};

export const LocalBusinessStructuredData: React.FC<LocalBusinessStructuredDataProps> = (props) => {
  const {
    name,
    url,
    logo,
    description,
    sameAs = [],
    address,
    telephone,
    email,
    priceRange,
    openingHours,
    geo,
  } = props;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name,
    url,
    logo,
    description,
    sameAs,
    ...(address && {
      address: {
        '@type': 'PostalAddress',
        ...address,
      },
    }),
    ...(telephone && { telephone }),
    ...(email && { email }),
    ...(priceRange && { priceRange }),
    ...(openingHours && { openingHoursSpecification: openingHours }),
    ...(geo && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: geo.latitude,
        longitude: geo.longitude,
      },
    }),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
    </Helmet>
  );
};

export const ArticleStructuredData: React.FC<ArticleStructuredDataProps> = ({
  headline,
  image,
  datePublished,
  dateModified,
  author,
  publisher,
  description,
  url,
}) => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    image,
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Person',
      name: author.name,
      ...(author.url && { url: author.url }),
    },
    publisher: {
      '@type': 'Organization',
      name: publisher.name,
      logo: {
        '@type': 'ImageObject',
        url: publisher.logo,
      },
    },
    description,
    url,
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
    </Helmet>
  );
};

export const BreadcrumbStructuredData: React.FC<BreadcrumbStructuredDataProps> = ({ items }) => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
    </Helmet>
  );
};