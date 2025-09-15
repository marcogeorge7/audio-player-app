export function getApiBase(): string {
  // For GitHub Pages, we use static JSON files instead of API endpoints
  if (typeof window !== 'undefined') {
    const { hostname } = window.location;
    
    // Get the base path for the application
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
    
    // For local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      console.log('🔧 getApiBase - using local development');
      return '';
    }
    
    // For production (GitHub Pages)
    console.log('🔧 getApiBase - using GitHub Pages with basePath:', basePath);
    return basePath;
  }
  
  // On server, return empty
  console.log('🔧 getApiBase - server-side, returning empty');
  return '';
}
