import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export function useKeyboardShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if user is typing in input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // Check for keyboard shortcuts
      switch (e.key.toLowerCase()) {
        case 'h':
          if (!e.ctrlKey && !e.metaKey && !e.altKey) {
            navigate('/');
            toast.success('📍 Home');
          }
          break;
        case 'f':
          if (!e.ctrlKey && !e.metaKey && !e.altKey) {
            navigate('/feed');
            toast.success('📰 Feed');
          }
          break;
        case 'e':
          if (!e.ctrlKey && !e.metaKey && !e.altKey) {
            navigate('/explore');
            toast.success('🔍 Explore');
          }
          break;
        case 'p':
          if (!e.ctrlKey && !e.metaKey && !e.altKey) {
            navigate('/profile/me');
            toast.success('👤 Profile');
          }
          break;
        case 'a':
          if (!e.ctrlKey && !e.metaKey && !e.altKey) {
            navigate('/airdrop');
            toast.success('🎁 Airdrop');
          }
          break;
        case 'n':
          if (!e.ctrlKey && !e.metaKey && !e.altKey) {
            // Focus on create post textarea
            const createPostTextarea = document.querySelector(
              'textarea[placeholder*="happening"]',
            ) as HTMLTextAreaElement;
            if (createPostTextarea) {
              createPostTextarea.focus();
              createPostTextarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }
          break;
        case '/':
          if (!e.ctrlKey && !e.metaKey && !e.altKey) {
            e.preventDefault();
            // Focus on search input
            const searchInput = document.querySelector(
              'input[placeholder*="Search"]',
            ) as HTMLInputElement;
            if (searchInput) {
              searchInput.focus();
            }
          }
          break;
        case '?':
          if (!e.ctrlKey && !e.metaKey && !e.altKey) {
            e.preventDefault();
            showKeyboardShortcuts();
          }
          break;
        case 'escape': {
          // Close modals or blur focused element
          const activeElement = document.activeElement as HTMLElement;
          if (activeElement) {
            activeElement.blur();
          }
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [navigate]);
}

function showKeyboardShortcuts() {
  const shortcuts = `
🎹 Keyboard Shortcuts:

Navigation:
• H - Home
• F - Feed
• E - Explore
• P - Profile
• A - Airdrop

Actions:
• N - New Post (focus)
• / - Search (focus)
• ? - Show shortcuts
• ESC - Close/Blur
  `.trim();

  toast.success(shortcuts, {
    duration: 5000,
    style: {
      background: '#1a1a1a',
      color: '#fff',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '20px',
      whiteSpace: 'pre-line',
      textAlign: 'left',
      fontFamily: 'monospace',
    },
  });
}
