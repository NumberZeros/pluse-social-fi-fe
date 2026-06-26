import { useNavigate } from 'react-router-dom';

export function useFocusCreatePost() {
  const navigate = useNavigate();

  return () => {
    navigate('/feed');
    setTimeout(() => {
      const textarea = document.querySelector(
        'textarea[placeholder*="happening"]',
      ) as HTMLTextAreaElement | null;
      textarea?.focus();
      textarea?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };
}
