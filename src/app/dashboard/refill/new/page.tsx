import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import RefillScannerClient from "./RefillScannerClient";

import prisma from "@/lib/prisma";

export default async function NewRefillBatchPage() {
  const emptyCylinders = await prisma.cylinder.findMany({
    where: { status: "RECEIVED_EMPTY" },
    include: { product: true },
    orderBy: { cylinderNo: "asc" }
  });

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/refill" className="rounded-full p-2 hover:bg-gray-100 transition-colors">
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-foreground">สร้างรอบส่งบรรจุใหม่</h2>
          <p className="text-sm text-gray-500">ยิงบาร์โค้ดหรือเลือกถังเปล่าเพื่อเพิ่มเข้ารอบส่งบรรจุ</p>
        </div>
      </div>

      <RefillScannerClient emptyCylinders={emptyCylinders} />
    </div>
  );
}
