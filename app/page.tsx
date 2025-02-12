"use client";

import Image from "next/image";
import Link from "next/link";
import Testimonials from "@/components/Testimonials";
import { useEffect, useState } from "react";

export default function Home() {
  const [appName, setAppName] = useState("");
  const fullName = "SplitEase";
  const [showSections, setShowSections] = useState({
    features: false,
    testimonials: false,
    howItWorks: false,
  });

  useEffect(() => {
    // Typing animation effect
    let i = 0;
    const typeInterval = setInterval(() => {
      setAppName(fullName.slice(0, i + 1));
      i++;
      if (i === fullName.length) {
        setTimeout(() => (i = 0), 2000); // Restart typing animation after a delay
      }
    }, 150);
    return () => clearInterval(typeInterval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const featuresSection = document.getElementById("features");
      const testimonialsSection = document.getElementById("testimonials");
      const howItWorksSection = document.getElementById("how-it-works");
  
      setShowSections({
        features: featuresSection ? featuresSection.getBoundingClientRect().top < window.innerHeight - 100 : false,
        testimonials: testimonialsSection ? testimonialsSection.getBoundingClientRect().top < window.innerHeight - 100 : false,
        howItWorks: howItWorksSection ? howItWorksSection.getBoundingClientRect().top < window.innerHeight - 100 : false,
      });
    };
  
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-900 custom-scrollbar">
      
      {/* Hero Background */}
      <div className="absolute inset-0 bg-[url('/hero-bg.jpg')] bg-cover bg-center min-h-screen opacity-20"></div>

      {/* Hero Section with Extra Padding */}
      <div className="text-center max-w-5xl relative z-10 pt-72 pb-48 transition-all duration-1000">
        <Image src="/logo.png" alt="SplitEase Logo" width={100} height={100} className="mx-auto drop-shadow-md" />
        <h1 className="text-7xl font-extrabold mt-4 text-indigo-700 tracking-wide">
          {appName}
          <span className="text-indigo-500 animate-pulse">.</span>
        </h1>
        <p className="text-xl text-gray-800 mt-3 font-medium">
          The easiest way to split bills, track expenses, and settle payments with friends!
        </p>

        {/* Call to Action Button */}
        <div className="mt-6">
          <Link href="/signup">
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 
              text-white px-8 py-3 rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 
              hover:shadow-[0px_0px_15px_rgba(128,0,255,0.5)]">
              Get Started for Free
            </button>
          </Link>
        </div>
      </div>

      {/* Features Section - Enhanced UI */}
      <div id="features" className={`mt-60 max-w-5xl mx-auto transition-opacity duration-1000 ${showSections.features ? "opacity-100" : "opacity-0"}`}>
        
        {/* Section Title */}
        <h2 className="text-5xl font-extrabold text-gray-900 text-center tracking-tight mb-8">
          <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
            Why Choose SplitEase?
          </span>
        </h2>

        {/* Features List */}
        <div className="p-8 bg-white/80 border border-gray-300 rounded-2xl shadow-lg backdrop-blur-md hover:shadow-xl transition-all duration-500">
          <ul className="space-y-6">
            
            {/* Feature Item */}
            <li className="flex items-center text-2xl text-indigo-700 font-semibold p-4 rounded-xl bg-indigo-50/60 hover:bg-indigo-100 transition-all duration-300">
              <span className="mr-4 text-3xl">✅</span> 
              <span><strong>Automated Bill Splitting</strong> – <i className="text-gray-600">No more manual calculations!</i></span>
            </li>

            <li className="flex items-center text-2xl text-purple-700 font-semibold p-4 rounded-xl bg-purple-50/60 hover:bg-purple-100 transition-all duration-300">
              <span className="mr-4 text-3xl">✅</span> 
              <span><strong>Real-time Expense Tracking</strong> – <i className="text-gray-600">Stay updated on group expenses.</i></span>
            </li>

            <li className="flex items-center text-2xl text-green-700 font-semibold p-4 rounded-xl bg-green-50/60 hover:bg-green-100 transition-all duration-300">
              <span className="mr-4 text-3xl">✅</span> 
              <span><strong>Instant Settlements</strong> – <i className="text-gray-600">One-click payments with multiple options.</i></span>
            </li>

          </ul>
        </div>
      </div>

      {/* Testimonials Section with Smooth Scroll Appearance */}
      <div id="testimonials" className={`mt-48 max-w-5xl mx-auto transition-opacity duration-1000 ${showSections.testimonials ? "opacity-100" : "opacity-0"}`}>
        <Testimonials />
      </div>

      {/* How It Works Section */}
      <div id="how-it-works" className={`mt-60 mb-36 max-w-5xl mx-auto transition-opacity duration-1000 ${showSections.howItWorks ? "opacity-100" : "opacity-0"}`}>
        
        {/* Section Heading */}
        <h2 className="text-6xl font-extrabold text-gray-900 text-center tracking-tight mb-8">
          <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
            How It Works
          </span>
        </h2>

        {/* Steps Container */}
        <div className="p-20 mb-28 mt-5 bg-white/80 border border-gray-300 rounded-2xl shadow-lg backdrop-blur-md hover:shadow-xl transition-all duration-500">
          <ol className="space-y-8 text-2xl text-gray-800 font-medium">
            
            {/* Step 1 */}
            <li className="flex items-center space-x-4 p-4 bg-indigo-50 rounded-lg shadow-md hover:bg-indigo-100 transition-all duration-300">
              <span className="text-3xl">📌</span>
              <span><strong>Step 1:</strong> Create a Group & Add Members</span>
            </li>

            {/* Step 2 */}
            <li className="flex items-center space-x-4 p-4 bg-purple-50 rounded-lg shadow-md hover:bg-purple-100 transition-all duration-300">
              <span className="text-3xl">📌</span>
              <span><strong>Step 2:</strong> Track & Add Expenses in Real-Time</span>
            </li>

            {/* Step 3 */}
            <li className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg shadow-md hover:bg-green-100 transition-all duration-300">
              <span className="text-3xl">📌</span>
              <span><strong>Step 3:</strong> Instantly Settle Payments with One Click</span>
            </li>

          </ol>
        </div>
      </div>
    </main>
  );
}