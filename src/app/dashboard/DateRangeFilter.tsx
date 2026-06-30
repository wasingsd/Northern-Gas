"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState } from "react";
import { Calendar } from "lucide-react";

export default function DateRangeFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const todayStr = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok" }).format(new Date());
  const [start, setStart] = useState(searchParams.get("start") || todayStr);
  const [end, setEnd] = useState(searchParams.get("end") || todayStr);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    params.set("start", start);
    params.set("end", end);
    // Use current pathname to keep the filter on the same page
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <form onSubmit={handleFilter} className="flex items-center gap-2 bg-white border border-border p-2 rounded-lg shadow-sm">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Calendar className="h-4 w-4 text-gray-400" />
        <span className="font-medium">ตัวกรองวันที่:</span>
      </div>
      <input 
        type="date" 
        value={start}
        onChange={(e) => setStart(e.target.value)}
        className="text-sm border border-border rounded px-2 py-1 outline-none focus:border-primary"
      />
      <span className="text-gray-400">-</span>
      <input 
        type="date" 
        value={end}
        onChange={(e) => setEnd(e.target.value)}
        className="text-sm border border-border rounded px-2 py-1 outline-none focus:border-primary"
      />
      <button 
        type="submit"
        className="bg-primary text-white text-sm font-medium px-3 py-1 rounded hover:bg-primary/90 transition-colors ml-1"
      >
        ค้นหา
      </button>
    </form>
  );
}
