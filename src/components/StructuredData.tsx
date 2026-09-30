import React from 'react';
import { Helmet } from 'react-helmet-async';
import { FOUNDER_GITHUB_URL, GITHUB_REPO_URL, SITE_URL, WEBSITE_REPO_URL } from '../lib/links';

interface StructuredDataProps {
  type: 'WebSite' | 'Organization' | 'WebApplication' | 'FAQPage' | 'Person';
  data: Record<string, unknown>;
}

/**
 * JSON-LD for search engines. Only factual data: no ratings, reviews, user
 * counts or other claims that can't be verified.
 */
export const StructuredData: React.FC<StructuredDataProps> = ({ type, data }) => (
  <Helmet>
    <script type="application/ld+json">{JSON.stringify({ '@context': 'https://schema.org', '@type': type, ...data })}</script>
  </Helmet>
);

const SITE = SITE_URL;

const founder = {
  '@type': 'Person',
  name: 'Sreevallabh Kakarala',
  url: FOUNDER_GITHUB_URL,
};

export const WebsiteStructuredData: React.FC = () => (
  <StructuredData
    type="WebSite"
    data={{
      name: 'GitAlong',
      description: 'Intent-based collaborator matching for developers, backed by their real GitHub work.',
      url: SITE,
    }}
  />
);

export const OrganizationStructuredData: React.FC = () => (
  <StructuredData
    type="Organization"
    data={{
      name: 'GitAlong',
      description: 'Matches developers with co-founders, contributors, hackathon teammates and mentors based on intent and real GitHub work.',
      url: SITE,
      logo: `${SITE}/icon-512.png`,
      founder,
      sameAs: [GITHUB_REPO_URL, WEBSITE_REPO_URL],
    }}
  />
);

export const WebApplicationStructuredData: React.FC = () => (
  <StructuredData
    type="WebApplication"
    data={{
      name: 'GitAlong',
      description: 'Find the developer your project is missing: say what you are building and who you need, and get matches that explain why.',
      url: SITE,
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Web, Android',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      author: founder,
      image: `${SITE}/og-image.jpg`,
    }}
  />
);

export const FAQStructuredData: React.FC<{ items: Array<{ question: string; answer: string }> }> = ({ items }) => (
  <StructuredData
    type="FAQPage"
    data={{
      mainEntity: items.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer },
      })),
    }}
  />
);
