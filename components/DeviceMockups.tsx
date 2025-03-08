import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface DeviceMockupsProps {
  mobileImage: string;
  tabletImage: string;
  desktopImage: string;
}

const DeviceMockups: React.FC<DeviceMockupsProps> = ({
  mobileImage,
  tabletImage,
  desktopImage,
}) => {
  return (
    <div className="flex flex-wrap justify-center items-end gap-8 mt-10 mb-16 max-w-6xl mx-auto">
      {/* Mobile Device */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        whileHover={{ y: -8, transition: { duration: 0.3 } }}
        className="relative w-[220px] h-[440px] group"
      >
        {/* Phone chassis */}
        <div className="absolute inset-0 bg-black rounded-[32px] shadow-device overflow-hidden">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-b-xl z-20"></div>

          {/* Button cutouts */}
          <div className="absolute -right-1 top-32 w-1 h-16 bg-gray-800 rounded-l-md"></div>
          <div className="absolute -left-1 top-24 w-1 h-10 bg-gray-800 rounded-r-md"></div>
          <div className="absolute -left-1 top-38 w-1 h-10 bg-gray-800 rounded-r-md"></div>

          {/* Screen with bezel */}
          <div className="absolute inset-[3px] rounded-[29px] overflow-hidden bg-black">
            {/* Actual screen content area */}
            <div className="absolute inset-[1px] overflow-hidden rounded-[28px]">
              <Image
                src={mobileImage}
                alt="SplitEase mobile app"
                fill
                priority
                className="object-cover"
              />

              {/* Home indicator */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-20 h-1 bg-white rounded-full z-10"></div>
            </div>
          </div>
        </div>

        {/* Device label - only visible on hover */}
        <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 text-sm font-medium bg-white/90 px-3 py-1 rounded-full shadow-sm text-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Smartphone
        </div>

        {/* Glare effect */}
        <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-br from-white/10 to-transparent rounded-t-[32px] pointer-events-none"></div>
      </motion.div>

      {/* Tablet Device */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        whileHover={{ y: -8, transition: { duration: 0.3 } }}
        className="relative w-[300px] h-[220px] group"
      >
        {/* Tablet chassis */}
        <div className="absolute inset-0 bg-gray-800 rounded-[16px] shadow-device overflow-hidden">
          {/* Front camera */}
          <div className="absolute top-[8px] left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-700 rounded-full z-10"></div>

          {/* Button cutouts */}
          <div className="absolute -right-1 top-8 w-1 h-10 bg-gray-700 rounded-l-md"></div>

          {/* Screen with bezel */}
          <div className="absolute inset-[4px] rounded-[12px] overflow-hidden bg-black">
            {/* Actual screen content area */}
            <div className="absolute inset-[1px] overflow-hidden rounded-[11px]">
              <Image
                src={tabletImage}
                alt="SplitEase tablet app"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* Device label - only visible on hover */}
        <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 text-sm font-medium bg-white/90 px-3 py-1 rounded-full shadow-sm text-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Tablet
        </div>

        {/* Glare effect */}
        <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-br from-white/10 to-transparent rounded-t-[16px] pointer-events-none"></div>
      </motion.div>

      {/* Desktop Device - 3D Laptop */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        whileHover={{
          y: -8,
          rotateX: -2, // Subtle rotation change on hover
          transition: { duration: 0.3 },
        }}
        className="relative w-[320px] h-[220px] group transform perspective-1000 preserve-3d"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Laptop screen - with 3D positioning */}
        <div
          className="absolute inset-0 bg-gray-800 rounded-t-lg shadow-xl overflow-hidden transform-gpu rotateX-5"
          style={{ transformOrigin: "bottom", backfaceVisibility: "hidden" }}
        >
          {/* Webcam */}
          <div className="absolute top-[5px] left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-700 rounded-full z-10"></div>

          {/* Screen bezel */}
          <div className="absolute inset-[2px] rounded-t-lg overflow-hidden bg-black pt-5">
            {/* Browser chrome */}
            <div className="h-6 bg-gray-100 flex items-center px-2 border-b border-gray-300">
              <div className="flex space-x-1.5 ml-1">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
              </div>
              <div className="ml-4 bg-white h-4 w-full max-w-xs rounded-md flex items-center justify-center text-[10px] text-gray-400 overflow-hidden">
                splitease.app
              </div>
            </div>

            {/* Actual screen content area */}
            <div className="h-[calc(100%-24px)] overflow-hidden">
              <Image
                src={desktopImage}
                alt="SplitEase desktop app"
                fill
                className="object-cover object-top"
              />
            </div>
          </div>
        </div>

        {/* Laptop base - with 3D positioning and shading */}
        <div
          className="absolute h-[18px] left-[10px] right-[10px] bottom-0 bg-gradient-to-t from-gray-900 to-gray-800 rounded-b-md transform-gpu rotateX-80 z-10"
          style={{
            transformOrigin: "top",
            backfaceVisibility: "hidden",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)",
          }}
        >
          {/* Trackpad */}
          <div className="absolute left-1/2 top-1/2 w-16 h-3 -translate-x-1/2 -translate-y-1/2 bg-gray-700 rounded-sm opacity-30"></div>
        </div>

        {/* Bottom edge shadow to create "desk" illusion */}
        <div className="absolute -bottom-3 left-[5%] right-[5%] h-4 bg-black/10 blur-md rounded-full"></div>

        {/* Device label - only visible on hover */}
        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 text-sm font-medium bg-white/90 px-3 py-1 rounded-full shadow-sm text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Laptop
        </div>
      </motion.div>
    </div>
  );
};

export default DeviceMockups;
