/**
 * decoded.finance — Utility Functions
 */

/** Format a date string (YYYY-MM-DD) to a readable format */
export function formatDate(dateString: string): string {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

/** Format a short date (e.g., "Mar 2024") */
export function formatShortDate(dateString: string): string {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
    });
}

/** Format SAR currency */
export function formatSAR(value: number): string {
    return `SAR ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Format percentage with sign */
export function formatPercent(value: number): string {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
}

/** Get performance CSS class */
export function performanceClass(value: number): string {
    if (value > 0) return 'performance-positive';
    if (value < 0) return 'performance-negative';
    return 'performance-neutral';
}

/** Estimate reading time for content */
export function readingTime(text: string): number {
    const wordsPerMinute = 200;
    const words = text.split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
}

/** Create a URL-friendly slug from text */
export function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}
