import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <p className="text-6xl font-semibold text-gray-400">404</p>
      <p className="mt-2 text-gray-600">This page could not be found.</p>
      <div className="mt-6 flex gap-4">
        <Link
          href="/"
          className="rounded bg-storesight-purple px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Audit Table
        </Link>
        <Link
          href="/presentation"
          className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Analytics
        </Link>
      </div>
    </div>
  );
}
