import { useEffect, useState, type RefObject } from 'react';

export function getSectionProgress(
  scrollY: number,
  sectionTop: number,
  scrollableHeight: number,
) {
  if (scrollableHeight <= 0) return 0;
  return Math.min(1, Math.max(0, (scrollY - sectionTop) / scrollableHeight));
}

export function useSectionProgress<T extends HTMLElement>(
  ref: RefObject<T | null>,
) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      const element = ref.current;
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const scrollableHeight = Math.max(1, rect.height - window.innerHeight);
      setProgress(
        getSectionProgress(window.scrollY, window.scrollY + rect.top, scrollableHeight),
      );
    };

    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [ref]);

  return progress;
}
