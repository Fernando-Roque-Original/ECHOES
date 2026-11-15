import { MonitorOff } from 'lucide-react';

export function WebGLFallback({
  title = 'Modo ilustrado',
  body = 'Este dispositivo não abriu a cena 3D. A história continua com imagens e textos.',
}: {
  title?: string;
  body?: string;
}) {
  return (
    <div className="webgl-fallback" role="status">
      <div className="webgl-fallback__orb" aria-hidden="true" />
      <MonitorOff aria-hidden="true" />
      <div>
        <strong>{title}</strong>
        <span>{body}</span>
      </div>
    </div>
  );
}

