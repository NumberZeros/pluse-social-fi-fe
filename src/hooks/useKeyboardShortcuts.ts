import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export function useKeyboardShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'h':
          if (!e.ctrlKey && !e.metaKey && !e.altKey) {
            navigate('/');
            toast.success('Home');
          }
          break;
        case 'f':
          if (!e.ctrlKey && !e.metaKey && !e.altKey) {
            navigate('/feed');
            toast.success('Feed');
          }
          break;
        case 'e':
          if (!e.ctrlKey && !e.metaKey && !e.altKey) {
            navigate('/explore');
            toast.success('Explore');
          }
          break;
        case 'd':
          if (!e.ctrlKey && !e.metaKey && !e.altKey) {
            navigate('/dashboard');
            toast.success('Dashboard');
          }
          break;
        case 'n':
          if (!e.ctrlKey && !e.metaKey && !e.altKey) {
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
          const activeElement = document.activeElement as HTMLElement;
          if (activeElement) {
            activeElement.blur();
          }
          break;
        }
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [navigate]);
}

function showKeyboardShortcuts() {
  const shortcuts = `
Keyboard Shortcuts:

Navigation:
• H - Home
• F - Feed
• E - Explore
• D - Dashboard

Actions:
• N - New Post (focus)
• / - Search (focus)
• ? - Show shortcuts
• ESC - Close/Blur
  `.trim();

  toast.success(shortcuts, {
    duration: 5000,
    style: {
      background: 'var(--color-surface)',
      color: 'var(--color-foreground)',
      border: '1px solid var(--color-border)',
      padding: '20px',
      whiteSpace: 'pre-line',
      textAlign: 'left',
      fontFamily: 'monospace',
    },
  });
}
