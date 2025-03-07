"use client";

import Image from "next/image";
import Link from "next/link";
import Testimonials from "@/components/Testimonials";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Loading Spinner Component
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

// Step Card Component
interface StepCardProps {
  number: string;
  title: string;
  description?: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  delay: number;
}

const StepCard = ({
  number,
  title,
  description,
  icon,
  color,
  bg,
  delay,
}: StepCardProps) => (
  <motion.div
    initial={{ opacity: 0, x: -50 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay }}
    className={`flex items-center p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 ${
      bg === "indigo-50/70"
        ? "bg-indigo-50/70"
        : bg === "purple-50/70"
        ? "bg-purple-50/70"
        : "bg-green-50/70"
    }`}
  >
    <div
      className={`flex items-center justify-center h-12 w-12 rounded-full bg-${color} text-white font-bold text-lg mr-4`}
    >
      {number}
    </div>
    <div className="flex-1">
      <div className="flex items-center">
        <span
          className={`text-2xl mr-3 ${
            color === "indigo-600"
              ? "text-indigo-600"
              : color === "purple-600"
              ? "text-purple-600"
              : "text-green-600"
          }`}
        >
          {icon}
        </span>
        <h3
          className={`text-xl font-bold ${
            color === "indigo-600"
              ? "text-indigo-600"
              : color === "purple-600"
              ? "text-purple-600"
              : "text-green-600"
          }`}
        >
          {title}
        </h3>
      </div>
      {description && <p className="text-gray-600 mt-1">{description}</p>}
    </div>
    <div className="hidden md:block w-32 h-24 bg-gray-200 rounded-lg ml-4">
      {/* Placeholder for step screenshot/illustration */}
      <div className="w-full h-full flex items-center justify-center text-gray-400">
        <span>Step {number}</span>
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

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-indigo-50 text-gray-900 overflow-x-hidden">
      {/* Animated Particles Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-full h-full opacity-30">
          {/* This would be replaced with a proper particle animation library */}
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-indigo-500"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 10 + 5}px`,
                height: `${Math.random() * 10 + 5}px`,
                opacity: Math.random() * 0.5,
                animation: `float ${Math.random() * 10 + 10}s linear infinite`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center pt-24 pb-20 px-6 w-full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-5xl"
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
              className="absolute -z-10 inset-0 rounded-full bg-indigo-300 opacity-30 blur-2xl"
            />
          </div>

          <h1 className="text-7xl font-extrabold mt-6 text-indigo-800 tracking-wide">
            {appName}
            <span className="text-indigo-500 animate-blink">.</span>
          </h1>

          <p className="text-2xl text-gray-700 mt-6 font-semibold max-w-3xl mx-auto">
            Simplify bill splitting, track expenses, and settle payments
            effortlessly with friends!
          </p>

          {/* Trust Badge */}
          <div className="mt-4">
            <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
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
          <div className="mt-12 relative">
            <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-12">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 
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

            <div className="relative w-full max-w-4xl mx-auto">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/4 w-full">
                <div className="w-64 h-64 rounded-full bg-indigo-400 opacity-20 blur-3xl mx-auto"></div>
              </div>

              {/* Phone mockups would go here */}
              <div className="flex justify-center">
                <div className="relative w-64 h-64 md:w-72 md:h-72 border-8 border-gray-800 rounded-3xl bg-white overflow-hidden shadow-2xl">
                  <div className="absolute top-0 w-full h-6 bg-gray-800"></div>
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    App Screenshot
                  </div>
                </div>
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
        className="w-full py-24 bg-white"
      >
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <span className="px-4 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
              Features
            </span>
            <h2 className="text-5xl font-extrabold mt-4 mb-6">
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
        className="w-full py-12 bg-gradient-to-b from-indigo-50 to-purple-50"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {[
              "Company A",
              "Company B",
              "Company C",
              "Company D",
              "Company E",
            ].map((company, i) => (
              <div key={i} className="flex items-center justify-center h-12">
                <span className="text-xl font-bold text-gray-500">
                  {company}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        id="testimonials"
        className="w-full py-20 bg-gradient-to-b from-purple-50 to-indigo-50"
      >
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <span className="px-4 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
              Testimonials
            </span>
            <h2 className="text-5xl font-extrabold mt-4 mb-6">
              <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
                What Our Users Say
              </span>
            </h2>
          </motion.div>

          <Testimonials />
        </div>
      </section>

      <WaveDivider color="#ffffff" />

      {/* How It Works Section */}
      <section id="how-it-works" className="w-full py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <span className="px-4 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
              Simple Process
            </span>
            <h2 className="text-5xl font-extrabold mt-4 mb-6">
              <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
                How It Works
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get started in just a few simple steps
            </p>
          </motion.div>

          <div className="relative">
            {/* Connection Line */}
            <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 hidden md:block"></div>

            <div className="space-y-12">
              <StepCard
                number="1"
                title="Create a Group & Add Members"
                description="Easily create a group and invite your friends via email, phone number, or sharing a unique link."
                icon="👥"
                color="indigo-600"
                bg="indigo-50/70"
                delay={0.1}
              />
              <StepCard
                number="2"
                title="Track & Add Expenses in Real-Time"
                description="Snap a photo of receipts or manually add expenses. Everyone gets notified instantly."
                icon="📝"
                color="purple-600"
                bg="purple-50/70"
                delay={0.2}
              />
              <StepCard
                number="3"
                title="Instantly Settle Payments with One Click"
                description="Choose your preferred payment method and settle debts with just one tap."
                icon="✅"
                color="green-600"
                bg="green-50/70"
                delay={0.3}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="w-full py-20 bg-gradient-to-b from-indigo-600 to-purple-700 text-white">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold mb-6">
              Ready to simplify group expenses?
            </h2>
            <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">
              Join thousands of users who have made splitting bills stress-free
              with SplitEase
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block bg-white text-indigo-700 px-8 py-4 rounded-xl shadow-lg 
                hover:shadow-xl transition duration-300 font-bold text-lg"
            >
              <Link href="/signup">Get Started — It's Free!</Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
