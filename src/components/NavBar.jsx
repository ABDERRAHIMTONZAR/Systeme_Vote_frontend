import { NavLink, useNavigate } from "react-router-dom";
import {
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition ${
      isActive
        ? "bg-blue-50 text-blue-600"
        : "text-gray-600 hover:bg-gray-100"
    }`;

  return (
    <>
      {/* NAVBAR */}
      <nav className="fixed top-0 inset-x-0 bg-white border-b shadow-sm z-50">
        <div className="px-4 h-16 flex justify-between items-center">
          {/* Logo */}
          <span
            onClick={() => navigate("/polls")}
            className="text-2xl font-extrabold text-blue-600 cursor-pointer"
          >
            Votify
          </span>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-8">
            <NavLink to="/polls" className={linkClass}>
              Sondages actifs
            </NavLink>
            <NavLink to="/voted" className={linkClass}>
              Sondages votés
            </NavLink>

            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100"
            >
              <UserCircleIcon className="h-7 w-7 text-gray-700" />
              <span className="font-medium">Mon compte</span>
            </button>
          </div>

          {/* Mobile burger */}
          <button
            onClick={() => setOpen(true)}
            className="md:hidden p-2 rounded-md hover:bg-gray-100"
          >
            <Bars3Icon className="h-7 w-7 text-gray-700" />
          </button>
        </div>
      </nav>

      {/* OVERLAY */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setOpen(false)} />
      )}

      {/* MOBILE DRAWER */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-white z-50 shadow-lg transform transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b">
          <span className="text-xl font-bold text-blue-600">Menu</span>
          <button onClick={() => setOpen(false)}>
            <XMarkIcon className="h-6 w-6 text-gray-700" />
          </button>
        </div>

        {/* Links */}
        <div className="p-4 space-y-2">
          <NavLink
            to="/polls"
            className={linkClass}
            onClick={() => setOpen(false)}
          >
            Sondages actifs
          </NavLink>

          <NavLink
            to="/voted"
            className={linkClass}
            onClick={() => setOpen(false)}
          >
            Sondages votés
          </NavLink>

          <button
            onClick={() => {
              setOpen(false);
              navigate("/dashboard");
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-gray-600 hover:bg-gray-100"
          >
            <UserCircleIcon className="h-6 w-6" />
            Mon compte
          </button>
        </div>
      </div>

      <div className="h-16" />
    </>
  );
}
