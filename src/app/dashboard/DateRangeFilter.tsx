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
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <form onSubmit={handleFilter} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white border border-border p-3 sm:p-2 rounded-lg shadow-sm w-full sm:w-auto">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Calendar className="h-4 w-4 text-gray-400" />
        <span className="font-medium">ตัวกรองวันที่:</span>
      </div>
      <div className="flex items-center gap-2">
        <input 
          type="date" 
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className="flex-1 sm:flex-none text-base sm:text-sm border border-border rounded-lg px-3 py-2 sm:py-1 outline-none focus:border-primary"
        />
        <span className="text-gray-400">-</span>
        <input 
          type="date" 
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          className="flex-1 sm:flex-none text-base sm:text-sm border border-border rounded-lg px-3 py-2 sm:py-1 outline-none focus:border-primary"
        />
      </div>
      <button 
        type="submit"
        className="w-full sm:w-auto bg-primary text-white text-sm font-medium px-4 py-2.5 sm:py-1.5 rounded-lg hover:bg-primary/90 transition-colors"
      >
        ค้นหา
      </button>
    </form>
  );
}
