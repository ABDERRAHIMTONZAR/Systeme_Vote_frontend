import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  HomeIcon,
  PlusCircleIcon,
  ListBulletIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowLeftStartOnRectangleIcon,
} from "@heroicons/react/24/outline";

export default function Sidebar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // Optionnel: fermer avec ESC
  useEffect(() => {
    const onKeyDown = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <>
      {/* Bouton mobile */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed left-4 top-[4.5rem] z-[70] bg-blue-600 text-white p-2 rounded-full shadow hover:bg-blue-700 transition"
        aria-label="Open sidebar"
      >
        <Bars3Icon className="h-6 w-6" />
      </button>

      {/* Overlay mobile */}
      {open && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-[60]"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static top-16 left-0 w-64 bg-white border-r shadow-sm
          h-[calc(100vh-4rem)] md:h-auto
          flex flex-col 
          z-[70] md:z-auto
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Header mobile (optionnel) */}
        <div className="md:hidden flex items-center justify-between px-4 h-14 border-b">
          <span className="font-bold text-blue-600">Menu</span>
          <button onClick={() => setOpen(false)} aria-label="Close sidebar">
            <XMarkIcon className="h-6 w-6 text-gray-700" />
          </button>
        </div>

        <div className="mt-6 px-4 flex flex-col space-y-2">
          <SidebarItem to="/dashboard" label="Dashboard" icon={<HomeIcon className="h-5 w-5" />} onClick={() => setOpen(false)} />
          <SidebarItem to="/createPoll" label="Créer un sondage" icon={<PlusCircleIcon className="h-5 w-5" />} onClick={() => setOpen(false)} />
          <SidebarItem to="/management" label="Gestion des sondages" icon={<ListBulletIcon className="h-5 w-5" />} onClick={() => setOpen(false)} />
          <SidebarItem to="/profile" label="Profil" icon={<Cog6ToothIcon className="h-5 w-5" />} onClick={() => setOpen(false)} />
        </div>

        <button
          onClick={logout}
          className="flex items-center px-3 p-3 m-4 space-x-3 rounded-lg text-red-600 hover:bg-red-100 transition"
        >
          <ArrowLeftStartOnRectangleIcon className="h-5 w-5" />
          <span className="font-medium">Déconnexion</span>
        </button>
      </aside>
    </>
  );
}

function SidebarItem({ to, label, icon, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition
        ${isActive ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600" : "text-gray-600 hover:bg-gray-100"}`
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}
