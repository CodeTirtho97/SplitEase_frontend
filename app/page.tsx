"use client";

import Image from "next/image";
import Link from "next/link";
import Testimonials from "@/components/Testimonials";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMediaQuery } from "react-responsive";

// Enhanced Loading Spinner Component
const LoadingSpinner = () => (
  <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
    <div className="relative flex flex-col items-center justify-center p-8 bg-white/80 rounded-2xl shadow-xl backdrop-blur-md">
      {/* Logo and animated spinner container */}
      <div className="relative">
        {/* Animated background blob */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-300 to-purple-300 opacity-30 blur-lg animate-pulse"></div>

        {/* Custom animated spinner */}
        <div className="w-24 h-24 relative flex items-center justify-center">
          {/* Outer ring */}
          <div className="absolute w-full h-full rounded-full border-4 border-indigo-500/30 border-t-indigo-600 animate-spin"></div>

          {/* Middle ring - spins in opposite direction */}
          <div
            className="absolute w-4/5 h-4/5 rounded-full border-4 border-purple-500/30 border-b-purple-600 animate-spin"
            style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
          ></div>

          {/* Inner circle with app letter or logo */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">S</span>
          </div>
        </div>
      </div>

      {/* Loading text with animated dots */}
      <p className="mt-6 text-xl font-medium text-gray-700 flex items-center">
        Loading
        <span className="inline-flex ml-2">
          <span className="animate-dot-1">.</span>
          <span className="animate-dot-2">.</span>
          <span className="animate-dot-3">.</span>
        </span>
      </p>

      <p className="mt-2 text-sm text-gray-500">
        Preparing your SplitEase experience
      </p>
    </div>
  </div>
);

// Wave Divider Component
const WaveDivider = ({ inverted = false, color = "white" }) => (
  <div className="w-full overflow-hidden -mb-1">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1440 120"
      className={`w-full h-24 ${inverted ? "rotate-180" : ""}`}
    >
      <path
        fill={color}
        fillOpacity="1"
        d="M0,64L48,80C96,96,192,128,288,122.7C384,117,480,75,576,64C672,53,768,75,864,85.3C960,96,1056,96,1152,85.3C1248,75,1344,53,1392,42.7L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
      ></path>
    </svg>
  </div>
);

// Feature Card Component
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  bg: string;
  delay: number;
}

const FeatureCard = ({
  icon,
  title,
  description,
  color,
  bg,
  delay,
}: FeatureCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className={`p-6 rounded-2xl hover:scale-105 shadow-md hover:shadow-xl transition-all duration-300 ${
      bg === "indigo-50/70"
        ? "bg-indigo-50/70"
        : bg === "purple-50/70"
        ? "bg-purple-50/70"
        : bg === "green-50/70"
        ? "bg-green-50/70"
        : bg === "blue-50/70"
        ? "bg-blue-50/70"
        : bg === "red-50/70"
        ? "bg-red-50/70"
        : "bg-yellow-50/70"
    }`}
  >
    <div className="flex items-start">
      <div
        className={`p-3 rounded-full mr-4 ${
          color === "indigo-600"
            ? "bg-indigo-600 bg-opacity-20"
            : color === "purple-600"
            ? "bg-purple-600 bg-opacity-20"
            : color === "green-600"
            ? "bg-green-600 bg-opacity-20"
            : color === "blue-600"
            ? "bg-blue-600 bg-opacity-20"
            : color === "red-600"
            ? "bg-red-600 bg-opacity-20"
            : "bg-yellow-600 bg-opacity-20"
        }`}
      >
        <span
          className={`text-2xl ${
            color === "indigo-600"
              ? "text-indigo-600"
              : color === "purple-600"
              ? "text-purple-600"
              : color === "green-600"
              ? "text-green-600"
              : color === "blue-600"
              ? "text-blue-600"
              : color === "red-600"
              ? "text-red-600"
              : "text-yellow-600"
          }`}
        >
          {icon}
        </span>
      </div>
      <div>
        <h3
          className={`text-xl font-bold mb-2 ${
            color === "indigo-600"
              ? "text-indigo-600"
              : color === "purple-600"
              ? "text-purple-600"
              : color === "green-600"
              ? "text-green-600"
              : color === "blue-600"
              ? "text-blue-600"
              : color === "red-600"
              ? "text-red-600"
              : "text-yellow-600"
          }`}
        >
          {title}
        </h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  </motion.div>
);

export default function Home() {
  const [appName, setAppName] = useState("");
  const fullName = "SplitEase";
  const [loading, setLoading] = useState(true);
  const featuresRef = useRef<HTMLElement | null>(null);

  const scrollToFeatures = () => {
    if (featuresRef.current) {
      featuresRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

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

  // Media queries for responsive design
  const isTabletOrLarger = useMediaQuery({ minWidth: 768 });
  const isDesktop = useMediaQuery({ minWidth: 1024 });

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen text-gray-900 overflow-x-hidden bg-gradient-to-br from-indigo-100 via-indigo-50 to-purple-100">
      {/* Animated Particles Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-full h-full opacity-30">
          {/* This would be replaced with a proper particle animation library */}
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-gradient-to-r from-indigo-400 to-purple-400"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 10 + 5}px`,
                height: `${Math.random() * 10 + 5}px`,
                opacity: Math.random() * 0.6,
                animation: `float ${Math.random() * 10 + 10}s linear infinite`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center pt-48 pb-24 px-6 w-full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-6xl"
        >
          <div className="relative">
            <Image
              src="/logo.png"
              alt="SplitEase Logo"
              width={140}
              height={140}
              className="mx-auto drop-shadow-xl animate-float"
            />
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse",
              }}
              className="absolute -z-10 inset-0 rounded-full bg-gradient-to-r from-indigo-300 to-purple-300 opacity-30 blur-2xl"
            />
          </div>

          <h1 className="text-6xl md:text-7xl font-extrabold mt-8 bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-700 text-transparent bg-clip-text tracking-wide">
            {appName}
            <span className="text-indigo-500 animate-blink">.</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-700 mt-8 font-semibold max-w-3xl mx-auto">
            Simplify Bill Splitting, Track Expenses, and Settle Payments
            effortlessly with friends!
          </p>

          {/* Trust Badge */}
          <div className="mt-6">
            <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 shadow-sm">
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Trusted by 10,000+ users worldwide
            </span>
          </div>

          {/* App Store Badges and Device Mockup */}
          <div className="mt-14 relative">
            <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-16">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 
                  text-white px-8 py-4 rounded-xl shadow-xl transition duration-300 
                  hover:shadow-[0px_0px_25px_rgba(128,0,255,0.5)] font-bold text-lg"
              >
                <Link href="/signup" className="flex items-center">
                  <span>Sign Up for Free Today</span>
                  <svg
                    className="w-5 h-5 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={scrollToFeatures}
                className="flex items-center px-6 py-3 text-indigo-600 rounded-xl border-2 border-indigo-600 
                  font-semibold transition-all duration-300 hover:bg-indigo-50"
              >
                <span>Learn More</span>
                <svg
                  className="w-5 h-5 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </motion.button>
            </div>

            <div className="relative w-full max-w-5xl mx-auto">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/4 w-full">
                <div className="w-64 h-64 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 opacity-20 blur-3xl mx-auto"></div>
              </div>

              {/* Device mockups */}
              <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8">
                {/* Mobile */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="relative w-48 h-96 border-8 border-gray-800 rounded-3xl bg-white overflow-hidden shadow-2xl"
                >
                  <div className="absolute top-0 w-full h-6 bg-gray-800"></div>
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gray-800 rounded"></div>
                  <div className="w-full h-full">
                    <Image
                      src="/home_mobile.png"
                      alt="SplitEase Mobile App"
                      fill
                      className="object-cover"
                    />
                  </div>
                </motion.div>

                {/* Tablet - Only show on tablet+ screens */}
                {isTabletOrLarger && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="relative w-64 h-80 border-8 border-gray-800 rounded-3xl bg-white overflow-hidden shadow-2xl"
                  >
                    <div className="absolute top-0 w-full h-6 bg-gray-800"></div>
                    <div className="w-full h-full">
                      <Image
                        src="/home_tablet.png"
                        alt="SplitEase Tablet App"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Desktop - Only show on desktop screens */}
                {isDesktop && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="relative w-72 h-56 border-8 border-gray-800 rounded-xl bg-white overflow-hidden shadow-2xl"
                  >
                    <div className="absolute top-0 w-full h-6 bg-gray-800 flex items-center px-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      </div>
                    </div>
                    <div className="w-full h-full">
                      <Image
                        src="/home_laptops.png"
                        alt="SplitEase Desktop App"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <WaveDivider color="#f9fafb" />

      {/* Features Section */}
      <section
        ref={featuresRef as React.RefObject<HTMLElement>}
        id="features"
        className="w-full py-24 bg-white rounded-t-[40px] shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)]"
      >
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <span className="px-4 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 shadow-sm">
              Features
            </span>
            <h2 className="text-5xl font-extrabold mt-6 mb-6">
              <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
                Why Choose SplitEase?
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our powerful features make expense splitting simple, fair, and
              hassle-free
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon="💸"
              title="Automated Bill Splitting"
              description="No more manual calculations! Split bills evenly or customize amounts for each person."
              color="indigo-600"
              bg="indigo-50/70"
              delay={0.1}
            />
            <FeatureCard
              icon="📊"
              title="Real-time Expense Tracking"
              description="Stay updated on group expenses. Get notifications when new expenses are added."
              color="purple-600"
              bg="purple-50/70"
              delay={0.2}
            />
            <FeatureCard
              icon="💯"
              title="Instant Settlements"
              description="One-click payments with multiple options including bank transfers and digital wallets."
              color="green-600"
              bg="green-50/70"
              delay={0.3}
            />
            <FeatureCard
              icon="📱"
              title="Cross-platform Access"
              description="Access your expenses from any device - mobile, tablet, or desktop."
              color="blue-600"
              bg="blue-50/70"
              delay={0.4}
            />
            <FeatureCard
              icon="🔒"
              title="Secure & Private"
              description="Your financial data stays private and secure with enterprise-grade encryption."
              color="red-600"
              bg="red-50/70"
              delay={0.5}
            />
            <FeatureCard
              icon="📈"
              title="Spending Analytics"
              description="Track your spending patterns and get insights on your financial habits."
              color="yellow-600"
              bg="yellow-50/70"
              delay={0.6}
            />
          </div>
        </div>
      </section>

      <WaveDivider inverted={true} color="#ffffff" />

      {/* Social Proof Section */}
      <section
        id="social-proof"
        className="w-full py-16 bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-8">
            <span className="px-4 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 shadow-sm">
              Trusted by Users
            </span>
            <h3 className="text-2xl font-bold mt-4 mb-2 text-gray-800">
              Join a community of expense sharers
            </h3>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8">
            {[
              {
                stat: "10,000+",
                label: "Active Users",
                icon: "👥",
              },
              {
                stat: "₹50M+",
                label: "Expenses Tracked",
                icon: "💰",
              },
              {
                stat: "4.8/5",
                label: "App Store Rating",
                icon: "⭐",
              },
              {
                stat: "2,500+",
                label: "Active Groups",
                icon: "👨‍👩‍👧‍👦",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex flex-col items-center p-6 bg-white rounded-xl shadow-sm"
              >
                <span className="text-3xl mb-2">{item.icon}</span>
                <span className="text-2xl font-bold text-indigo-700">
                  {item.stat}
                </span>
                <span className="text-gray-600 text-sm">{item.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="w-full py-24 bg-white rounded-t-[40px] shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)]"
      >
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <span className="px-4 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 shadow-sm">
              Simple Process
            </span>
            <h2 className="text-5xl font-extrabold mt-6 mb-6">
              <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
                How It Works
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get started in just a few simple steps
            </p>
          </motion.div>

          <div className="space-y-12 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-col md:flex-row items-center p-6 rounded-2xl bg-indigo-50/70 shadow-md hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-indigo-600 text-white font-bold text-xl mb-4 md:mb-0 md:mr-6">
                1
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center mb-2">
                  <span className="text-2xl mr-3 text-indigo-600">👥</span>
                  <h3 className="text-xl font-bold text-indigo-600">
                    Create a Group & Add Members
                  </h3>
                </div>
                <p className="text-gray-600">
                  Easily create a group and invite your friends via email, phone
                  number, or sharing a unique link.
                </p>
              </div>
              <div className="hidden md:block w-32 h-24 bg-gray-200 rounded-lg mt-4 md:mt-0 md:ml-6">
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  Step 1
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col md:flex-row items-center p-6 rounded-2xl bg-purple-50/70 shadow-md hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-purple-600 text-white font-bold text-xl mb-4 md:mb-0 md:mr-6">
                2
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center mb-2">
                  <span className="text-2xl mr-3 text-purple-600">📝</span>
                  <h3 className="text-xl font-bold text-purple-600">
                    Track & Add Expenses in Real-Time
                  </h3>
                </div>
                <p className="text-gray-600">
                  Snap a photo of receipts or manually add expenses. Everyone
                  gets notified instantly.
                </p>
              </div>
              <div className="hidden md:block w-32 h-24 bg-gray-200 rounded-lg mt-4 md:mt-0 md:ml-6">
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  Step 2
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col md:flex-row items-center p-6 rounded-2xl bg-green-50/70 shadow-md hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-600 text-white font-bold text-xl mb-4 md:mb-0 md:mr-6">
                3
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center mb-2">
                  <span className="text-2xl mr-3 text-green-600">✅</span>
                  <h3 className="text-xl font-bold text-green-600">
                    Instantly Settle Payments with One Click
                  </h3>
                </div>
                <p className="text-gray-600">
                  Choose your preferred payment method and settle debts with
                  just one tap.
                </p>
              </div>
              <div className="hidden md:block w-32 h-24 bg-gray-200 rounded-lg mt-4 md:mt-0 md:ml-6">
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  Step 3
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="w-full py-20 bg-gradient-to-r from-indigo-600 to-purple-600 text-white relative overflow-hidden">
        {/* Background decorations that match your footer design */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-indigo-500 opacity-20 blur-3xl"></div>
          <div className="absolute top-1/2 right-1/4 w-96 h-96 rounded-full bg-purple-500 opacity-10 blur-3xl"></div>
          <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-indigo-400 opacity-20 blur-3xl"></div>

          {/* Subtle grid pattern overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-900/10 opacity-30"></div>
        </div>

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Ready to simplify group expenses?
            </h2>
            <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">
              Join thousands of users who have made splitting bills stress-free
              with SplitEase
            </p>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block bg-white text-indigo-700 hover:text-purple-700 px-8 py-4 rounded-xl shadow-lg 
          hover:shadow-white/20 transition-all duration-300 font-bold text-lg"
            >
              <Link href="/signup">
                <span className="flex items-center">
                  Get Started — It's Free!
                  <svg
                    className="w-5 h-5 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </span>
              </Link>
            </motion.div>

            {/* Social proof element */}
            {/* <div className="mt-8 flex flex-wrap justify-center items-center gap-4">
              <div className="flex items-center bg-white/10 px-4 py-2 rounded-full">
                <span className="mr-2">⭐</span>
                <span>4.8/5 Rating</span>
              </div>
              <div className="flex items-center bg-white/10 px-4 py-2 rounded-full">
                <span className="mr-2">👥</span>
                <span>10,000+ Users</span>
              </div>
              <div className="flex items-center bg-white/10 px-4 py-2 rounded-full">
                <span className="mr-2">🔒</span>
                <span>Secure Payments</span>
              </div>
            </div> */}
          </motion.div>
        </div>

        {/* Wave pattern that connects to footer */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 50"
            className="w-full"
          >
            <path
              fill="url(#footerGradient)"
              fillOpacity="1"
              d="M0,32L48,26.7C96,21,192,11,288,10.7C384,11,480,21,576,32C672,43,768,53,864,48C960,43,1056,21,1152,16C1248,11,1344,21,1392,26.7L1440,32L1440,100L1392,100C1344,100,1248,100,1152,100C1056,100,960,100,864,100C768,100,672,100,576,100C480,100,384,100,288,100C192,100,96,100,48,100L0,100Z"
            ></path>
            <defs>
              <linearGradient
                id="footerGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#4f46e5" />
                <stop offset="100%" stopColor="#9333ea" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </section>
    </main>
  );
}
