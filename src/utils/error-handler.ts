import { toast } from 'react-hot-toast';

/**
 * Higher-order function that wraps async operations with toast notifications
 * Eliminates duplicate try-catch-toast patterns across the codebase
 * 
 * @param operation - The async operation to execute
 * @param messages - Toast messages for different states
 * @returns The result of the operation or null on error
 * 
 * @example
 * const result = await withToast(
 *   () => sdk.createPost(uri),
 *   { loading: 'Creating post...', success: 'Post created!', error: 'Failed to create post' }
 * );
 */
export async function withToast<T>(
  operation: () => Promise<T>,
  messages: {
    loading: string;
    success: string;
    error: string | ((error: any) => string);
  }
): Promise<T | null> {
  const toastId = toast.loading(messages.loading);

  try {
    const result = await operation();
    toast.success(messages.success, { id: toastId });
    return result;
  } catch (error: any) {
    console.error('Operation failed:', error);

    const errorMessage = typeof messages.error === 'function' 
      ? messages.error(error) 
      : messages.error;

    toast.error(errorMessage, { id: toastId });
    return null;
  }
}

/**
 * Parse Anchor program errors into user-friendly messages
 * Handles common error codes and patterns
 * 
 * @param error - The error object from Anchor
 * @returns User-friendly error message
 */
export function parseAnchorError(error: any): string {
  if (!error) return 'Unknown error occurred';

  const message = error?.message || error?.toString() || '';

  // Common Anchor error patterns
  if (message.includes('0x0')) return 'Insufficient funds for transaction';
  if (message.includes('0x1')) return 'Platform not initialized. Contact admin.';
  if (message.includes('0x2')) return 'Platform is currently paused';
  if (message.includes('0x3')) return 'Unauthorized action';
  if (message.includes('0x1771') || message.includes('AlreadyInUse')) return 'Account already exists';
  if (message.includes('0x7d3')) return 'Account not initialized';
  if (message.includes('insufficient')) return 'Insufficient SOL balance';
  if (message.includes('blockhash')) return 'Transaction expired, please retry';
  if (message.includes('simulate')) return 'Transaction simulation failed';
  if (message.includes('timeout')) return 'Transaction timed out, please retry';

  // Return original message if no pattern matches
  return message.split('\n')[0].substring(0, 100); // First line, max 100 chars
}

/**
 * Create a custom error parser for specific operations
 * Useful for domain-specific error handling
 * 
 * @example
 * const parsePostError = createErrorParser({
 *   '0x1': 'Post already exists',
 *   '0x2': 'Invalid post content'
 * });
 */
export function createErrorParser(customErrors: Record<string, string>) {
  return (error: any): string => {
    const message = error?.message || error?.toString() || '';
    
    // Check custom errors first
    for (const [code, description] of Object.entries(customErrors)) {
      if (message.includes(code)) return description;
    }
    
    // Fall back to default parser
    return parseAnchorError(error);
  };
}

/**
 * Wrapper that combines withToast and parseAnchorError
 * Most common use case in the app
 * 
 * @example
 * const result = await withAnchorToast(
 *   () => sdk.createProfile(username),
 *   { loading: 'Creating profile...', success: 'Profile created!' }
 * );
 */
export async function withAnchorToast<T>(
  operation: () => Promise<T>,
  messages: {
    loading: string;
    success: string;
    customErrorParser?: (error: any) => string;
  }
): Promise<T | null> {
  return withToast(operation, {
    loading: messages.loading,
    success: messages.success,
    error: messages.customErrorParser || parseAnchorError,
  });
}
