import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * SEOHead Component - Manages per-page meta tags for SEO
 * 
 * @param {string} title - Page-specific title (will be appended with " | Zency Flow")
 * @param {string} description - Page-specific description
 * @param {string} path - Current page path (e.g., "/goals")
 * @param {string} image - Optional custom OG image URL
 */
export function SEOHead({
    title,
    description,
    path = '',
    image = 'https://zency-flow.web.app/og-image.png'
}) {
    const baseUrl = 'https://zency-flow.web.app';
    const fullTitle = title ? `${title} | Zency Flow` : 'Zency Flow - Personal Productivity & Self-Improvement App';
    const fullUrl = `${baseUrl}${path}`;

    const defaultDescription = 'Zency Flow is your personal productivity companion for goal setting, habit tracking, sleep monitoring, journaling, and rewards. Created by Sudeep Mukul at Zency Studios.';
    const metaDescription = description || defaultDescription;

    return (
        <Helmet>
            {/* Primary Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="title" content={fullTitle} />
            <meta name="description" content={metaDescription} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={metaDescription} />
            <meta property="og:image" content={image} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={fullUrl} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={metaDescription} />
            <meta name="twitter:image" content={image} />

            {/* Canonical URL */}
            <link rel="canonical" href={fullUrl} />
        </Helmet>
    );
}
