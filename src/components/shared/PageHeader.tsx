import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

/**
 * Reusable page header with title, optional description, and optional right-aligned action.
 *
 * @param props - Header title, description, and action slot.
 * @returns PageHeader element.
 * @example
 * <PageHeader title="AirQ" description="Urban Air Quality Assistant" action={<ThemeToggle />} />
 */
export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <header className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-border pb-4">
      <div className="space-y-1">
        <h1 className="font-heading text-3xl font-bold text-foreground">{title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
