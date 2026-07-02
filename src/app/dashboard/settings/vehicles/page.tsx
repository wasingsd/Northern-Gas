import { Plus, Trash2 } from "lucide-react";
import prisma from "@/lib/prisma";
import { createVehicleAction, deleteVehicleAction } from "./actions";

export default async function VehiclesSettingsPage() {
  const vehicles = await prisma.vehicle.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-foreground">จัดการทะเบียนรถ</h2>
        <p className="text-sm text-gray-500">
          เพิ่มหรือลบข้อมูลรถ สำหรับใช้เลือกในใบส่งถังและใบรับถัง
        </p>
      </div>

      <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-medium text-foreground mb-4">เพิ่มรถใหม่</h3>
        <form action={createVehicleAction} className="flex gap-4 items-start max-w-xl">
          <div className="flex-1 space-y-4">
            <div>
              <label htmlFor="registration" className="block text-sm font-medium text-gray-700 mb-1">
                ทะเบียนรถ
              </label>
              <input
                type="text"
                id="registration"
                name="registration"
                required
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="เช่น ผก 1234 เชียงใหม่"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                รายละเอียด (เพิ่มเติม)
              </label>
              <input
                type="text"
                id="description"
                name="description"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="เช่น กระบะตอนเดียว"
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-6 flex items-center justify-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            เพิ่มรถ
          </button>
        </form>
      </div>

      <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ทะเบียนรถ
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                รายละเอียด
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">จัดการ</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-border">
            {vehicles.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                  ยังไม่มีข้อมูลรถ
                </td>
              </tr>
            ) : (
              vehicles.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {vehicle.registration}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {vehicle.description || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <form action={async () => {
                      "use server";
                      await deleteVehicleAction(vehicle.id);
                    }}>
                      <button
                        type="submit"
                        className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-md"
                        title="ลบข้อมูลรถ"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </form>
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
