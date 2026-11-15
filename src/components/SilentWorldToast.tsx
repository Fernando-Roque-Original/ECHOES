export function SilentWorldToast({ message }: { message: string | null }) {
  return (
    <div
      className={`cine-silent-toast${message ? ' is-visible' : ''}`}
      role="status"
      aria-live="polite"
    >
      {message ? <span aria-hidden="true" /> : null}
      {message}
    </div>
  );
}
