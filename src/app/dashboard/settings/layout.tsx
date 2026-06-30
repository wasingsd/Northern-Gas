import Link from "next/link";
import SettingsNav from "./SettingsNav";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-2xl font-bold text-foreground">การตั้งค่าระบบ</h2>
        <p className="text-sm text-gray-500">ตั้งค่าพื้นฐานของระบบ</p>
      </div>
      
      {/* Settings Navigation Tabs */}
      <div className="border-b border-border">
        <SettingsNav />
      </div>

      <div className="pt-2">
        {children}
      </div>
    </div>
  );
}
