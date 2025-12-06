import React, { useState, useEffect } from "react";
import axios from "axios";
import { Menu, X } from "lucide-react";

export default function SideBar({ selected, setSelected }) {
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);

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
      {/* Bouton mobile */}
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden fixed left-4 top-20 z-50 bg-blue-600 text-white p-2 rounded-full shadow hover:bg-blue-700 transition"
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Overlay mobile */}
      {open && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-40 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <div
        className={`
          fixed md:static h-100 top-16 left-0 w-64  
          bg-white shadow-xl md:shadow-none border-r 
          p-5 overflow-y-auto z-50 md:z-auto
          transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <h2 className="text-xl font-bold mb-4 ">Filtrer par catégorie</h2>

        <ul className="space-y-3 pb-10">
          
          {/* All */}
          <li
            className={`cursor-pointer p-2 rounded-lg font-medium ${
              selected === "All"
                ? "bg-blue-500 text-white shadow"
                : "hover:bg-gray-200"
            }`}
            onClick={() => {
              setSelected("All");
              setOpen(false);
            }}
          >
            All
          </li>

          {/* Categories dynamiques */}
          {categories.map((cat) => (
            <li
              key={cat.Categorie}
              className={`cursor-pointer p-2 rounded-lg font-medium ${
                selected === cat.Categorie
                  ? "bg-blue-500 text-white shadow"
                  : "hover:bg-gray-200"
              }`}
              onClick={() => {
                setSelected(cat.Categorie);
                setOpen(false);
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
