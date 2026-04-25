import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Mobile navbar */}
      <div className="md:hidden">
        <Navbar />
      </div>
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto max-w-5xl p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
