"use client";

import { Trash2, Loader2 } from "lucide-react";
import { useTransition } from "react";
import { deleteCylinderAction } from "./actions";

export default function DeleteProductButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบถังนี้? ข้อมูลประวัติทั้งหมดจะถูกลบด้วย")) {
      startTransition(async () => {
        await deleteCylinderAction(id);
      });
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className={`p-2 rounded-lg transition-colors flex items-center justify-center ${
        isPending ? "text-gray-400 bg-gray-50" : "text-red-600 hover:bg-red-50"
      }`}
      title="ลบถังแก๊ส"
    >
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </button>
  );
}
