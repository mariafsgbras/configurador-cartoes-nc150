import { Topbar } from "../components/Topbar";
import { Sidebar } from "../components/Sidebar";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen bg-[#0f1720] flex flex-col overflow-hidden">
      <Topbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}