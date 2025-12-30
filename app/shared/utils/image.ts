export function getWorkerPictureUrl(worker: any): string {
  if (!worker) return '';

  // Prefer explicit picture_url if provided by some endpoints
  if (typeof worker.picture_url === 'string' && worker.picture_url) return worker.picture_url;

  // If picture field is an object with a uri (mobile-style), use that
  if (worker.picture && typeof worker.picture === 'object' && typeof worker.picture.uri === 'string') return worker.picture.uri;

  // If picture is a full URL string, use it
  if (typeof worker.picture === 'string' && (worker.picture.startsWith('http://') || worker.picture.startsWith('https://'))) {
    return worker.picture;
  }

  // If picture is a relative path (stored in DB), serve via the backend picture endpoint
  const base = (typeof window !== 'undefined' && (window as any).API_BASE_URL) || '';
  if (worker.id && worker.picture) {
    const prefix = base || '/';
    return `${prefix}api/workers/${worker.id}/picture?timestamp=${Date.now()}`;
  }

  return '';
}
