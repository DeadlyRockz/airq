"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * Route-level error boundary with human-readable message and retry button.
 *
 * @param props - Next.js error boundary props.
 * @returns Error fallback view.
 * @example
 * <ErrorBoundary error={err} reset={retry} />
 */
export default function ErrorBoundary({ reset }: ErrorPageProps) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center justify-center gap-3 px-4 py-16 text-center">
      <AlertTriangle className="size-10 text-destructive" />
      <h2 className="font-heading text-xl font-semibold text-foreground">Something went wrong</h2>
      <p className="text-sm text-muted-foreground">
        Unable to render this view right now. Please try again.
      </p>
      <Button variant="outline" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
