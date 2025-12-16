import { NavLink } from "react-router-dom";
import {
  HomeIcon,
  PlusCircleIcon,
  ListBulletIcon,
  ChartBarIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { ArrowLeftStartOnRectangleIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();
  return (
    <aside className="w-64  bg-white border-r  shadow-sm flex flex-col justify-between">
      <div className="mt-6 px-4 flex flex-col space-y-2">
        <SidebarItem
          to="/dashboard"
          label="Dashboard"
          icon={<HomeIcon className="h-5 w-5" />}
        />

        <SidebarItem
          to="/createPoll"
          label="Créer un sondage"
          icon={<PlusCircleIcon className="h-5 w-5" />}
        />

        <SidebarItem
          to="/management"
          label="Gestion des sondages"
          icon={<ListBulletIcon className="h-5 w-5" />}
        />
        <SidebarItem
          to="/profile"
          label="Profil"
          icon={<Cog6ToothIcon className="h-5 w-5" />}
        />
      </div>

      <button
        onClick={() => {
          localStorage.removeItem("token");
          navigate("/");
        }}
        className="flex items-center px-3 p-3 mb-10 space-x-3 rounded-lg text-red-600 hover:bg-red-100 transition"
      >
        <ArrowLeftStartOnRectangleIcon className="h-5 w-5" />
        <span className="font-medium">Déconnexion</span>
      </button>
    </aside>
  );
}

function SidebarItem({ to, label, icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `
        flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition
        ${
          isActive
            ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
            : "text-gray-600 hover:bg-gray-100"
        }
      `
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}
