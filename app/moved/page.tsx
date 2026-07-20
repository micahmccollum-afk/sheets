import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "We've moved | Storesight Audits",
  description: "This dashboard has moved to a new location.",
};

const NEW_URL = "https://pog-audit-dash.storesight.org/";

export default function MovedPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="max-w-lg rounded-2xl border border-gray-200 bg-white p-10 shadow-sm">
        <h1 className="text-2xl font-semibold text-storesight-purple">
          We&apos;ve moved
        </h1>
        <p className="mt-4 text-gray-600">
          This dashboard now lives at a new address. Please update your
          bookmarks and continue at the link below.
        </p>
        <a
          href={NEW_URL}
          className="mt-8 inline-flex items-center justify-center rounded-lg bg-storesight-purple px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-storesight-purple/90"
        >
          Go to the new dashboard
        </a>
        <p className="mt-6 break-all text-sm text-gray-400">
          <a href={NEW_URL} className="underline hover:text-gray-600">
            {NEW_URL}
          </a>
        </p>
      </div>
    </div>
  );
}
