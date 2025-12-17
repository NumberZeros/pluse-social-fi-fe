import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSocialFi } from './useSocialFi';
import { toast } from 'react-hot-toast';

export const useMintPost = () => {
  const { sdk } = useSocialFi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, uri }: { title: string; uri: string }) => {
      if (!sdk) throw new Error('SDK not initialized');
      return await sdk.createPost(title, uri);
    },
    onSuccess: () => {
      toast.success('Post minted successfully!');
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['user_nfts'] });
    },
    onError: (error: any) => {
      console.error('Create post error:', error);
      toast.error(error.message || 'Failed to create post');
    },
  });
};
