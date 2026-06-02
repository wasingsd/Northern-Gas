"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteCylinderAction } from "./actions";

export default function DeleteCylinderButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบข้อมูลถังแก๊สใบนี้? (การลบจะทำให้ข้อมูลประวัติที่เกี่ยวข้องหายไปด้วย)")) return;
    
    setLoading(true);
    await deleteCylinderAction(id);
    setLoading(false);
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
      title="ลบข้อมูล"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
