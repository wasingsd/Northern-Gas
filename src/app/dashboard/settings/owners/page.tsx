import prisma from "@/lib/prisma";
import OwnerForm from "./OwnerForm";
import DeleteOwnerButton from "./DeleteOwnerButton";

export default async function OwnersSettingsPage() {
  const owners = await prisma.cylinderOwner.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      _count: {
        select: { cylinders: true }
      }
    }
  });

  return (
    <div className="space-y-6 max-w-4xl pt-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-foreground">จัดการเจ้าของถัง</h3>
          <p className="text-sm text-gray-500">เพิ่ม ลบ หรือแก้ไขข้อมูลเจ้าของถัง (เช่น ร้าน, ลูกค้า, ยี่ห้อ) เพื่อนำไปผูกกับรายการถังแก๊ส</p>
        </div>
        <OwnerForm />
      </div>

      <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-border">
            <tr>
              <th className="px-6 py-4 font-semibold text-foreground w-1/2">ชื่อเจ้าของถัง</th>
              <th className="px-6 py-4 font-semibold text-foreground text-center">จำนวนถังแก๊สที่ผูก (ใบ)</th>
              <th className="px-6 py-4 font-semibold text-foreground text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {owners.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                  ยังไม่มีข้อมูลเจ้าของถัง
                </td>
              </tr>
            ) : (
              owners.map((owner) => (
                <tr key={owner.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">{owner.name}</td>
                  <td className="px-6 py-4 text-gray-600 text-center">{owner._count.cylinders}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-3">
                      <OwnerForm owner={{ id: owner.id, name: owner.name }} />
                      <DeleteOwnerButton id={owner.id} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
