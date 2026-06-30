import { getCompanyProfile } from "./actions";
import CompanySettingsForm from "./CompanySettingsForm";

export default async function SettingsPage() {
  const profile = await getCompanyProfile();
  const plainProfile = profile ? JSON.parse(JSON.stringify(profile)) : null;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">การตั้งค่าระบบ</h2>
          <p className="text-sm text-gray-500">จัดการข้อมูลบริษัทสำหรับการพิมพ์เอกสารใบส่งและใบรับถัง</p>
        </div>
      </div>
      
      <CompanySettingsForm initialData={plainProfile} />
    </div>
  );
}
