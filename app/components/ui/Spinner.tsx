/** Decorative loading indicator. Callers announce the state themselves (aria-busy / live region). */
export function Spinner() {
  return (
    <span
      aria-hidden
      className="inline-block shrink-0 w-6 h-6 rounded-full border-2 border-neutral-200 border-t-neutral-800
                animate-spin motion-reduce:animate-none"
    />
  );
}
