"use client";

import { useState } from "react";

export type CompanyProfile = {
  id: string;
  nameEN: string;
  nameTH: string;
};

export default function CompanySection({ companyProfiles, initialData }: { companyProfiles: CompanyProfile[], initialData?: string }) {
  const [selectedProfileId, setSelectedProfileId] = useState(initialData || companyProfiles[0]?.id || "");

  return (
    <div className="space-y-6 border border-border p-6 rounded-xl bg-white shadow-sm mt-6 mb-6">
      <h3 className="text-lg font-bold text-foreground border-b border-border pb-4">ข้อมูลบริษัท (หัวบิล)</h3>
      
      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
        <div className="text-gray-700 font-medium md:w-48">เลือกบริษัท (หัวบิล) <span className="text-red-500">*</span></div>
        <div className="flex-1">
          <select 
            name="companyProfileId"
            className="w-full px-4 py-3 border border-border rounded-lg bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            value={selectedProfileId}
            onChange={(e) => setSelectedProfileId(e.target.value)}
            required
          >
            {companyProfiles.map(p => (
              <option key={p.id} value={p.id}>{p.nameTH} ({p.nameEN})</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
