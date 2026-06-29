"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, Truck, Users, LayoutDashboard, Settings, LogOut, Database, ScanBarcode, PackageCheck, Menu, X } from "lucide-react";

export default function SidebarNav({ logoutAction }: { logoutAction: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const closeMenu = () => setIsOpen(false);

  const NavLink = ({ href, icon: Icon, children }: { href: string, icon: any, children: React.ReactNode }) => {
    const isActive = pathname === href;
    return (
      <Link 
        href={href} 
        onClick={closeMenu}
        className={`flex items-center gap-3 rounded-lg px-3 py-3 md:py-2 font-medium transition-colors ${
          isActive ? "bg-primary/10 text-primary" : "text-foreground hover:bg-gray-50"
        }`}
      >
        <Icon className={`h-6 w-6 md:h-5 md:w-5 ${isActive ? "text-primary" : "text-gray-700"}`} />
        {children}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Header Menu Button */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-[60] flex items-center justify-between bg-white border-b border-border p-4 h-16 shadow-sm">
        <div className="flex items-center gap-3">
          <div 
            onClick={() => setIsOpen(true)} 
            onTouchEnd={(e) => { e.preventDefault(); setIsOpen(true); }}
            className="p-2 -ml-2 text-gray-700 active:bg-gray-200 rounded-lg cursor-pointer flex items-center justify-center"
            style={{ minWidth: '44px', minHeight: '44px' }}
          >
            <Menu className="h-7 w-7 pointer-events-none" />
          </div>
          <h1 className="text-xl font-bold text-primary">Gas Store</h1>
        </div>
        <div className="h-9 w-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
          O
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={closeMenu} />
      )}

      {/* Sidebar (Drawer on mobile, Static on Desktop) */}
      <aside className={`fixed inset-y-0 left-0 z-[70] w-72 md:w-64 border-r border-border bg-white flex flex-col transform transition-transform duration-200 ease-in-out md:relative md:z-auto md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-5 md:p-6 border-b border-border flex items-center justify-between md:block">
          <div>
            <h1 className="text-xl font-bold text-primary hidden md:block">Gas Store</h1>
            <p className="text-xs text-gray-700 hidden md:block">MVP Management</p>
            <h1 className="text-xl font-bold text-primary md:hidden">เมนู</h1>
          </div>
          <button 
            type="button"
            onClick={closeMenu} 
            className="md:hidden p-2 text-gray-500 active:bg-gray-200 rounded-lg cursor-pointer"
          >
            <X className="h-7 w-7 pointer-events-none" />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 md:space-y-1 overflow-y-auto">
          <NavLink href="/dashboard" icon={LayoutDashboard}>หน้าแรก</NavLink>
          <NavLink href="/dashboard/scanner" icon={ScanBarcode}>สแกนบาร์โค้ด</NavLink>
          <NavLink href="/dashboard/orders" icon={Package}>บันทึกส่งถัง</NavLink>
          <NavLink href="/dashboard/dispatch" icon={Truck}>งานจัดส่ง</NavLink>
          <NavLink href="/dashboard/refill" icon={Package}>งานบรรจุแก๊ส</NavLink>
          <NavLink href="/dashboard/products" icon={PackageCheck}>รายการสินค้า</NavLink>
          <NavLink href="/dashboard/cylinders" icon={Database}>ติดตามสถานะถังแก๊ส</NavLink>
          <NavLink href="/dashboard/customers" icon={Users}>ลูกค้า</NavLink>
          <NavLink href="/dashboard/users" icon={Users}>จัดการผู้ใช้</NavLink>
          <NavLink href="/dashboard/settings" icon={Settings}>ตั้งค่าอื่นๆ</NavLink>
        </nav>

        <div className="p-4 border-t border-border">
          <form action={logoutAction}>
            <button type="submit" className="w-full flex items-center gap-3 rounded-lg px-3 py-3 md:py-2 text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors">
              <LogOut className="h-6 w-6 md:h-5 md:w-5" />
              <span className="font-medium">ออกจากระบบ</span>
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
