"use client";

import Image from "next/image";
import Link from "next/link";
import Testimonials from "@/components/Testimonials";
import { useEffect, useState } from "react";

// Import Framer Motion for animations (optional, install if not already: npm install framer-motion)
import { motion, AnimatePresence } from "framer-motion";

// Loading and Error Components (optional, if needed)
const LoadingSpinner = () => (
  <div className="relative flex flex-col items-center justify-center min-h-screen bg-gray-50">
    <div className="relative flex flex-col items-center justify-center p-8 bg-white/90 rounded-xl shadow-lg backdrop-blur-md animate-pulse">
      <svg
        className="w-16 h-16 text-indigo-500 animate-spin"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v8H4z"
        />
      </svg>
      <p className="mt-4 text-xl font-medium text-gray-700">
        Loading Home Page...
      </p>
      <p className="text-sm text-gray-500">
        Please wait while we prepare your experience.
      </p>
    </div>
  </div>
);

export default function Home() {
  const [appName, setAppName] = useState("");
  const fullName = "SplitEase";
  const [showSections, setShowSections] = useState({
    features: false,
    testimonials: false,
    howItWorks: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Typing animation effect with cursor blink
    let i = 0;
    const typeInterval = setInterval(() => {
      setAppName(fullName.slice(0, i + 1));
      i++;
      if (i === fullName.length) {
        setTimeout(() => (i = 0), 2000); // Restart typing animation after a delay
      }
    }, 150);
    setTimeout(() => setLoading(false), 1000); // Simulate initial loading
    return () => clearInterval(typeInterval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const featuresSection = document.getElementById("features");
      const testimonialsSection = document.getElementById("testimonials");
      const howItWorksSection = document.getElementById("how-it-works");

      setShowSections({
        features: featuresSection
          ? featuresSection.getBoundingClientRect().top <
            window.innerHeight - 100
          : false,
        testimonials: testimonialsSection
          ? testimonialsSection.getBoundingClientRect().top <
            window.innerHeight - 100
          : false,
        howItWorks: howItWorksSection
          ? howItWorksSection.getBoundingClientRect().top <
            window.innerHeight - 100
          : false,
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-900 custom-scrollbar overflow-x-hidden">
      {/* Hero Background with Subtle Animation */}
      <div className="absolute inset-0 bg-[url('/hero-bg.jpg')] bg-cover bg-center min-h-screen opacity-20 animate-gradient-shift"></div>

      {/* Hero Section with Extra Padding and Animation */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="text-center max-w-5xl relative z-10 pt-72 pb-48 transition-all duration-1000"
      >
        <Image
          src="/logo.png"
          alt="SplitEase Logo"
          width={120}
          height={120}
          className="mx-auto drop-shadow-xl animate-float"
        />
        <h1 className="text-7xl font-extrabold mt-4 text-indigo-800 tracking-wide">
          {appName}
          <span className="text-indigo-500 animate-blink">.</span>
        </h1>
        <p className="text-2xl text-gray-700 mt-6 font-semibold">
          Simplify bill splitting, track expenses, and settle payments
          effortlessly with friends!
        </p>

        {/* Call to Action Button with Hover Glow */}
        <div className="mt-8">
          <Link href="/signup">
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: "0px 0px 20px rgba(128, 0, 255, 0.7)",
              }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 
                text-white px-10 py-4 rounded-xl shadow-xl transition-all duration-300 ease-in-out transform 
                hover:shadow-[0px_0px_25px_rgba(128,0,255,0.5)] font-bold text-lg"
            >
              Sign Up for Free Today
            </motion.button>
          </Link>
        </div>
      </motion.div>

      {/* Features Section - Enhanced UI with Animation */}
      <motion.div
        id="features"
        initial={{ opacity: 0, y: 50 }}
        animate={{
          opacity: showSections.features ? 1 : 0,
          y: showSections.features ? 0 : 50,
        }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="mt-60 max-w-5xl mx-auto px-8 transition-opacity duration-1000"
      >
        <h2 className="text-5xl font-extrabold text-gray-900 text-center tracking-tight mb-12">
          <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
            Why Choose SplitEase?
          </span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 bg-white/80 border border-gray-200 rounded-3xl shadow-2xl backdrop-blur-md hover:shadow-2xl transition-all duration-500">
          {[
            {
              icon: "✅",
              title: "Automated Bill Splitting",
              desc: "No more manual calculations!",
              color: "indigo-600",
              bg: "indigo-50/70",
            },
            {
              icon: "✅",
              title: "Real-time Expense Tracking",
              desc: "Stay updated on group expenses.",
              color: "purple-600",
              bg: "purple-50/70",
            },
            {
              icon: "✅",
              title: "Instant Settlements",
              desc: "One-click payments with multiple options.",
              color: "green-600",
              bg: "green-50/70",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -50 }}
              animate={{
                opacity: showSections.features ? 1 : 0,
                x: showSections.features ? 0 : -50,
              }}
              transition={{
                duration: 0.6,
                delay: index * 0.2,
                ease: "easeOut",
              }}
              className={`p-6 rounded-2xl bg-${feature.bg} hover:bg-opacity-90 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer`}
            >
              <span className={`text-3xl mr-4 text-${feature.color}`}>
                {feature.icon}
              </span>
              <h3
                className={`text-2xl font-semibold text-${feature.color} mb-2`}
              >
                {feature.title}
              </h3>
              <p className="text-gray-600 text-lg">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Testimonials Section with Smooth Scroll Appearance and Carousel */}
      <motion.div
        id="testimonials"
        initial={{ opacity: 0, y: 50 }}
        animate={{
          opacity: showSections.testimonials ? 1 : 0,
          y: showSections.testimonials ? 0 : 50,
        }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="mt-48 max-w-5xl mx-auto px-8 transition-opacity duration-1000"
      >
        {/* <h2 className="text-5xl font-extrabold text-gray-900 text-center tracking-tight mb-12">
          <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
            What Our Users Say
          </span>
        </h2> */}
        <motion.div
          className="relative"
          animate={{ x: showSections.testimonials ? 0 : -100 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Testimonials />
        </motion.div>
      </motion.div>

      {/* How It Works Section with Interactive Steps */}
      <motion.div
        id="how-it-works"
        initial={{ opacity: 0, y: 50 }}
        animate={{
          opacity: showSections.howItWorks ? 1 : 0,
          y: showSections.howItWorks ? 0 : 50,
        }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="mt-60 mb-36 max-w-5xl mx-auto px-8 transition-opacity duration-1000"
      >
        <h2 className="text-6xl font-extrabold text-gray-900 text-center tracking-tight mb-12">
          <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
            How It Works
          </span>
        </h2>

        <div className="p-12 bg-white/80 border border-gray-200 rounded-3xl shadow-2xl backdrop-blur-md hover:shadow-2xl transition-all duration-500">
          <ol className="space-y-8">
            {[
              {
                step: "Step 1:",
                title: "Create a Group & Add Members",
                icon: "📌",
                color: "indigo-600",
                bg: "indigo-50/70",
              },
              {
                step: "Step 2:",
                title: "Track & Add Expenses in Real-Time",
                icon: "📌",
                color: "purple-600",
                bg: "purple-50/70",
              },
              {
                step: "Step 3:",
                title: "Instantly Settle Payments with One Click",
                icon: "📌",
                color: "green-600",
                bg: "green-50/70",
              },
            ].map((step, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -50 }}
                animate={{
                  opacity: showSections.howItWorks ? 1 : 0,
                  x: showSections.howItWorks ? 0 : -50,
                }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.2,
                  ease: "easeOut",
                }}
                className={`flex items-center space-x-4 p-6 rounded-2xl bg-${step.bg} shadow-md hover:bg-opacity-90 hover:shadow-lg transition-all duration-300 cursor-pointer`}
              >
                <span className={`text-3xl mr-4 text-${step.color}`}>
                  {step.icon}
                </span>
                <div>
                  <h3 className={`text-2xl font-semibold text-${step.color}`}>
                    {step.step} {step.title}
                  </h3>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </motion.div>
    </main>
  );
}
