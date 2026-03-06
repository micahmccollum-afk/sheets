import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "POG Audit Dashboard",
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
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <h1 className="text-lg font-semibold text-gray-900">POG Audit Dashboard</h1>
            <nav className="flex gap-6">
              <Link
                href="/"
                className="text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                Audit Table
              </Link>
              <Link
                href="/presentation"
                className="text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                Presentation
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </body>
    </html>
  );
}
