import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXTwitter, faLinkedin, faGithub } from "@fortawesome/free-brands-svg-icons";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-indigo-700 to-purple-700 text-white py-2 border-t border-gray-500 shadow-xl">
      <div className="max-w-7xl mx-auto px-3 flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0">
        
        {/* Left Section - Brand Name */}
        <div className="flex items-center space-x-3">
          <span className="text-3xl font-extrabold tracking-wide text-white">SplitEase</span>
          <span className="text-gray-300 text-sm md:text-base">© {new Date().getFullYear()}</span>
        </div>

        {/* Center Section - Footer Links */}
        <div className="flex space-x-6 text-sm md:text-base">
          <a href="#" className="text-gray-300 hover:text-white transition duration-300 font-medium">Privacy Policy</a>
          <a href="#" className="text-gray-300 hover:text-white transition duration-300 font-medium">Terms of Service</a>
          <a href="#" className="text-gray-300 hover:text-white transition duration-300 font-medium">Contact Us</a>
        </div>

        {/* Right Section - Social Media Icons */}
        <div className="flex space-x-5">
          <a href="#" className="hover:scale-110 transition duration-300">
            <FontAwesomeIcon icon={faXTwitter} className="text-white text-2xl hover:text-gray-300" />
          </a>
          <a href="#" className="hover:scale-110 transition duration-300">
            <FontAwesomeIcon icon={faLinkedin} className="text-white text-2xl hover:text-gray-300" />
          </a>
          <a href="#" className="hover:scale-110 transition duration-300">
            <FontAwesomeIcon icon={faGithub} className="text-white text-2xl hover:text-gray-300" />
          </a>
        </div>

      </div>
    </footer>
  );
};

export default Footer;