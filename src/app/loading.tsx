/**
 * Route-level loading skeleton for the home segment.
 *
 * @returns Accessible loading placeholder.
 * @example
 * <Loading />
 */
export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl space-y-4 px-4 py-10" aria-busy="true">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
      <div className="h-32 w-full animate-pulse rounded-lg bg-muted" />
    </div>
  );
}
