import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  siteName?: string;
  locale?: string;
  alternateLocales?: string[];
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'India Tour - Discover Incredible India',
  description = 'Explore the incredible diversity of India with our comprehensive travel guide. Discover destinations, attractions, culture, and plan your perfect Indian adventure.',
  keywords = 'India travel, tourism, destinations, attractions, culture, heritage, vacation, trip planning',
  image = '/images/india-tour-og.jpg',
  url = 'https://indiatour.com',
  type = 'website',
  author = 'India Tour Team',
  publishedTime,
  modifiedTime,
  siteName = 'India Tour',
  locale = 'en_US',
  alternateLocales = ['hi_IN']
}) => {
  const fullTitle = title.includes('India Tour') ? title : `${title} | India Tour`;
  const canonicalUrl = url.startsWith('http') ? url : `https://indiatour.com${url}`;
  const imageUrl = image.startsWith('http') ? image : `https://indiatour.com${image}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#ea580c" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:alt" content={title} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />
      
      {alternateLocales.map((altLocale) => (
        <meta key={altLocale} property="og:locale:alternate" content={altLocale} />
      ))}
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:image:alt" content={title} />
      <meta name="twitter:site" content="@indiatour" />
      <meta name="twitter:creator" content="@indiatour" />
      
      {/* Article specific meta tags */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}
      
      {/* Additional SEO Meta Tags */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="msapplication-TileColor" content="#ea580c" />
      <meta name="msapplication-config" content="/browserconfig.xml" />
      
      {/* Geo Meta Tags for India */}
      <meta name="geo.region" content="IN" />
      <meta name="geo.country" content="India" />
      <meta name="geo.placename" content="India" />
      
      {/* Language alternates */}
      <link rel="alternate" hrefLang="en" href={canonicalUrl} />
      <link rel="alternate" hrefLang="hi" href={`${canonicalUrl}?lang=hi`} />
      <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />
      
      {/* Structured Data - JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "TravelAgency",
          "name": siteName,
          "description": description,
          "url": canonicalUrl,
          "logo": `${canonicalUrl}/logo.png`,
          "image": imageUrl,
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "IN",
            "addressRegion": "Delhi",
            "addressLocality": "New Delhi"
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+91-11-1234-5678",
            "contactType": "customer service",
            "availableLanguage": ["English", "Hindi"]
          },
          "sameAs": [
            "https://facebook.com/indiatour",
            "https://twitter.com/indiatour",
            "https://instagram.com/indiatour",
            "https://youtube.com/indiatour"
          ]
        })}
      </script>
    </Helmet>
  );
};

export default SEOHead;
