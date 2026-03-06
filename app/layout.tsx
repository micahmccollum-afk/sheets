import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import NavLinks from "@/components/NavLinks";

export const metadata: Metadata = {
  title: "POG Audit | Storesight",
  description: "Track and audit planogram capture issues across product categories",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <header className="border-b border-gray-200 bg-white shadow-sm">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/storesight-logo.svg"
                alt="Storesight"
                className="h-8 w-auto"
              />
              <span className="text-sm font-medium text-storesight-purple/80 border-l border-gray-200 pl-3">
                POG Audit
              </span>
            </Link>
            <NavLinks />
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </body>
    </html>
  );
}
