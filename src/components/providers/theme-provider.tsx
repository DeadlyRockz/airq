"use client";

import type { ReactNode } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

type ThemeProviderProps = {
  children: ReactNode;
};

/**
 * Wraps the application in next-themes class-based dark/light mode support.
 *
 * @param props - Component props containing children.
 * @returns ThemeProvider element.
 * @example
 * <ThemeProvider>{children}</ThemeProvider>
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
