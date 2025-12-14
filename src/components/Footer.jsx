import React from "react";
import { Heart, ShieldCheck, Code2, Globe2, Users } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-blue-700 to-blue-900 text-white">
      
      <div className="max-w-6xl mx-auto px-4 py-6">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { icon: <ShieldCheck size={18} />, text: "Secure" },
            { icon: <Code2 size={18} />, text: "Developer Friendly" },
            { icon: <Globe2 size={18} />, text: "Worldwide" },
            { icon: <Users size={18} />, text: "Real-Time" }
          ].map((f, i) => (
            <div key={i} className="flex items-center justify-center gap-2 text-sm text-blue-100">
              {f.icon} {f.text}
            </div>
          ))}
        </div>

        <div className="text-center">
          <h2 className="text-lg font-bold">Votify</h2>
          <p className="text-blue-200 text-xs mt-1">
            Simple. Secure. Transparent voting.
          </p>
        </div>

        <div className="mt-4 text-center text-[10px] text-blue-200">
          © {new Date().getFullYear()} Votify — Made with{" "}
          <Heart size={10} className="inline text-red-400" fill="currentColor" />
        </div>

      </div>
    </footer>
  );
}
