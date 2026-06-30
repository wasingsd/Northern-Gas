"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SettingsNav() {
  const pathname = usePathname();

  const tabs = [
    { name: "ตั้งค่าบริษัท", href: "/dashboard/settings/company" },
    { name: "จัดการเจ้าของถัง", href: "/dashboard/settings/owners" },
  ];

  return (
    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.name}
            href={tab.href}
            className={`
              whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors
              ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }
            `}
            aria-current={isActive ? "page" : undefined}
          >
            {tab.name}
          </Link>
        );
      })}
    </nav>
  );
}
