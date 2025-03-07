"use client";

import Image from "next/image";
import Link from "next/link";
import Testimonials from "@/components/Testimonials";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";

// Loading and Error Components
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
        Loading SplitEase...
      </p>
      <p className="text-sm text-gray-500">
        Simplifying your expense tracking experience.
      </p>
    </div>
  </div>
);

export default function Home() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [appName, setAppName] = useState("");
  const fullName = "SplitEase";
  const [showSections, setShowSections] = useState({
    features: false,
    testimonials: false,
    howItWorks: false,
  });
  const [loading, setLoading] = useState(true);

  // Check authentication and redirect if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Using the AuthContext to check if user is logged in
        if (user && token) {
          router.replace("/dashboard");
        } else {
          // Only show loading animation for non-logged in users
          setTimeout(() => setLoading(false), 1000);
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        setLoading(false);
      }
    };

    checkAuth();
  }, [user, token, router]);

  // Typing animation effect with cursor blink
  useEffect(() => {
    if (loading) return;

    let i = 0;
    const typeInterval = setInterval(() => {
      setAppName(fullName.slice(0, i + 1));
      i++;
      if (i === fullName.length) {
        setTimeout(() => (i = 0), 2000); // Restart typing animation after a delay
      }
    }, 150);

    return () => clearInterval(typeInterval);
  }, [loading]);

  // Intersection Observer for smooth section reveals
  useEffect(() => {
    if (loading) return;

    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.25, // Section becomes visible when 25% in view
    };

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const id = entry.target.id;
        if (id && ["features", "testimonials", "how-it-works"].includes(id)) {
          setShowSections((prev) => ({
            ...prev,
            [id === "how-it-works" ? "howItWorks" : id]: entry.isIntersecting,
          }));
        }
      });
    }, observerOptions);

    // Observe each section
    const sections = document.querySelectorAll(
      "#features, #testimonials, #how-it-works"
    );
    sections.forEach((section) => {
      sectionObserver.observe(section);
    });

    return () => {
      // Cleanup observer
      sections.forEach((section) => {
        sectionObserver.unobserve(section);
      });
    };
  }, [loading]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-900 custom-scrollbar overflow-x-hidden">
      {/* Hero Background with Subtle Animation */}
      <div className="absolute inset-0 bg-[url('/hero-bg.jpg')] bg-cover bg-center min-h-screen opacity-20 animate-gradient-shift"></div>

      {/* Hero Section with Extra Padding and Animation */}
      <div className="text-center max-w-5xl relative z-10 pt-72 pb-48 px-4 transition-all duration-1000">
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
        <p className="text-2xl text-gray-700 mt-6 font-semibold max-w-3xl mx-auto">
          The AI-powered expense sharing app that makes group payments 5x faster
          and eliminates awkward money conversations.
        </p>

        {/* Call to Action Button with Hover Glow */}
        <div className="mt-8">
          <Link href="/signup">
            <button
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 
                text-white px-10 py-4 rounded-xl shadow-xl transition-all duration-300 ease-in-out transform 
                hover:shadow-[0px_0px_25px_rgba(128,0,255,0.5)] hover:scale-105 font-bold text-lg"
            >
              Sign Up for Free Today
            </button>
          </Link>
        </div>

        {/* Trusted by section */}
        <div className="mt-20 text-center">
          <p className="text-sm uppercase tracking-wider text-gray-500 mb-4">
            Trusted by users worldwide
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8 opacity-75">
            <div className="text-gray-600 font-semibold">
              <span className="text-indigo-600 text-xl mr-2">50K+</span>
              Active Users
            </div>
            <div className="text-gray-600 font-semibold">
              <span className="text-indigo-600 text-xl mr-2">4.9 ★</span>
              App Store Rating
            </div>
            <div className="text-gray-600 font-semibold">
              <span className="text-indigo-600 text-xl mr-2">$120M+</span>
              Expenses Settled
            </div>
            <div className="text-gray-600 font-semibold">
              <span className="text-indigo-600 text-xl mr-2">150+</span>
              Countries
            </div>
          </div>
        </div>
      </div>

      {/* Features Section - Enhanced UI with Animation */}
      <div id="features" className="w-full py-20 bg-white">
        <div className="max-w-5xl mx-auto px-8">
          <h2 className="text-5xl font-extrabold text-gray-900 text-center tracking-tight mb-12">
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
              Why Choose SplitEase?
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 bg-white/80 border border-gray-200 rounded-3xl shadow-2xl backdrop-blur-md">
            {[
              {
                icon: "✨",
                title: "AI-Powered Split Logic",
                desc: "Our machine learning algorithm learns your group's spending patterns to suggest the fairest splits.",
                color: "indigo-600",
              },
              {
                icon: "🔄",
                title: "Multi-Currency Support",
                desc: "Travel internationally? Track expenses in 150+ currencies with real-time exchange rates.",
                color: "purple-600",
              },
              {
                icon: "⚡",
                title: "Instant Settlements",
                desc: "Connect your preferred payment apps for one-tap transfers between friends.",
                color: "green-600",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-white hover:bg-indigo-50 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-indigo-600 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* App Screenshot Section */}
      <div className="w-full py-24 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-5xl mx-auto px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="md:w-1/2">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                <span className="text-indigo-600">Smart Expense Tracking</span>{" "}
                Made Simple
              </h2>
              <p className="text-lg text-gray-700 mb-8">
                SplitEase uses AI-powered algorithms to automatically categorize
                expenses and suggest fair splits based on who benefits most from
                each purchase.
              </p>
              <ul className="space-y-4">
                {[
                  "Receipt scanning with automatic item detection",
                  "Smart split suggestions based on past behaviors",
                  "Real-time expense notifications with reminders",
                  "Integrated payment options with no extra fees",
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-indigo-500 mr-3">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:w-1/2">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur-lg opacity-30"></div>
                <div className="relative bg-white p-4 rounded-3xl shadow-xl">
                  <div className="aspect-[9/16] bg-gray-100 rounded-2xl overflow-hidden">
                    <Image
                      src="/app-screenshot.png"
                      alt="SplitEase App Interface"
                      width={400}
                      height={800}
                      className="w-full h-full object-cover"
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div id="testimonials" className="w-full py-20 bg-white">
        <div className="max-w-5xl mx-auto px-8">
          <h2 className="text-5xl font-extrabold text-gray-900 text-center tracking-tight mb-12">
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
              What Our Users Say
            </span>
          </h2>
          <Testimonials />
        </div>
      </div>

      {/* How It Works Section with Interactive Steps */}
      <div
        id="how-it-works"
        className="w-full py-24 bg-gradient-to-br from-indigo-50 to-purple-50"
      >
        <div className="max-w-5xl mx-auto px-8">
          <h2 className="text-5xl font-extrabold text-gray-900 text-center tracking-tight mb-12">
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
              How SplitEase Works
            </span>
          </h2>

          <div className="p-12 bg-white/80 border border-gray-200 rounded-3xl shadow-2xl backdrop-blur-md">
            <ol className="space-y-8">
              {[
                {
                  step: "Step 1:",
                  title: "Create Your Group Circle",
                  description:
                    "Create a personalized group with custom expense categories and recurring bill schedules for roommates, trips, or events.",
                  icon: "📌",
                  color: "indigo-600",
                },
                {
                  step: "Step 2:",
                  title: "Capture & Analyze Expenses",
                  description:
                    "Snap a receipt photo and watch our AI detect individual items, suggesting who should pay what based on consumption patterns.",
                  icon: "📌",
                  color: "purple-600",
                },
                {
                  step: "Step 3:",
                  title: "View Smart Balance Reports",
                  description:
                    "Get personalized insights on spending trends and optimized debt simplification to minimize the number of transactions needed.",
                  icon: "📌",
                  color: "green-600",
                },
              ].map((step, index) => (
                <li
                  key={index}
                  className="flex items-center space-x-4 p-6 rounded-2xl bg-white shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <span className="text-3xl mr-4 text-indigo-600">
                    {step.icon}
                  </span>
                  <div>
                    <h3 className="text-2xl font-semibold text-indigo-700">
                      {step.step} {step.title}
                    </h3>
                    <p className="text-gray-700 mt-2">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="w-full py-20 bg-gradient-to-r from-indigo-900 to-purple-900 text-white">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Join 50,000+ users saving time with SplitEase
          </h2>
          <p className="text-indigo-200 text-lg mb-10 max-w-2xl mx-auto">
            The average SplitEase user saves 5+ hours per month on expense
            management and reduces payment complications by 90%.
          </p>
          <Link href="/signup">
            <button
              className="bg-white text-indigo-900 px-8 py-4 rounded-xl shadow-lg
                font-bold text-lg hover:bg-indigo-100 transition-colors duration-300"
            >
              Start Your 30-Day Free Trial
            </button>
          </Link>
          <p className="mt-4 text-indigo-300 text-sm">
            No credit card required. Unlimited groups & expenses during trial.
          </p>
        </div>
      </div>

      {/* Custom CSS */}
      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes blink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }

        .animate-gradient-shift {
          animation: gradient-shift 8s ease infinite;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-blink {
          animation: blink 1s step-end infinite;
        }

        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </main>
  );
}
