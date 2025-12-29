import { NavLink, useNavigate } from "react-router-dom";
import {
  UserCircle,
  Menu,
  X,
  Home,
  CheckCircle,
  PlusCircle,
  BarChart3,
  LogOut,
  Settings,
  Bell,
  Vote
} from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL; // ex: https://scornful-....koyeb.app

export default function Navbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userName, setUserName] = useState("Utilisateur");

  // ✅ Récupération du nom depuis l’API (user connecté)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUserName("Utilisateur");
      return;
    }

    let cancelled = false;

    const fetchMe = async () => {
      try {
        const res = await axios.get(`${API_URL}/user`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 15000,
        });

        // adapte selon la réponse de ton API
        const u = res.data;
        const display =
          u?.Nom ||
          [u?.prenom, u?.nom].filter(Boolean).join(" ") ||
          (u?.email ? u.email.split("@")[0] : "Utilisateur");

        if (!cancelled) setUserName(display || "Utilisateur");
      } catch (err) {
        // si token expiré / invalide => logout
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
          localStorage.removeItem("token");
          if (!cancelled) {
            setUserName("Utilisateur");
            navigate("/");
          }
          return;
        }
        if (!cancelled) setUserName("Utilisateur");
        console.error("Erreur fetch /user/me:", err?.message);
      }
    };

    fetchMe();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
    setOpen(false);
    setShowUserMenu(false);
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition ${
      isActive
        ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
        : "text-gray-600 hover:bg-gray-100"
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition ${
      isActive
        ? "bg-blue-50 text-blue-600"
        : "text-gray-600 hover:bg-gray-100"
    }`;

  return (
    <>
      {/* NAVBAR PRINCIPAL */}
      <nav className="fixed top-0 inset-x-0 bg-white border-b shadow-sm z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex justify-between items-center">

            {/* Logo */}
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => navigate("/polls")}
            >
              <div>
                <span className="text-2xl font-bold text-blue-600">
                  Votify
                </span>
                <p className="text-gray-500 text-xs">Votez intelligemment</p>
              </div>
            </div>

            {/* Navigation Desktop */}
            <div className="hidden lg:flex items-center gap-1">
              <NavLink to="/polls" className={linkClass}>
                <Home className="w-4 h-4" />
                Sondages actifs
              </NavLink>

              <NavLink to="/voted" className={linkClass}>
                <CheckCircle className="w-4 h-4" />
                Sondages votés
              </NavLink>

              <NavLink to="/createPoll" className={linkClass}>
                <PlusCircle className="w-4 h-4" />
                Créer un sondage
              </NavLink>

              <NavLink to="/management" className={linkClass}>
                <BarChart3 className="w-4 h-4" />
                Mes sondages
              </NavLink>
            </div>

            {/* Menu utilisateur Desktop */}
            <div className="hidden lg:flex items-center gap-4">
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition">
                <Bell className="w-5 h-5" />
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 hover:bg-gray-100 px-3 py-2 rounded-lg transition"
                >
                  <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center">
                    <UserCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <div className="text-gray-800 font-medium">{userName}</div>
                    <div className="text-gray-500 text-xs">Profil</div>
                  </div>
                </button>

                {/* Dropdown menu utilisateur */}
                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
                      <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <UserCircle className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-gray-800 font-medium">{userName}</div>
                            <div className="text-gray-500 text-sm">Membre Votify</div>
                          </div>
                        </div>
                      </div>

                      <div className="py-2">
                        <button
                          onClick={() => {
                            navigate("/dashboard");
                            setShowUserMenu(false);
                          }}
                          className="w-full flex items-center px-4 py-3 text-gray-600 hover:bg-gray-100 transition"
                        >
                          <Home className="w-4 h-4 mr-3" />
                          Tableau de bord
                        </button>

                        <button
                          onClick={() => {
                            navigate("/profile");
                            setShowUserMenu(false);
                          }}
                          className="w-full flex items-center px-4 py-3 text-gray-600 hover:bg-gray-100 transition"
                        >
                          <UserCircle className="w-4 h-4 mr-3" />
                          Mon profil
                        </button>

                        <button
                          onClick={() => {
                            navigate("/settings");
                            setShowUserMenu(false);
                          }}
                          className="w-full flex items-center px-4 py-3 text-gray-600 hover:bg-gray-100 transition"
                        >
                          <Settings className="w-4 h-4 mr-3" />
                          Paramètres
                        </button>
                      </div>

                      <div className="border-t border-gray-200 p-2">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center justify-center px-4 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Déconnexion
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Bouton menu mobile */}
            <button
              onClick={() => setOpen(true)}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </div>
      </nav>

      {/* OVERLAY MOBILE */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* DRAWER MOBILE */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-white z-50 shadow-lg transform transition-transform duration-300 lg:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header mobile */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Vote className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-blue-600">Votify</span>
              <p className="text-gray-500 text-xs">Menu</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        {/* Profil mobile */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
              <UserCircle className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <div className="text-gray-800 font-medium text-lg">{userName}</div>
              <div className="text-gray-500 text-sm">Connecté</div>
            </div>
          </div>
        </div>

        {/* Navigation mobile */}
        <div className="p-4 space-y-1">
          <NavLink to="/polls" className={mobileLinkClass} onClick={() => setOpen(false)}>
            <Home className="w-5 h-5" />
            Sondages actifs
          </NavLink>

          <NavLink to="/voted" className={mobileLinkClass} onClick={() => setOpen(false)}>
            <CheckCircle className="w-5 h-5" />
            Sondages votés
          </NavLink>

          <NavLink to="/createPoll" className={mobileLinkClass} onClick={() => setOpen(false)}>
            <PlusCircle className="w-5 h-5" />
            Créer un sondage
          </NavLink>

          <NavLink to="/management" className={mobileLinkClass} onClick={() => setOpen(false)}>
            <BarChart3 className="w-5 h-5" />
            Mes sondages
          </NavLink>

          <NavLink to="/dashboard" className={mobileLinkClass} onClick={() => setOpen(false)}>
            <Home className="w-5 h-5" />
            Tableau de bord
          </NavLink>

          <NavLink to="/profile" className={mobileLinkClass} onClick={() => setOpen(false)}>
            <UserCircle className="w-5 h-5" />
            Mon profil
          </NavLink>
        </div>

        {/* Actions mobile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition"
          >
            <LogOut className="w-5 h-5" />
            Déconnexion
          </button>
        </div>
      </div>

      <div className="h-16" />
    </>
  );
}
