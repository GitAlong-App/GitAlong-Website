import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { SITE_URL } from '../lib/links';

interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => (
  <nav aria-label="Breadcrumb" className={`flex ${className}`}>
    <ol className="flex flex-wrap items-center gap-1 text-body-sm font-bold text-ink-muted">
      <li>
        <Link to="/" className="inline-flex h-12 w-12 items-center justify-center rounded-full hover:bg-card hover:text-green-fg" aria-label="Home">
          <Home className="h-4 w-4" strokeWidth={2.5} aria-hidden />
        </Link>
      </li>
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-1">
          <ChevronRight className="h-4 w-4 text-ink-subtle" strokeWidth={2.5} aria-hidden />
          {item.href && !item.isActive ? (
            <Link to={item.href} className="inline-flex min-h-[48px] items-center rounded-md px-1.5 hover:text-green-fg">
              {item.label}
            </Link>
          ) : (
            <span className={item.isActive ? 'px-1.5 text-ink' : 'px-1.5'} aria-current={item.isActive ? 'page' : undefined}>
              {item.label}
            </span>
          )}
        </li>
      ))}
    </ol>
  </nav>
);

// Structured data for breadcrumbs
export const BreadcrumbStructuredData: React.FC<{ items: BreadcrumbItem[] }> = ({ items }) => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      ...items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 2,
        name: item.label,
        item: item.href ? `${SITE_URL}${item.href}` : undefined,
      })),
    ],
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />;
};
