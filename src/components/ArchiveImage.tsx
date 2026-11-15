import { ImageOff } from 'lucide-react';
import { useState } from 'react';
import type { MediaAsset } from '../content/missions';

type ArchiveImageProps = {
  asset: MediaAsset;
  className?: string;
  eager?: boolean;
  showCaption?: boolean;
};

export function ArchiveImage({
  asset,
  className = '',
  eager = false,
  showCaption = false,
}: ArchiveImageProps) {
  const [failed, setFailed] = useState(!asset.src);

  return (
    <figure className={`archive-image ${className}`.trim()}>
      {failed ? (
        <div className="archive-image__fallback" role="img" aria-label={asset.alt}>
          <ImageOff aria-hidden="true" />
          <span>Imagem indisponível neste ambiente.</span>
          {asset.externalUrl ? (
            <a href={asset.externalUrl} target="_blank" rel="noreferrer">
              Abrir fonte NASA
            </a>
          ) : null}
        </div>
      ) : (
        <img
          src={asset.src}
          alt={asset.alt}
          loading={eager ? 'eager' : 'lazy'}
          onError={() => setFailed(true)}
        />
      )}
      {showCaption ? (
        <figcaption>
          <span>{asset.caption}</span>
          <span>{asset.credit}</span>
        </figcaption>
      ) : null}
    </figure>
  );
}

