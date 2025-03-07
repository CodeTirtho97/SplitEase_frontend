"use client";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXTwitter,
  faLinkedin,
  faGithub,
} from "@fortawesome/free-brands-svg-icons";

const Footer = () => {
  // State to track if components have mounted - fixes the icon rendering issue
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Set mounted to true on client-side
    setMounted(true);
  }, []);

  return (
    <footer className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 md:py-3 border-t border-indigo-300/30 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
        {/* Left Section - Brand Name */}
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-wide text-white">
            SplitEase
          </span>
          <span className="text-gray-300 text-xs sm:text-sm">
            © {new Date().getFullYear()}
          </span>
        </div>

        {/* Center Section - Footer Links */}
        <div className="flex space-x-3 sm:space-x-6 text-xs sm:text-sm">
          <a
            href="/legal?tab=privacy"
            className="text-white/80 hover:text-white transition duration-300 font-medium relative 
                      before:absolute before:bottom-0 before:left-0 before:w-0 before:h-[1px] before:bg-white/70
                      before:transition-all before:duration-300 hover:before:w-full"
          >
            Privacy Policy
          </a>
          <a
            href="/legal?tab=terms"
            className="text-white/80 hover:text-white transition duration-300 font-medium relative
                      before:absolute before:bottom-0 before:left-0 before:w-0 before:h-[1px] before:bg-white/70
                      before:transition-all before:duration-300 hover:before:w-full"
          >
            Terms of Service
          </a>
          <a
            href="/legal?tab=contact"
            className="text-white/80 hover:text-white transition duration-300 font-medium relative
                      before:absolute before:bottom-0 before:left-0 before:w-0 before:h-[1px] before:bg-white/70
                      before:transition-all before:duration-300 hover:before:w-full"
          >
            Contact Us
          </a>
        </div>

        {/* Right Section - Social Media Icons */}
        {mounted && (
          <div className="flex space-x-5">
            <a
              href="https://twitter.com/lucifer_7951"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:scale-110 transition duration-300 bg-white/10 p-2 rounded-full hover:bg-white/20"
              aria-label="Twitter"
            >
              <FontAwesomeIcon
                icon={faXTwitter}
                className="text-white text-lg sm:text-xl"
              />
            </a>
            <a
              href="https://linkedin.com/in/tirthoraj-bhattacharya/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:scale-110 transition duration-300 bg-white/10 p-2 rounded-full hover:bg-white/20"
              aria-label="LinkedIn"
            >
              <FontAwesomeIcon
                icon={faLinkedin}
                className="text-white text-lg sm:text-xl"
              />
            </a>
            <a
              href="https://github.com/CodeTirtho97"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:scale-110 transition duration-300 bg-white/10 p-2 rounded-full hover:bg-white/20"
              aria-label="GitHub"
            >
              <FontAwesomeIcon
                icon={faGithub}
                className="text-white text-lg sm:text-xl"
              />
            </a>
          </div>
        )}
      </div>
    </footer>
  );
};

export default Footer;
