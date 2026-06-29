import { Home, ClipboardList, Settings, UserCircle, QrCode } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

export default async function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get authenticated user for display
  const supabase = await createClient();
  const {
    data: { user: supabaseUser },
  } = await supabase.auth.getUser();

  let userName = "คนขับรถ";
  let userInitial = "D";

  if (supabaseUser) {
    const dbUser = await prisma.user.findFirst({
      where: {
        OR: [
          { supabaseId: supabaseUser.id },
          { email: supabaseUser.email ?? "" },
        ],
      },
      select: { name: true },
    });

    if (dbUser) {
      userName = dbUser.name;
      userInitial = dbUser.name.charAt(0).toUpperCase();
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-gray-100 font-sans selection:bg-blue-500/30">
      {/* Mobile App Header */}
      <header className="sticky top-0 z-20 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">DELIVERIES</h1>
            <p className="text-xs text-gray-400 font-medium tracking-wide uppercase mt-0.5">Gas Store Driver App</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-white">{userName}</p>
              <p className="text-xs text-gray-400">คนขับรถ</p>
            </div>
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-800 border border-gray-700 text-white font-bold text-sm">
              {userInitial}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Centered for desktop, full width on mobile */}
      <main className="flex-1 overflow-auto pb-28 pt-2">
        <div className="max-w-md mx-auto px-4">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation (PWA Style) */}
      <div className="fixed bottom-0 left-0 right-0 z-30">
        {/* Floating Action Button (Scanner) */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-6">
          <Link href="/driver/scan" className="flex items-center justify-center h-16 w-16 bg-gradient-to-tr from-orange-600 to-orange-400 text-white rounded-full shadow-lg shadow-orange-500/30 border-4 border-gray-900 hover:scale-105 transition-transform">
            <QrCode className="h-7 w-7" />
          </Link>
        </div>

        {/* Bottom Nav Bar - Glassmorphism */}
        <nav className="bg-gray-900/90 backdrop-blur-lg border-t border-gray-800 px-6 py-4 pb-safe flex justify-between items-center max-w-md mx-auto rounded-t-3xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.5)]">
          <Link href="/driver" className="flex flex-col items-center gap-1 text-blue-400">
            <Home className="h-6 w-6" />
            <span className="text-[10px] font-medium tracking-wide">หน้าแรก</span>
          </Link>

          <Link href="/driver" className="flex flex-col items-center gap-1 text-gray-500 hover:text-gray-300 transition-colors mr-8">
            <ClipboardList className="h-6 w-6" />
            <span className="text-[10px] font-medium tracking-wide">ประวัติ</span>
          </Link>

          <div className="w-8"></div> {/* Spacer for FAB */}

          <Link href="/driver" className="flex flex-col items-center gap-1 text-gray-500 hover:text-gray-300 transition-colors ml-8">
            <UserCircle className="h-6 w-6" />
            <span className="text-[10px] font-medium tracking-wide">โปรไฟล์</span>
          </Link>

          <Link href="/driver" className="flex flex-col items-center gap-1 text-gray-500 hover:text-gray-300 transition-colors">
            <Settings className="h-6 w-6" />
            <span className="text-[10px] font-medium tracking-wide">ตั้งค่า</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}
