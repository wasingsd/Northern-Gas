import SidebarNav from "./SidebarNav";
import { logoutAction } from "../login/actions";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-surface">
      <SidebarNav logoutAction={logoutAction} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen md:h-auto overflow-hidden md:overflow-visible pt-16 md:pt-0">
        {/* Header - Hidden on mobile because SidebarNav provides it */}
        <header className="hidden md:flex h-16 border-b border-border bg-white items-center px-8 shadow-sm shrink-0">
          <h2 className="text-lg font-medium text-foreground">ภาพรวมระบบ</h2>
          <div className="ml-auto flex items-center gap-4">
            <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
              O
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
