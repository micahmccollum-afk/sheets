"use client";

import { useRouter } from "next/navigation";

export default function RefreshButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.refresh()}
      className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
    >
      Refresh
    </button>
  );
}
