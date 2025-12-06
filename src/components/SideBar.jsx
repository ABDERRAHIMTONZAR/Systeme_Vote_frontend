import React, { useState, useEffect } from "react";
import axios from "axios";
import { Menu, X } from "lucide-react";

export default function SideBar({ selected, setSelected }) {
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false); // Fermé par défaut sur mobile

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("http://localhost:3001/sondage/categories");
        setCategories(res.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchCategories();
  }, []);

  return (
    <>
      {/* Bouton de toggle - Visible seulement sur mobile */}
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden fixed left-4 z-50 bg-blue-600 text-white p-2 rounded-full shadow hover:bg-blue-700 transition"
        style={{ top: '1rem' }}
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Overlay pour mobile */}
      {open && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-white shadow-xl p-5 
          transition-transform duration-300 z-40 w-64
          md:translate-x-0 md:relative md:z-auto md:h-auto md:shadow-none
          ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <h2 className="text-xl font-bold mb-4">Filtrer par catégorie</h2>

        <ul className="space-y-3">
          {/* ALL */}
          <li
            key="All"
            className={`cursor-pointer p-2 rounded-lg font-medium
              ${
                selected === "All"
                  ? "bg-blue-500 text-white shadow"
                  : "hover:bg-gray-200"
              }`}
            onClick={() => {
              setSelected("All");
              setOpen(false); // Fermer la sidebar sur mobile après sélection
            }}
          >
            All
          </li>

          {categories.map((cat) => (
            <li
              key={cat.Categorie}
              className={`cursor-pointer p-2 rounded-lg font-medium transition
                ${
                  selected === cat.Categorie
                    ? "bg-blue-500 text-white shadow"
                    : "hover:bg-gray-200"
                }`}
              onClick={() => {
                setSelected(cat.Categorie);
                setOpen(false); // Fermer la sidebar sur mobile après sélection
              }}
            >
              {cat.Categorie}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}