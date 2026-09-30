import React from 'react';
import { Helmet } from 'react-helmet-async';
import { SITE_URL } from '../lib/links';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  noIndex?: boolean;
  canonicalUrl?: string;
}

export const DEFAULT_SEO = {
  title: 'GitAlong – Find the developer your project is missing',
  description:
    'Say what you’re building and who you need — a co-founder, contributors, a hackathon team or a mentor. GitAlong matches you on real GitHub work and tells you why.',
  keywords:
    'find a co-founder, technical co-founder, side project partner, open source contributors, hackathon team, developer mentor, find a mentor, developer collaboration, GitHub, collaborator matching',
  image: `${SITE_URL}/og-image.jpg`,
  url: SITE_URL,
  type: 'website',
  author: 'Sreevallabh Kakarala',
};

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
  section,
  tags,
  noIndex = false,
  canonicalUrl,
}) => {
  const seoTitle = title ? (title.includes('GitAlong') ? title : `${title} | GitAlong`) : DEFAULT_SEO.title;
  const seoDescription = description || DEFAULT_SEO.description;
  const seoKeywords = keywords || DEFAULT_SEO.keywords;
  const seoImage = image || DEFAULT_SEO.image;
  const seoUrl = !url ? DEFAULT_SEO.url : url.startsWith('http') ? url : `${SITE_URL}${url === '/' ? '' : url}`;
  const seoAuthor = author || DEFAULT_SEO.author;

  return (
    <Helmet>
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <meta name="keywords" content={seoKeywords} />
      <meta name="author" content={seoAuthor} />

      <link rel="canonical" href={canonicalUrl || seoUrl} />
      {noIndex && <meta name="robots" content="noindex,nofollow" />}

      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={seoUrl} />
      <meta property="og:image" content={seoImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="GitAlong" />
      <meta property="og:locale" content="en_US" />

      {type === 'article' && publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {type === 'article' && modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {type === 'article' && section && <meta property="article:section" content={section} />}
      {type === 'article' && tags && tags.map((tag) => <meta key={tag} property="article:tag" content={tag} />)}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={seoImage} />

      <meta name="theme-color" content="#16A34A" />
      <meta name="application-name" content="GitAlong" />
    </Helmet>
  );
};
