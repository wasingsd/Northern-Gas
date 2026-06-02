"use client";

import { useState } from "react";
import { deleteProductAction } from "./actions";

export default function DeleteProductButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบสินค้านี้?")) return;
    setLoading(true);
    try {
      await deleteProductAction(id);
    } catch (e) {
      alert("ไม่สามารถลบสินค้านี้ได้ (อาจมีข้อมูลออเดอร์ผูกอยู่)");
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={loading}
      className="text-red-500 hover:underline text-sm font-medium ml-4 disabled:opacity-50"
    >
      ลบ
    </button>
  );
}
