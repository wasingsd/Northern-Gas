import SidebarNav from "./SidebarNav";
import { logoutAction } from "../login/actions";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get the authenticated Supabase user
  const supabase = await createClient();
  const {
    data: { user: supabaseUser },
  } = await supabase.auth.getUser();

  // Look up the full user record in Prisma (for name + role)
  let userName = "ผู้ใช้";
  let userRole = "OWNER";
  let userInitial = "U";

  if (supabaseUser) {
    const dbUser = await prisma.user.findFirst({
      where: {
        OR: [
          { supabaseId: supabaseUser.id },
          { email: supabaseUser.email ?? "" },
        ],
      },
      select: { name: true, role: true },
    });

    if (dbUser) {
      userName = dbUser.name;
      userRole = dbUser.role;
      userInitial = dbUser.name.charAt(0).toUpperCase();
    } else {
      // Fallback to Supabase email if no Prisma record yet
      userName = supabaseUser.email ?? "ผู้ใช้";
      userInitial = (supabaseUser.email ?? "U").charAt(0).toUpperCase();
    }
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-surface">
      <SidebarNav
        logoutAction={logoutAction}
        userName={userName}
        userRole={userRole}
        userInitial={userInitial}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen md:h-auto overflow-hidden md:overflow-visible pt-16 md:pt-0">
        {/* Header - Hidden on mobile because SidebarNav provides it */}
        <header className="hidden md:flex h-16 border-b border-border bg-white items-center px-8 shadow-sm shrink-0">
          <h2 className="text-lg font-medium text-foreground">ระบบจัดการร้านแก๊ส</h2>
          <div className="ml-auto flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">{userName}</p>
              <p className="text-xs text-gray-500">{userRole === "OWNER" ? "เจ้าของร้าน" : userRole === "DRIVER" ? "คนขับรถ" : userRole}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
              {userInitial}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 md:p-8 flex-1 overflow-auto bg-surface">
          {children}
        </div>
      </main>
    </div>
  );
}
