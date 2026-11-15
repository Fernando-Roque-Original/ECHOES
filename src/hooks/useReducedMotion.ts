import { useEffect } from 'react';
import { useExperienceStore } from '../state/experienceStore';

export function useReducedMotionPreference() {
  const reducedMotion = useExperienceStore((state) => state.reducedMotion);

  useEffect(() => {
    const query = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!query) return;
    const sync = () => useExperienceStore.setState({ reducedMotion: query.matches });
    query.addEventListener?.('change', sync);
    return () => query.removeEventListener?.('change', sync);
  }, []);

  return reducedMotion;
}

