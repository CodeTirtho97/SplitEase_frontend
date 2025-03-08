import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface DeviceMockupsProps {
  showMobile?: boolean;
  showTablet?: boolean;
  showDesktop?: boolean;
  mobileImage: string;
  tabletImage: string;
  desktopImage: string;
}

const DeviceMockups: React.FC<DeviceMockupsProps> = ({
  showMobile = true,
  showTablet = true,
  showDesktop = true,
  mobileImage,
  tabletImage,
  desktopImage,
}) => {
  return (
    <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8 mt-10 mb-10">
      {/* Mobile Device */}
      {showMobile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          whileHover={{ y: -10, transition: { duration: 0.3 } }}
          className="relative w-[280px] h-[560px]"
        >
          {/* Phone chassis */}
          <div className="absolute inset-0 bg-black rounded-[40px] shadow-device overflow-hidden">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-6 bg-black rounded-b-xl z-20"></div>

            {/* Button cutouts */}
            <div className="absolute -right-1 top-32 w-1 h-20 bg-gray-800 rounded-l-md"></div>
            <div className="absolute -left-1 top-24 w-1 h-12 bg-gray-800 rounded-r-md"></div>
            <div className="absolute -left-1 top-40 w-1 h-12 bg-gray-800 rounded-r-md"></div>

            {/* Screen with bezel */}
            <div className="absolute inset-[3px] rounded-[37px] overflow-hidden bg-black">
              {/* Actual screen content area */}
              <div className="absolute inset-[1px] overflow-hidden rounded-[36px]">
                <Image
                  src={mobileImage}
                  alt="SplitEase mobile app"
                  fill
                  priority
                  className="object-cover"
                />

                {/* Home indicator */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-1 bg-white rounded-full z-10"></div>
              </div>
            </div>
          </div>

          {/* Device label */}
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-sm font-medium bg-white/90 px-3 py-1 rounded-full shadow-sm text-indigo-700">
            Mobile App
          </div>

          {/* Glare effect */}
          <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-br from-white/10 to-transparent rounded-t-[40px] pointer-events-none"></div>
        </motion.div>
      )}

      {/* Tablet Device */}
      {showTablet && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          whileHover={{ y: -10, transition: { duration: 0.3 } }}
          className="relative w-[400px] h-[280px] hidden md:block"
        >
          {/* Tablet chassis */}
          <div className="absolute inset-0 bg-gray-800 rounded-[20px] shadow-device overflow-hidden">
            {/* Front camera */}
            <div className="absolute top-[10px] left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-700 rounded-full z-10"></div>

            {/* Button cutouts */}
            <div className="absolute -right-1 top-10 w-1 h-12 bg-gray-700 rounded-l-md"></div>

            {/* Screen with bezel */}
            <div className="absolute inset-[5px] rounded-[15px] overflow-hidden bg-black">
              {/* Actual screen content area */}
              <div className="absolute inset-[1px] overflow-hidden rounded-[14px]">
                <Image
                  src={tabletImage}
                  alt="SplitEase tablet app"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          {/* Device label */}
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-sm font-medium bg-white/90 px-3 py-1 rounded-full shadow-sm text-purple-700">
            Tablet App
          </div>

          {/* Glare effect */}
          <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-br from-white/10 to-transparent rounded-t-[20px] pointer-events-none"></div>
        </motion.div>
      )}

      {/* Desktop Device */}
      {showDesktop && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          whileHover={{ y: -10, transition: { duration: 0.3 } }}
          className="relative w-[450px] h-[300px] hidden lg:block"
        >
          {/* Laptop screen */}
          <div className="absolute top-0 left-0 right-0 h-[260px] bg-gray-800 rounded-t-lg shadow-xl overflow-hidden">
            {/* Webcam */}
            <div className="absolute top-[6px] left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-700 rounded-full z-10"></div>

            {/* Screen bezel */}
            <div className="absolute inset-[2px] rounded-t-lg overflow-hidden bg-black pt-5">
              {/* Browser chrome */}
              <div className="h-7 bg-gray-100 flex items-center px-2 border-b border-gray-300">
                <div className="flex space-x-1.5 ml-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                </div>
                <div className="ml-4 bg-white h-5 w-full max-w-xs rounded-md flex items-center justify-center text-[10px] text-gray-400 overflow-hidden">
                  splitease.app
                </div>
              </div>

              {/* Actual screen content area */}
              <div className="h-[calc(100%-28px)] overflow-hidden">
                <Image
                  src={desktopImage}
                  alt="SplitEase desktop app"
                  fill
                  className="object-cover object-top"
                />
              </div>
            </div>
          </div>

          {/* Laptop base */}
          <div className="absolute bottom-0 left-2 right-2 h-[40px] bg-gradient-to-t from-gray-900 to-gray-800 rounded-b-md perspective">
            {/* Keyboard surface */}
            <div className="absolute inset-0 h-[40px] bg-gray-800 rounded-b-md transform rotateX-60 origin-top"></div>

            {/* Trackpad */}
            <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-1/3 h-1/2 bg-gray-700 rounded-sm opacity-80"></div>
          </div>

          {/* Device label */}
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-sm font-medium bg-white/90 px-3 py-1 rounded-full shadow-sm text-indigo-600">
            Desktop Web App
          </div>

          {/* Glare effect */}
          <div className="absolute top-0 left-0 right-0 h-1/4 bg-gradient-to-br from-white/10 to-transparent rounded-t-lg pointer-events-none"></div>
        </motion.div>
      )}
    </div>
  );
};

export default DeviceMockups;
