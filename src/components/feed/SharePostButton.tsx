import { useState, useRef, useEffect } from 'react';
import { Share2, Link2, Facebook, MessageCircle } from 'lucide-react';
import { shareContent } from '../../utils/clipboard';
import {
  getPostShareUrl,
  getProfileShareUrl,
  getFacebookShareUrl,
  getTwitterShareUrl,
  getLinkedInShareUrl,
  getWhatsAppShareUrl,
  getTelegramShareUrl,
} from '../../lib/seo/share-urls';

interface SharePostButtonProps {
  postId: string;
  title?: string;
  text?: string;
}

interface ShareProfileButtonProps {
  username: string;
  title?: string;
  text?: string;
}

function ShareMenu({
  url,
  title,
  text,
  onClose,
}: {
  url: string;
  title: string;
  text: string;
  onClose: () => void;
}) {
  const openShare = (shareUrl: string) => {
    window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
    onClose();
  };

  const links = [
    {
      label: 'Copy link',
      icon: <Link2 className="w-4 h-4" />,
      action: () => shareContent({ title, text, url }),
    },
    {
      label: 'X / Twitter',
      icon: <Share2 className="w-4 h-4" />,
      action: () => openShare(getTwitterShareUrl(url, text)),
    },
    {
      label: 'Facebook',
      icon: <Facebook className="w-4 h-4" />,
      action: () => openShare(getFacebookShareUrl(url)),
    },
    {
      label: 'LinkedIn',
      icon: <Share2 className="w-4 h-4" />,
      action: () => openShare(getLinkedInShareUrl(url)),
    },
    {
      label: 'WhatsApp',
      icon: <MessageCircle className="w-4 h-4" />,
      action: () => openShare(getWhatsAppShareUrl(url, text)),
    },
    {
      label: 'Telegram',
      icon: <MessageCircle className="w-4 h-4" />,
      action: () => openShare(getTelegramShareUrl(url, text)),
    },
    {
      label: 'Share…',
      icon: <Share2 className="w-4 h-4" />,
      action: () => shareContent({ title, text, url }),
    },
  ];

  return (
    <div className="absolute bottom-full left-0 mb-2 z-50 min-w-[180px] rounded-xl border border-white/10 bg-[#0A0A0A] shadow-xl py-2">
      {links.map((link) => (
        <button
          key={link.label}
          onClick={link.action}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
        >
          {link.icon}
          {link.label}
        </button>
      ))}
    </div>
  );
}

function useShareDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return { open, setOpen, ref };
}

export function SharePostButton({ postId, title = 'Pulse Social Post', text = '' }: SharePostButtonProps) {
  const { open, setOpen, ref } = useShareDropdown();
  const url = getPostShareUrl(postId);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 hover:text-blue-400 transition-colors group"
        aria-label="Share post"
      >
        <div className="p-2 rounded-full group-hover:bg-blue-400/10">
          <Share2 className="w-5 h-5" />
        </div>
      </button>
      {open && (
        <ShareMenu url={url} title={title} text={text} onClose={() => setOpen(false)} />
      )}
    </div>
  );
}

export function ShareProfileButton({
  username,
  title = 'Pulse Social Profile',
  text = '',
}: ShareProfileButtonProps) {
  const { open, setOpen, ref } = useShareDropdown();
  const url = getProfileShareUrl(username);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 text-sm text-gray-300 hover:border-[var(--color-solana-green)]/50 hover:text-white transition-colors"
        aria-label="Share profile"
      >
        <Share2 className="w-4 h-4" />
        Share
      </button>
      {open && (
        <ShareMenu url={url} title={title} text={text} onClose={() => setOpen(false)} />
      )}
    </div>
  );
}
