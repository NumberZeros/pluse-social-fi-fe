import { toast } from 'react-hot-toast';
import type { SocialFiSDK } from '../services/socialfi-sdk';

const PAUSED_MESSAGE = 'Platform is paused. Transactions are temporarily disabled.';

export async function assertPlatformNotPaused(sdk: SocialFiSDK | null): Promise<void> {
  if (!sdk) throw new Error('SDK not initialized');
  const config = await sdk.getPlatformConfig();
  if (config?.paused) {
    toast.error(PAUSED_MESSAGE);
    throw new Error(PAUSED_MESSAGE);
  }
}
