"use client";

import { useState } from "react";
import { saveCompanyProfile } from "./actions";
import { Building2, Save } from "lucide-react";

export default function CompanySettingsForm({ initialData }: { initialData: any }) {
  const [formData, setFormData] = useState({
    nameEN: initialData?.nameEN || "NORTHERN INDUSTRIAL GAS CO.,LTD",
    nameTH: initialData?.nameTH || "บริษัท นอร์ทเธิร์น อินดัสเตรียลแก๊ส จำกัด",
    addressEN: initialData?.addressEN || "335 Moo.10 Tambol U-Mong, Amphur Muang, Lamphun",
    addressTH: initialData?.addressTH || "335 หมู่ 10, ต.อุโมงค์,  อ.เมืองลำพูน จังหวัดลำพูน 51150",
    tel1: initialData?.tel1 || "053-091234-5",
    tel2: initialData?.tel2 || "065-9983497",
    fax: initialData?.fax || "053-091236",
    email: initialData?.email || "northgas335@gmail.com",
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage("");
    
    try {
      await saveCompanyProfile(formData);
      setMessage("บันทึกข้อมูลเรียบร้อยแล้ว ข้อมูลจะถูกนำไปแสดงในใบเสร็จ");
      setTimeout(() => setMessage(""), 5000);
    } catch (error) {
      setMessage("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-border p-6">
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
        <Building2 className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-bold text-gray-800">ข้อมูลบริษัท (Company Profile)</h3>
      </div>
      
      {message && (
        <div className={`p-3 mb-6 rounded-lg text-sm ${message.includes("ข้อผิดพลาด") ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อบริษัท (ภาษาไทย) *</label>
          <input
            type="text"
            name="nameTH"
            value={formData.nameTH}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:ring-primary focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อบริษัท (English) *</label>
          <input
            type="text"
            name="nameEN"
            value={formData.nameEN}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:ring-primary focus:border-primary"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">ที่อยู่ (ภาษาไทย)</label>
          <textarea
            name="addressTH"
            value={formData.addressTH}
            onChange={handleChange}
            rows={2}
            className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:ring-primary focus:border-primary"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">ที่อยู่ (English)</label>
          <textarea
            name="addressEN"
            value={formData.addressEN}
            onChange={handleChange}
            rows={2}
            className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:ring-primary focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์ 1</label>
          <input
            type="text"
            name="tel1"
            value={formData.tel1}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:ring-primary focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์ 2</label>
          <input
            type="text"
            name="tel2"
            value={formData.tel2}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:ring-primary focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">แฟกซ์ (Fax)</label>
          <input
            type="text"
            name="fax"
            value={formData.fax}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:ring-primary focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล (Email)</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:ring-primary focus:border-primary"
          />
        </div>
      </div>
      
      <div className="mt-8 flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {isSaving ? "กำลังบันทึก..." : "บันทึกข้อมูลบริษัท"}
        </button>
      </div>
    </form>
  );
}
