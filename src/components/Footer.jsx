import React from "react";

export default function Footer() {
  return (
    <footer className="bg-blue-600 text-white p-8 mt-auto shadow-inner">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-sm opacity-95">
          © {new Date().getFullYear()} Votify. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
