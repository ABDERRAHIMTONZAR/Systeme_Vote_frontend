import NavbarAdmin from "../NavbarAdmin";
import Sidebar from "../SidebarProfil";

export default function LayoutDashboard({ children }) {
  return (
    <div className="flex flex-col h-screen">

      <NavbarAdmin />

      <div className="flex flex-1">

        <Sidebar />

        <main className="flex-1 p-6 bg-gray-50 overflow-auto">
          {children}
        </main>

      </div>
    </div>
  );
}
