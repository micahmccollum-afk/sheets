"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLinks() {
  const path = usePathname();
  const links = [
    { href: "/", label: "Audit Table" },
    { href: "/presentation", label: "Analytics" },
  ];
  return (
    <nav className="flex gap-6">
      {links.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={`text-sm font-medium ${
            path === href ? "text-storesight-purple" : "text-gray-700 hover:text-storesight-purple"
          }`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
