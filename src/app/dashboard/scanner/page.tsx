import { PrismaClient } from "@prisma/client";
import ScannerClient from "./ScannerClient";

const prisma = new PrismaClient();

export default async function ScannerPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { name: "asc" }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">ระบบสแกนบาร์โค้ด</h2>
          <p className="text-sm text-gray-500">ใช้ปืนยิงบาร์โค้ดเพื่ออัปเดตสถานะถังแก๊สอย่างรวดเร็ว</p>
        </div>
      </div>
      
      <ScannerClient customers={customers} />
    </div>
  );
}
