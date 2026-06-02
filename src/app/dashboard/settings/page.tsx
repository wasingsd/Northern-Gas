export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">ตั้งค่าอื่นๆ</h2>
          <p className="text-sm text-gray-500">จัดการข้อมูลและการตั้งค่าระบบเพิ่มเติม</p>
        </div>
      </div>
      <div className="rounded-xl border border-border bg-white shadow-sm p-8 text-center text-gray-500">
        ยังไม่มีการตั้งค่าเพิ่มเติมในขณะนี้
      </div>
    </div>
  );
}
