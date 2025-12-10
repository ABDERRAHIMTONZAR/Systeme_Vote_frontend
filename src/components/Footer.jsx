import React from "react";
import { 
  Heart, 
  Code, 
  Globe, 
  Shield, 
  Users,
  Github,
  Twitter,
  Linkedin,
  Mail
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const features = [
    { icon: <Shield size={16} />, text: "Secure Voting" },
    { icon: <Code size={16} />, text: "Dev Friendly" },
    { icon: <Globe size={16} />, text: "Global" },
    { icon: <Users size={16} />, text: "Real-time" }
  ];

  const socialLinks = [
    { icon: <Github size={16} />, href: "#", label: "GitHub" },
    { icon: <Twitter size={16} />, href: "#", label: "Twitter" },
    { icon: <Linkedin size={16} />, href: "#", label: "LinkedIn" },
    { icon: <Mail size={16} />, href: "#", label: "Email" }
  ];

  return (
    <footer className="bg-gradient-to-br from-blue-600 to-blue-800 text-white mt-auto">
      
      {/* Features Section - Smaller */}
      <div className="border-b border-blue-500/30 py-2">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center justify-center space-x-1">
                <div className="text-blue-200">{feature.icon}</div>
                <span className="text-[10px] font-medium">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Content - Smaller */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-col items-center text-center gap-2">

          {/* Brand Section */}
          <div className="max-w-md">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <div className="w-5 h-5 bg-white text-blue-600 rounded flex items-center justify-center">
                <Heart size={12} fill="currentColor" />
              </div>
              <h2 className="text-lg font-bold">Votify</h2>
            </div>

            <p className="text-blue-100 text-xs mb-2">
              Incredible voting experience. Trusted by millions.
            </p>

            <div className="flex justify-center space-x-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="w-7 h-7 bg-blue-500/30 hover:bg-blue-500/50 rounded-full flex items-center justify-center transition-colors"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar - Smaller */}
        <div className="mt-4 pt-2 border-t border-blue-500/30">
          <div className="flex flex-col items-center">
            <p className="text-blue-100 text-[10px] mb-1">
              © {currentYear} Votify. All rights reserved.
            </p>

            <p className="text-blue-200 text-[10px] flex items-center justify-center gap-1">
              Made with <Heart size={8} className="text-red-300" fill="currentColor" /> by Votify Team
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
