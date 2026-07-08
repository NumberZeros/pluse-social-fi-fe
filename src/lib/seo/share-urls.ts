import { SITE_URL } from './constants';

export function getPostShareUrl(postId: string): string {
  return `${SITE_URL}/post/${postId}`;
}

export function getProfileShareUrl(usernameOrAddress: string): string {
  return `${SITE_URL}/${encodeURIComponent(usernameOrAddress)}`;
}

export function getPageShareUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}

export function getFacebookShareUrl(url: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}

export function getTwitterShareUrl(url: string, text?: string): string {
  const params = new URLSearchParams({ url });
  if (text) params.set('text', text);
  return `https://twitter.com/intent/tweet?${params.toString()}`;
}

export function getLinkedInShareUrl(url: string): string {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
}

export function getWhatsAppShareUrl(url: string, text?: string): string {
  const message = text ? `${text} ${url}` : url;
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

export function getTelegramShareUrl(url: string, text?: string): string {
  const params = new URLSearchParams({ url });
  if (text) params.set('text', text);
  return `https://t.me/share/url?${params.toString()}`;
}
