import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans-loaded",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading-loaded",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-loaded",
});

export const metadata: Metadata = {
  title: "AirQ - Urban Air Quality Assistant",
  description:
    "Safety-aware, location- and lifestyle-personalized urban air quality guidance with transparent AQI scales and grounded explanations.",
};

type RootLayoutProps = {
  children: ReactNode;
};

/**
 * Root application layout configuring fonts, theme provider, and base document shell.
 *
 * @param props - Layout props containing page children.
 * @returns Root HTML document structure.
 * @example
 * <RootLayout><HomePage /></RootLayout>
 */
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${plusJakarta.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen bg-background text-foreground">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
