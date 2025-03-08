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
    <div className="flex flex-wrap justify-center items-end gap-10 md:gap-12 mt-10 mb-16 max-w-6xl mx-auto device-container">
      {/* Mobile Device */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        whileHover={{ y: -8, transition: { duration: 0.3 } }}
        className="relative w-[180px] h-[360px] group mobile-device"
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
        <div className="device-shadow"></div>

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
        className="relative w-[330px] h-[230px] group tablet-device"
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
        <div className="device-shadow"></div>

        {/* Device label - only visible on hover */}
        <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 text-sm font-medium bg-white/90 px-3 py-1 rounded-full shadow-sm text-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Tablet
        </div>
      </motion.div>

      {/* Desktop Monitor */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        whileHover={{
          y: -8,
          transition: { duration: 0.3 },
        }}
        className="relative w-[330px] h-[300px] group desktop-device"
      >
        {/* Main Monitor Frame */}
        <div className="absolute top-0 left-0 right-0 h-[220px] monitor-frame">
          {/* Power LED */}
          <div className="power-indicator"></div>

          {/* Screen content */}
          <div className="absolute inset-0 monitor-screen">
            {/* Browser chrome */}
            <div className="h-6 bg-gradient-to-r from-gray-100 to-gray-200 flex items-center px-2 border-b border-gray-300">
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

        {/* Monitor Neck */}
        <div className="absolute bottom-[30px] left-1/2 transform -translate-x-1/2 w-[24px] h-[50px] monitor-stand">
          {/* Neck details */}
          <div className="absolute inset-x-0 top-[10px] h-[1px] bg-gray-600"></div>
          <div className="absolute inset-x-0 top-[20px] h-[1px] bg-gray-600"></div>
        </div>

        {/* Monitor Base */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[120px] h-[30px]">
          {/* Base top connector */}
          <div className="absolute inset-x-0 top-0 h-[6px] w-[40px] mx-auto bg-gray-800 rounded-t-md"></div>

          {/* Base bottom */}
          <div className="absolute left-0 right-0 bottom-0 h-[24px] monitor-base">
            {/* Base details */}
            <div className="absolute top-[10px] left-1/2 transform -translate-x-1/2 w-[50px] h-[2px] bg-gray-700 rounded-full"></div>
          </div>
        </div>

        {/* Monitor shadow */}
        <div className="monitor-shadow"></div>

        {/* Device label - only visible on hover */}
        <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-sm font-medium bg-white/90 px-3 py-1 rounded-full shadow-sm text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Desktop
        </div>
      </motion.div>
    </div>
  );
};

export default DeviceMockups;
