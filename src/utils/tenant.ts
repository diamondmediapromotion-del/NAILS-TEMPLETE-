/**
 * Utility to generate full subdomain/path URLs for a given tenant ID.
 * Supports development localhost, custom domain resolution, and path-based routing.
 */
export function getSubdomainUrl(slug: string): string {
  if (typeof window === 'undefined') return '/';

  const host = window.location.host;
  const protocol = window.location.protocol;
  const parts = host.split('.');

  // If the host is in custom subdomain hierarchy format
  if (parts.length > 2) {
    const subdomain = parts[0].toLowerCase();
    const reservedWords = ['localhost', 'ais-dev', 'ais-pre', 'www', 'platform', 'app', 'admin', 'api'];
    if (!reservedWords.includes(subdomain) && !subdomain.startsWith('127') && !subdomain.startsWith('192')) {
      parts[0] = slug;
      return `${protocol}//${parts.join('.')}`;
    }
  }

  // Fallback to path-based routing for dev/preview compatibility
  return `${protocol}//${host}/site/${slug}`;
}
