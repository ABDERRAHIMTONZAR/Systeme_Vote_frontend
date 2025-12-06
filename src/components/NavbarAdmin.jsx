import { UserCircleIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

export default function NavbarAdmin() {
  const navigate = useNavigate();

  return (
    <nav className="bg-white shadow-sm border-b w-full">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 ml-2 sm:ml-10">

          <span className="text-3xl font-extrabold text-blue-600">
            Votify
          </span>

          <div className="mr-2 sm:mr-10 flex items-center gap-2 sm:gap-4">

            <Link
              to="/polls"
              className="text-blue-600 text-sm sm:text-base px-3 py-2 rounded-full hover:bg-gray-100 transition"
            >
              Retour aux votes
            </Link>

            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded-full transition"
            >
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
