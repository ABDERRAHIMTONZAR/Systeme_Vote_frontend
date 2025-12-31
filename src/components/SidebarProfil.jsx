import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  HomeIcon,
  PlusCircleIcon,
  ListBulletIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowLeftStartOnRectangleIcon,
  ChartBarIcon,
  UserGroupIcon,
  ChevronRightIcon,
  FireIcon,
  TrophyIcon
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeIconSolid,
  PlusCircleIcon as PlusCircleIconSolid,
  ListBulletIcon as ListBulletIconSolid,
  Cog6ToothIcon as Cog6ToothIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  UserGroupIcon as UserGroupIconSolid,
  FireIcon as FireIconSolid,
  TrophyIcon as TrophyIconSolid
} from "@heroicons/react/24/solid";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [activeHover, setActiveHover] = useState(null);

  useEffect(() => {
    const onKeyDown = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const navItems = [
    { 
      to: "/dashboard", 
      label: "Dashboard", 
      icon: <HomeIcon className="h-5 w-5" />,
      iconActive: <HomeIconSolid className="h-5 w-5" />,
      color: "from-cyan-500 to-blue-600",
      description: "Tableau de bord"
    },
    { 
      to: "/polls", 
      label: "Sondages", 
      icon: <ChartBarIcon className="h-5 w-5" />,
      iconActive: <ChartBarIconSolid className="h-5 w-5" />,
      color: "from-purple-500 to-pink-600",
      description: "Voter et participer",
      highlight: location.pathname === "/polls"
    },
    { 
      to: "/pollsVoted", 
      label: "Mes votes", 
      icon: <UserGroupIcon className="h-5 w-5" />,
      iconActive: <UserGroupIconSolid className="h-5 w-5" />,
      color: "from-emerald-500 to-green-600",
      description: "Historique des votes"
    },
    { 
      to: "/createPoll", 
      label: "Créer un sondage", 
      icon: <PlusCircleIcon className="h-5 w-5" />,
      iconActive: <PlusCircleIconSolid className="h-5 w-5" />,
      color: "from-amber-500 to-orange-600",
      description: "Nouvelle question",
      highlight: location.pathname === "/createPoll"
    },
    { 
      to: "/management", 
      label: "Gestion", 
      icon: <ListBulletIcon className="h-5 w-5" />,
      iconActive: <ListBulletIconSolid className="h-5 w-5" />,
      color: "from-violet-500 to-purple-600",
      description: "Gérer mes sondages"
    },
    { 
      to: "/profile", 
      label: "Profil", 
      icon: <Cog6ToothIcon className="h-5 w-5" />,
      iconActive: <Cog6ToothIconSolid className="h-5 w-5" />,
      color: "from-gray-500 to-slate-600",
      description: "Paramètres du compte"
    },
  ];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed left-4 top-20 z-[70] bg-gradient-to-r from-cyan-500 to-purple-600 text-white p-3 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
        aria-label="Open sidebar"
      >
        <Bars3Icon className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full animate-pulse"></div>
      </button>

      {open && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] animate-in fade-in duration-300"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`
          fixed md:sticky md:top-20 left-0 w-72 md:w-64
          h-100vh
          bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-xl
          border-r border-white/20 shadow-2xl md:shadow-lg
          flex flex-col
          z-[70] md:z-auto
          transform transition-all duration-500 ease-out
          ${open ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"}
          scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent
        `}
        onMouseLeave={() => setActiveHover(null)}
      >
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <FireIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Navigation</h2>
              <p className="text-sm text-cyan-100">Menu principal</p>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                onMouseEnter={() => setActiveHover(item.to)}
                onMouseLeave={() => setActiveHover(null)}
                className={({ isActive }) => {
                  const baseClasses = "group relative block p-3 rounded-xl transition-all duration-300 ";
                  const activeClasses = `bg-gradient-to-r ${item.color}/20 border border-cyan-400/50 shadow-lg`;
                  const inactiveClasses = "bg-white/5 border border-transparent hover:bg-white/10 hover:border-white/20";
                  
                  return baseClasses + (isActive ? activeClasses : inactiveClasses);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      location.pathname === item.to
                        ? `bg-gradient-to-r ${item.color} shadow-lg`
                        : 'bg-gradient-to-r from-white/10 to-white/5 group-hover:from-white/20 group-hover:to-white/10'
                    }`}>
                      {location.pathname === item.to ? item.iconActive : item.icon}
                      {item.highlight && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full animate-pulse"></div>
                      )}
                    </div>
                    <div>
                      <div className={`font-medium ${
                        location.pathname === item.to 
                          ? 'text-white' 
                          : 'text-cyan-100 group-hover:text-white'
                      }`}>
                        {item.label}
                      </div>
                      <div className="text-xs text-cyan-300/70 group-hover:text-cyan-300">
                        {item.description}
                      </div>
                    </div>
                  </div>
                  
                  {location.pathname === item.to ? (
                    <div className="p-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full">
                      <ChevronRightIcon className="h-4 w-4 text-white animate-pulse" />
                    </div>
                  ) : (
                    <ChevronRightIcon className={`h-4 w-4 transition-all duration-300 ${
                      activeHover === item.to 
                        ? 'text-cyan-400 scale-100' 
                        : 'text-cyan-300/50 scale-0 group-hover:scale-100'
                    }`} />
                  )}
                </div>

                {activeHover === item.to && location.pathname !== item.to && (
                  <div className="absolute inset-0 border border-cyan-400/30 rounded-xl pointer-events-none animate-pulse"></div>
                )}
              </NavLink>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 backdrop-blur-sm rounded-xl border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 animate-pulse"></div>
              <span className="text-sm font-medium text-white">Page active</span>
            </div>
            <p className="text-xs text-cyan-200">
              {navItems.find(item => location.pathname === item.to)?.label || "Dashboard"}
            </p>
          </div>
        </div>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={logout}
            onMouseEnter={() => setActiveHover("logout")}
            onMouseLeave={() => setActiveHover(null)}
            className="group relative w-full flex items-center justify-center gap-3 p-3 rounded-xl
                     bg-gradient-to-r from-rose-500/10 to-pink-500/10 hover:from-rose-500/20 hover:to-pink-500/20
                     border border-rose-400/30 text-rose-300 hover:text-rose-200
                     transition-all duration-300"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-rose-500/20 to-pink-500/20 
                          flex items-center justify-center group-hover:from-rose-500/30 group-hover:to-pink-500/30">
              <ArrowLeftStartOnRectangleIcon className="h-4 w-4" />
            </div>
            <span className="font-medium">Déconnexion</span>
            
            {activeHover === "logout" && (
              <div className="absolute inset-0 border border-rose-400/30 rounded-xl pointer-events-none animate-pulse"></div>
            )}
          </button>

          <button
            onClick={() => setOpen(false)}
            className="mt-4 w-full py-2.5 bg-gradient-to-r from-white/10 to-white/5 
                     hover:from-white/15 hover:to-white/10 text-cyan-100 hover:text-white 
                     rounded-lg font-medium text-sm transition-all duration-300 hover:shadow-md md:hidden
                     border border-white/10"
          >
            Fermer le menu
          </button>
        </div>
      </aside>
    </>
  );
}