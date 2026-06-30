"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { deleteCylinderOwnerAction } from "./actions";

export default function DeleteOwnerButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนี้?")) {
      startTransition(async () => {
        try {
          await deleteCylinderOwnerAction(id);
        } catch (e: any) {
          alert(e.message || "ไม่สามารถลบได้");
        }
      });
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50 flex items-center gap-1"
    >
      {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
      ลบ
    </button>
  );
}
