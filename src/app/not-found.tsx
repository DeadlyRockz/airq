import Link from "next/link";

/**
 * Application-wide 404 page.
 *
 * @returns Not found view with navigation back to home.
 * @example
 * <NotFound />
 */
export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-lg flex-col items-center justify-center gap-3 px-4 py-16 text-center">
      <h1 className="font-heading text-2xl font-bold text-foreground">Page not found</h1>
      <p className="text-sm text-muted-foreground">The requested route does not exist.</p>
      <Link
        href="/"
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        Back to AirQ
      </Link>
    </main>
  );
}
