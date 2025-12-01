import { NavLink } from "react-router-dom";
import { UserCircleIcon } from "@heroicons/react/24/outline";

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className=" mx-auto px-4 sm:px-6 lg:px-8 ">
        <div className="flex justify-between items-center h-16 ml-10">

          <div className="flex items-center space-x-3">
            <span className="text-3xl font-extrabold text-blue-600">
              Votify
            </span>

            <div className=" hidden md:flex md:space-x-8 ml-10">
              <NavLink
                to="/polls"
                className={({ isActive }) =>
                  `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all ${
                    isActive
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`
                }
              >
                Active Polls
              </NavLink>

              <NavLink
                to="/voted"
                className={({ isActive }) =>
                  `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all ${
                    isActive
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`
                }
              >
                Mes Voted Polls
              </NavLink>
            </div>
          </div>

          <div className="mr-10 flex items-center">
            <button className="flex items-center space-x-2 hover:bg-gray-100 px-3 py-2 rounded-full transition">
              <UserCircleIcon className="h-8 w-8 text-gray-700" />
              <span className="hidden sm:block text-gray-700 font-medium">
                Mon compte
              </span>
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
}
