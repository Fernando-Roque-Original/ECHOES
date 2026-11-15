import { useEffect } from 'react';

const imageAssets = [
  '/assets/images/opportunity-selfie.jpg',
  '/assets/images/opportunity-last-message.jpg',
  '/assets/images/opportunity-final-panorama.jpg',
  '/assets/images/opportunity-hematite-berries.jpg',
  '/assets/maps/opportunity-traverse-nasa.jpg',
];

export function useDemoPreload(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    const images = imageAssets.map((src) => {
      const image = new Image();
      image.src = src;
      return image;
    });

    void fetch('/assets/artifacts/opportunity-rover.glb', {
      cache: 'force-cache',
    }).catch(() => undefined);

    return () => {
      images.forEach((image) => {
        image.src = '';
      });
    };
  }, [enabled]);
}

