import { toast } from 'react-hot-toast';

/**
 * Copy text to clipboard with toast notification
 */
export async function copyToClipboard(
  text: string,
  successMessage?: string,
): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(successMessage || 'Copied to clipboard!');
    return true;
  } catch {
    toast.error('Failed to copy to clipboard');
    return false;
  }
}

/**
 * Share content using Web Share API or fallback to clipboard
 */
export async function shareContent(options: {
  title: string;
  text: string;
  url: string;
}): Promise<boolean> {
  // Try native Web Share API first
  if (navigator.share) {
    try {
      await navigator.share(options);
      toast.success('Shared successfully!');
      return true;
    } catch (err) {
      // User cancelled or error
      if ((err as Error).name !== 'AbortError') {
        return await copyToClipboard(options.url);
      }
      return false;
    }
  } else {
    // Fallback to copy link
    return await copyToClipboard(options.url);
  }
}
