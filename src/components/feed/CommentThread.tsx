import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePostComments, useCreateComment } from '../../hooks/useFeed';
import { useWallet } from '@solana/wallet-adapter-react';
import { usePlatformAction } from '../../hooks/usePlatformAction';
import { useRequireWallet } from '../../hooks/useRequireWallet';
import { toast } from 'react-hot-toast';
import { MessageCircle, Send } from 'lucide-react';
import { Button, Input } from '../../design-system';

interface CommentThreadProps {
  postId: string;
  commentCount?: number;
}

export function CommentThread({ postId, commentCount }: CommentThreadProps) {
  const { publicKey } = useWallet();
  const { guardAction } = usePlatformAction();
  const requireWallet = useRequireWallet();
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const { data: comments = [], isLoading } = usePostComments(isOpen ? postId : undefined);
  const createComment = useCreateComment();

  const handleSubmit = () => {
    guardAction(() => {
      if (!requireWallet()) return;
      if (!content.trim()) return;
      if (content.length > 280) {
        toast.error('Comment must be 280 characters or less');
        return;
      }

      createComment.mutate(
        { postId, content: content.trim() },
        {
          onSuccess: () => {
            setContent('');
            toast.success('Comment posted!');
          },
          onError: () => toast.error('Failed to post comment'),
        },
      );
    });
  };

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:text-info transition-colors group text-muted"
      >
        <div className="p-2 rounded-pill group-hover:bg-info/10 transition-colors">
          <MessageCircle className="w-5 h-5" />
        </div>
        <span className="text-sm font-medium">{commentCount ?? comments.length}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-border space-y-3"
          >
            {publicKey && (
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write a comment..."
                  maxLength={280}
                  className="flex-1 h-auto py-2 text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSubmit}
                  disabled={createComment.isPending || !content.trim()}
                  className="px-3"
                  aria-label="Post comment"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            )}

            {isLoading ? (
              <p className="text-sm text-muted">Loading comments...</p>
            ) : comments.length === 0 ? (
              <p className="text-sm text-muted">No comments yet. Be the first!</p>
            ) : (
              comments.map((comment: { publicKey: string; author: string; content: string; created_at: number }) => (
                <div key={comment.publicKey} className="flex gap-3 text-sm">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author}`}
                    alt=""
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex-1 bg-surface-2 rounded-xl px-3 py-2">
                    <span className="font-bold text-muted">
                      {comment.author.slice(0, 4)}...{comment.author.slice(-4)}
                    </span>
                    <p className="text-foreground mt-1">{comment.content}</p>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
