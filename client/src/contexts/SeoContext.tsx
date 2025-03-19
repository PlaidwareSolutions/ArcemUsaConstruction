import React, { createContext, useContext, ReactNode, useState } from 'react';

interface SeoContextType {
  siteTitle: string;
  setSiteTitle: (title: string) => void;
  siteDescription: string;
  setSiteDescription: (description: string) => void;
  siteName: string;
  setSiteName: (name: string) => void;
  siteUrl: string;
  setSiteUrl: (url: string) => void;
  siteImage: string;
  setSiteImage: (image: string) => void;
  siteTwitterHandle: string;
  setSiteTwitterHandle: (handle: string) => void;
}

const defaultSeoContext: SeoContextType = {
  siteTitle: 'ARCEM Construction Company | Excellence in Construction',
  setSiteTitle: () => {},
  siteDescription: 'ARCEM Construction Company offers premium construction services including commercial, residential, and renovation projects with a focus on quality and sustainability.',
  setSiteDescription: () => {},
  siteName: 'ARCEM Construction',
  setSiteName: () => {},
  siteUrl: typeof window !== 'undefined' ? window.location.origin : 'https://arcemusa.com',
  setSiteUrl: () => {},
  siteImage: '/images/arcemusa-social-share.jpg',
  setSiteImage: () => {},
  siteTwitterHandle: '@arcemusa',
  setSiteTwitterHandle: () => {},
};

const SeoContext = createContext<SeoContextType>(defaultSeoContext);

export const SeoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [siteTitle, setSiteTitle] = useState(defaultSeoContext.siteTitle);
  const [siteDescription, setSiteDescription] = useState(defaultSeoContext.siteDescription);
  const [siteName, setSiteName] = useState(defaultSeoContext.siteName);
  const [siteUrl, setSiteUrl] = useState(defaultSeoContext.siteUrl);
  const [siteImage, setSiteImage] = useState(defaultSeoContext.siteImage);
  const [siteTwitterHandle, setSiteTwitterHandle] = useState(defaultSeoContext.siteTwitterHandle);

  return (
    <SeoContext.Provider
      value={{
        siteTitle,
        setSiteTitle,
        siteDescription,
        setSiteDescription,
        siteName,
        setSiteName,
        siteUrl,
        setSiteUrl,
        siteImage,
        setSiteImage,
        siteTwitterHandle,
        setSiteTwitterHandle,
      }}
    >
      {children}
    </SeoContext.Provider>
  );
};

export const useSeo = () => useContext(SeoContext);

export default SeoContext;