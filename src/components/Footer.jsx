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
      {/* Features Section - Compact */}
      <div className="border-b border-blue-500/30 py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center justify-center space-x-2">
                <div className="text-blue-200">
                  {feature.icon}
                </div>
                <span className="text-xs font-medium">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Content - Compact */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col items-center text-center gap-4">
          {/* Brand Section */}
          <div className="max-w-md">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="w-6 h-6 bg-white text-blue-600 rounded flex items-center justify-center">
                <Heart size={14} fill="currentColor" />
              </div>
              <h2 className="text-xl font-bold">Votify</h2>
            </div>
            <p className="text-blue-100 text-sm mb-4">
              Incredible voting experience. Trusted by millions.
            </p>
            
            {/* Social Links */}
            <div className="flex justify-center space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="w-8 h-8 bg-blue-500/30 hover:bg-blue-500/50 rounded-full flex items-center justify-center transition-colors"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar - Compact */}
        <div className="mt-6 pt-4 border-t border-blue-500/30">
          <div className="flex flex-col items-center">
            <p className="text-blue-100 text-xs mb-2">
              © {currentYear} Votify. All rights reserved.
            </p>
            
            {/* Made with love - plus petit */}
            <div className="text-center">
              <p className="text-blue-200 text-xs flex items-center justify-center gap-1">
                Made with <Heart size={10} className="text-red-300" fill="currentColor" /> by Votify Team
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}