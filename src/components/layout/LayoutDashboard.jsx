import NavbarAdmin from "../NavBar";
import Sidebar from "../SidebarProfil";

export default function LayoutDashboard({ children }) {
  return (
    <div className="flex flex-col min-h-screen">

      <NavbarAdmin />

      <div className="flex flex-1">

    {/* <Sidebar /> */}

        {/* SUPPRIMEZ bg-gray-50 et ajoutez un fond transparent */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>

      </div>
    </div>
  );
}