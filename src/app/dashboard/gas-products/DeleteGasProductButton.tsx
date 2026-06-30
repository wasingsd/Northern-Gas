"use client";

import { useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
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
      className={`p-2 rounded-lg transition-colors flex items-center justify-center gap-1 min-w-[70px] ${
        isPending ? "text-gray-400 bg-gray-50" : "text-red-600 hover:bg-red-50"
      }`}
      title="ลบ"
    >
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      {isPending ? "กำลังลบ..." : "ลบ"}
    </button>
  );
}
