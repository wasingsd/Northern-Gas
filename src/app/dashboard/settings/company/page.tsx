import { getAllCompanyProfiles } from "./actions";
import CompanyListClient from "./CompanyListClient";

export default async function SettingsPage() {
  const profiles = await getAllCompanyProfiles();
  const plainProfiles = JSON.parse(JSON.stringify(profiles));

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-foreground">จัดการข้อมูลบริษัท (Company Profiles)</h3>
          <p className="text-sm text-gray-500">จัดการข้อมูลบริษัทสำหรับการพิมพ์เอกสารใบส่งและใบรับถัง</p>
        </div>
      </div>
      
      <CompanyListClient profiles={plainProfiles} />
    </div>
  );
}
