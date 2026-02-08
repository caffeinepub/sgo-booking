export function isDebugEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Enable in development
  if (import.meta.env.DEV) return true;
  
  // Enable with URL param
  const params = new URLSearchParams(window.location.search);
  return params.get('debug') === '1';
}
