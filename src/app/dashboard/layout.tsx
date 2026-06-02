import { Package, Truck, Users, LayoutDashboard, Settings, LogOut, Database, ScanBarcode, PackageCheck } from "lucide-react";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-surface">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-white flex flex-col">
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-bold text-primary">Gas Store</h1>
          <p className="text-xs text-gray-700">MVP Management</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/dashboard" className="flex items-center gap-3 rounded-lg bg-primary/10 px-3 py-2 text-primary font-medium">
            <LayoutDashboard className="h-5 w-5" />
            หน้าแรก
          </Link>
          <Link href="/dashboard/scanner" className="flex items-center gap-3 rounded-lg bg-blue-50 px-3 py-2 text-blue-700 font-medium hover:bg-blue-100 transition-colors">
            <ScanBarcode className="h-5 w-5 text-blue-700" />
            สแกนบาร์โค้ด
          </Link>
          <Link href="/dashboard/orders" className="flex items-center gap-3 rounded-lg px-3 py-2 text-foreground hover:bg-gray-50 transition-colors">
            <Package className="h-5 w-5 text-gray-700" />
            คำสั่งซื้อ
          </Link>
          <Link href="/dashboard/dispatch" className="flex items-center gap-3 rounded-lg px-3 py-2 text-foreground hover:bg-gray-50 transition-colors">
            <Truck className="h-5 w-5 text-gray-700" />
            งานจัดส่ง
          </Link>
          <Link href="/dashboard/refill" className="flex items-center gap-3 rounded-lg px-3 py-2 text-foreground hover:bg-gray-50 transition-colors">
            <Package className="h-5 w-5 text-gray-700" />
            งานบรรจุแก๊ส
          </Link>
          <Link href="/dashboard/cylinders" className="flex items-center gap-3 rounded-lg px-3 py-2 text-foreground hover:bg-gray-50 transition-colors">
            <Database className="h-5 w-5 text-gray-700" />
            จัดการถังแก๊ส
          </Link>
          <Link href="/dashboard/customers" className="flex items-center gap-3 rounded-lg px-3 py-2 text-foreground hover:bg-gray-50 transition-colors">
            <Users className="h-5 w-5 text-gray-700" />
            ลูกค้า
          </Link>
          <Link href="/dashboard/products" className="flex items-center gap-3 rounded-lg px-3 py-2 text-foreground hover:bg-gray-50 transition-colors">
            <PackageCheck className="h-5 w-5 text-gray-700" />
            รายการสินค้า
          </Link>
          <Link href="/dashboard/settings" className="flex items-center gap-3 rounded-lg px-3 py-2 text-foreground hover:bg-gray-50 transition-colors">
            <Settings className="h-5 w-5 text-gray-700" />
            ตั้งค่าอื่นๆ
          </Link>
        </nav>

        <div className="p-4 border-t border-border">
          <Link href="/login" className="flex items-center gap-3 rounded-lg px-3 py-2 text-red-600 hover:bg-red-50 transition-colors">
            <LogOut className="h-5 w-5" />
            ออกจากระบบ
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-border bg-white flex items-center px-8 shadow-sm">
          <h2 className="text-lg font-medium text-foreground">ภาพรวมระบบ</h2>
          <div className="ml-auto flex items-center gap-4">
            <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
              O
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8 flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
