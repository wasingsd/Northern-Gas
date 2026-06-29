"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteGasProductAction } from "./actions";

export default function DeleteGasProductButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบประเภทสินค้านี้?")) {
      startTransition(async () => {
        try {
          await deleteGasProductAction(id);
        } catch (error: any) {
          alert(error.message || "ไม่สามารถลบได้");
        }
      });
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
      title="ลบ"
    >
      <Trash2 className="h-4 w-4" /> ลบ
    </button>
  );
}
