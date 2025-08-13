import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useAcademicSession } from "@/hooks/useAcademicSession";
import SessionSelector from "@/components/SessionSelector";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { sessions, selectedSession, setSelectedSession } = useAcademicSession();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col bg-background">
          <header className="h-16 flex items-center justify-between border-b bg-card px-6 shadow-sm">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-foreground" />
              <div>
                <h1 className="text-xl font-semibold text-foreground">Student Management</h1>
                <p className="text-sm text-muted-foreground">Manage student records, enrollment, and transfers</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs text-muted-foreground">Current Session</p>
                <p className="text-sm font-medium">{selectedSession || 'Select session'}</p>
              </div>
              <SessionSelector
                sessions={sessions}
                value={selectedSession}
                onChange={setSelectedSession}
                className="w-40"
              />
            </div>
          </header>
          <main className="flex-1 p-6 bg-background">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
