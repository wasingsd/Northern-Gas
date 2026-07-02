"use client";

import { useState } from "react";
import { Building2, Plus, Edit, Trash2 } from "lucide-react";
import CompanySettingsForm from "../CompanySettingsForm";

export default function CompanyListClient({ profiles }: { profiles: any[] }) {
  const [editingProfile, setEditingProfile] = useState<any | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  if (editingProfile || isAdding) {
    return (
      <div>
        <button onClick={() => { setEditingProfile(null); setIsAdding(false); window.location.reload(); }} className="mb-4 text-blue-600 text-sm hover:underline">
          &larr; กลับไปหน้ารายชื่อบริษัท
        </button>
        <CompanySettingsForm initialData={editingProfile} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-border p-6">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold text-gray-800">รายชื่อบริษัท (Company Profiles)</h3>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1 bg-primary text-white px-3 py-1.5 rounded-lg text-sm hover:bg-primary-hover transition-colors"
        >
          <Plus className="h-4 w-4" />
          เพิ่มบริษัท
        </button>
      </div>

      <div className="space-y-4">
        {profiles.map(p => (
          <div key={p.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-gray-50">
            <div>
              <div className="font-bold text-gray-800">{p.nameTH}</div>
              <div className="text-sm text-gray-500">{p.nameEN}</div>
            </div>
            <button 
              onClick={() => setEditingProfile(p)}
              className="text-blue-600 hover:text-blue-800 p-2"
            >
              <Edit className="h-4 w-4" />
            </button>
          </div>
        ))}
        {profiles.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            ยังไม่มีข้อมูลบริษัท
          </div>
        )}
      </div>
    </div>
  );
}
