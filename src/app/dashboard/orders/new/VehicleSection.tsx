"use client";

import { Truck } from "lucide-react";

type Vehicle = {
  id: string;
  registration: string;
  description: string | null;
};

export default function VehicleSection({ 
  vehicles, 
  drivers,
  defaultVehicleId,
  defaultDriver1Id,
  defaultDriver2Id
}: { 
  vehicles: Vehicle[], 
  drivers: { id: string, name: string }[],
  defaultVehicleId?: string,
  defaultDriver1Id?: string,
  defaultDriver2Id?: string
}) {
  return (
    <div className="p-6 border-b border-border">
      <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
        <Truck className="h-4 w-4 text-primary" />
        ข้อมูลการจัดส่ง (รถและพนักงาน)
      </h3>
      <div className="max-w-3xl grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="vehicleId" className="block text-sm font-medium text-gray-700 mb-1">
            ทะเบียนรถ
          </label>
          <select
            id="vehicleId"
            name="vehicleId"
            defaultValue={defaultVehicleId || ""}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
          >
            <option value="">-- ไม่ระบุ --</option>
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>
                {v.registration} {v.description ? `(${v.description})` : ""}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="driver1Id" className="block text-sm font-medium text-gray-700 mb-1">
            พนักงานส่งถังคนที่ 1 <span className="text-red-500">*</span>
          </label>
          <select
            id="driver1Id"
            name="driver1Id"
            defaultValue={defaultDriver1Id || ""}
            required
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
          >
            <option value="">-- เลือกพนักงาน --</option>
            {drivers.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="driver2Id" className="block text-sm font-medium text-gray-700 mb-1">
            พนักงานส่งถังคนที่ 2 <span className="text-red-500">*</span>
          </label>
          <select
            id="driver2Id"
            name="driver2Id"
            defaultValue={defaultDriver2Id || ""}
            required
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
          >
            <option value="">-- เลือกพนักงาน --</option>
            {drivers.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        บังคับเลือกพนักงานส่งถัง 2 คน เพื่อระบุในใบส่งถัง
      </p>
    </div>
  );
}
