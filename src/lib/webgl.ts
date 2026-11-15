export function supportsWebGL() {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGL2RenderingContext && canvas.getContext('webgl2'),
    ) || Boolean(canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

