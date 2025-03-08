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
    <div className="flex flex-wrap justify-center items-end gap-10 md:gap-14 mt-10 mb-16 max-w-6xl mx-auto">
      {/* Mobile Device */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        whileHover={{ y: -8, transition: { duration: 0.3 } }}
        className="relative w-[180px] h-[360px] group"
      >
        {/* Phone chassis */}
        <div className="absolute inset-0 bg-black rounded-[28px] shadow-device overflow-hidden">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-b-xl z-20"></div>

          {/* Button cutouts */}
          <div className="absolute -right-1 top-28 w-1 h-16 bg-gray-800 rounded-l-md"></div>
          <div className="absolute -left-1 top-20 w-1 h-10 bg-gray-800 rounded-r-md"></div>
          <div className="absolute -left-1 top-34 w-1 h-10 bg-gray-800 rounded-r-md"></div>

          {/* Screen with bezel */}
          <div className="absolute inset-[3px] rounded-[25px] overflow-hidden bg-black">
            {/* Actual screen content area */}
            <div className="absolute inset-[1px] overflow-hidden rounded-[24px]">
              <Image
                src={mobileImage}
                alt="SplitEase mobile app"
                fill
                priority
                className="object-cover"
              />

              {/* Home indicator */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-16 h-1 bg-white rounded-full z-10"></div>
            </div>
          </div>
        </div>

        {/* Device shadow */}
        <div className="absolute -bottom-3 left-[5%] right-[5%] h-4 bg-black/10 blur-md rounded-full"></div>

        {/* Device label - only visible on hover */}
        <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 text-sm font-medium bg-white/90 px-3 py-1 rounded-full shadow-sm text-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Smartphone
        </div>
      </motion.div>

      {/* Tablet Device */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        whileHover={{ y: -8, transition: { duration: 0.3 } }}
        className="relative w-[330px] h-[230px] group"
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

        {/* Device shadow */}
        <div className="absolute -bottom-3 left-[5%] right-[5%] h-4 bg-black/10 blur-md rounded-full"></div>

        {/* Device label - only visible on hover */}
        <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 text-sm font-medium bg-white/90 px-3 py-1 rounded-full shadow-sm text-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Tablet
        </div>
      </motion.div>

      {/* Desktop Monitor - COMPLETELY REDESIGNED */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        whileHover={{
          y: -8,
          transition: { duration: 0.3 },
        }}
        className="relative w-[380px] h-[300px] group"
      >
        {/* Monitor Frame */}
        <div className="absolute top-0 left-0 right-0 h-[240px] bg-black border-[8px] border-gray-800 rounded-lg shadow-xl overflow-hidden">
          {/* Brand logo */}
          <div className="absolute bottom-[5px] left-1/2 -translate-x-1/2 w-4 h-4 flex items-center justify-center">
            <div className="w-3 h-3 bg-gray-700 rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
            </div>
          </div>

          {/* Power indicator */}
          <div className="absolute bottom-[5px] right-[8px] w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>

          {/* Screen content */}
          <div className="absolute inset-0 overflow-hidden bg-white">
            <Image
              src={desktopImage}
              alt="SplitEase desktop app"
              fill
              className="object-cover object-top"
            />

            {/* Subtle screen reflection */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
          </div>
        </div>

        {/* Monitor Stand - Neck */}
        <div className="absolute bottom-[16px] left-1/2 -translate-x-1/2 w-[20px] h-[50px] bg-gradient-to-b from-gray-700 to-gray-800">
          {/* Neck detail lines */}
          <div className="absolute inset-x-0 top-1/3 h-[1px] bg-gray-600"></div>
          <div className="absolute inset-x-0 bottom-1/3 h-[1px] bg-gray-600"></div>
        </div>

        {/* Monitor Stand - Base */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[100px] h-[16px]">
          {/* Base top */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[30px] h-[5px] bg-gray-700 rounded-t-sm"></div>

          {/* Base bottom - oval shape */}
          <div className="absolute bottom-0 inset-x-0 h-[10px] bg-gradient-to-b from-gray-800 to-gray-900 rounded-[50%] shadow-md">
            {/* Base reflection */}
            <div className="absolute inset-x-[10px] top-[2px] h-[1px] bg-gray-600 rounded-full"></div>
          </div>
        </div>

        {/* Monitor shadow */}
        <div className="absolute -bottom-4 left-[10%] right-[10%] h-5 bg-black/15 blur-md rounded-full"></div>

        {/* Device label - only visible on hover */}
        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 text-sm font-medium bg-white/90 px-3 py-1 rounded-full shadow-sm text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Desktop
        </div>
      </motion.div>
    </div>
  );
};

export default DeviceMockups;
