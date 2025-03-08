"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShieldAlt,
  faFileContract,
  faEnvelope,
  faHome,
  faArrowLeft,
  faUserShield,
  faBalanceScale,
  faHandshake,
  faGlobe,
  faPhoneAlt,
  faMapMarkerAlt,
  faClock,
  faQuestionCircle,
  faBug,
  faBusinessTime,
  faHeadset,
} from "@fortawesome/free-solid-svg-icons";
import {
  faXTwitter,
  faLinkedin,
  faGithub,
  faInstagram,
  faFacebook,
} from "@fortawesome/free-brands-svg-icons";
import { useAuth } from "@/context/authContext"; // Import useAuth hook

// SearchParams Handler Component
const SearchParamsHandler = ({
  setActiveTab,
}: {
  setActiveTab: (tab: string) => void;
}) => {
  const searchParams = useSearchParams();

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "privacy" || tab === "terms" || tab === "contact") {
      setActiveTab(tab);
    }
  }, [searchParams, setActiveTab]);

  return null;
};

const LegalPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("privacy");
  const { token } = useAuth(); // Get token from auth context

  // Determine if user is logged in based on auth context
  const isLoggedIn = !!token;

  return (
    <Suspense fallback={<div>Loading legal page...</div>}>
      {/* SearchParams Handler */}
      <SearchParamsHandler setActiveTab={setActiveTab} />

      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-50 text-gray-800 flex flex-col items-center pb-16 relative">
        {/* Background Design Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {/* Dots pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%">
              <pattern
                id="pattern-circles"
                x="0"
                y="0"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
                patternContentUnits="userSpaceOnUse"
              >
                <circle
                  id="pattern-circle"
                  cx="10"
                  cy="10"
                  r="1"
                  fill="currentColor"
                />
              </pattern>
              <rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                fill="url(#pattern-circles)"
              />
            </svg>
          </div>

          {/* Abstract shapes */}
          <div className="absolute top-1/4 -left-10 w-64 h-64 rounded-full bg-gradient-to-r from-indigo-300 to-purple-300 opacity-20 blur-3xl"></div>
          <div className="absolute bottom-1/4 -right-10 w-80 h-80 rounded-full bg-gradient-to-r from-purple-300 to-indigo-300 opacity-20 blur-3xl"></div>
          <div className="absolute top-3/4 left-1/3 w-40 h-40 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 opacity-15 blur-2xl"></div>

          {/* Subtle wave pattern */}
          <div className="absolute bottom-0 left-0 right-0 h-64 opacity-10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1440 320"
              className="w-full"
            >
              <path
                fill="currentColor"
                fillOpacity="1"
                d="M0,192L48,208C96,224,192,256,288,261.3C384,267,480,245,576,218.7C672,192,768,160,864,165.3C960,171,1056,213,1152,229.3C1248,245,1344,235,1392,229.3L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              ></path>
            </svg>
          </div>
        </div>

        {/* Header Section with Logo */}
        <div className="w-full pt-24 flex justify-center mb-8 z-10">
          <div className="flex items-center gap-3 text-3xl font-bold text-gray-700">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white">S</span>
            </div>
            <span>
              SplitEase<span className="text-indigo-600">.</span>
            </span>
          </div>
        </div>

        {/* Content Container */}
        <div className="w-full max-w-4xl px-4 z-10">
          {/* Page Header */}
          <div className="bg-white shadow-xl rounded-2xl p-8 mb-8 text-center relative overflow-hidden">
            {/* Header Background Accent */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-600 to-purple-600"></div>

            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-transparent bg-clip-text">
              Legal & Contact
            </h1>
            <p className="text-gray-600 mt-3 text-lg">
              Important information about our services, policies, and how to
              reach us
            </p>

            {/* Navigation Tabs - Redesigned */}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button
                className={`px-5 py-3 font-medium rounded-xl flex items-center transition-all duration-300 ${
                  activeTab === "privacy"
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setActiveTab("privacy")}
              >
                <FontAwesomeIcon icon={faShieldAlt} className="mr-2" /> Privacy
                Policy
              </button>

              <button
                className={`px-5 py-3 font-medium rounded-xl flex items-center transition-all duration-300 ${
                  activeTab === "terms"
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setActiveTab("terms")}
              >
                <FontAwesomeIcon icon={faFileContract} className="mr-2" /> Terms
                of Service
              </button>

              <button
                className={`px-5 py-3 font-medium rounded-xl flex items-center transition-all duration-300 ${
                  activeTab === "contact"
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setActiveTab("contact")}
              >
                <FontAwesomeIcon icon={faEnvelope} className="mr-2" /> Contact
                Us
              </button>
            </div>
          </div>

          {/* Content Sections */}
          <div className="bg-white shadow-xl rounded-2xl p-8 mb-8">
            {activeTab === "privacy" && (
              <div className="space-y-8">
                <div className="mb-8 text-center">
                  <FontAwesomeIcon
                    icon={faUserShield}
                    className="text-5xl text-indigo-600 mb-4"
                  />
                  <h2 className="text-3xl font-bold text-gray-800">
                    Privacy Policy
                  </h2>
                  <p className="text-gray-600 mt-2">
                    Last Updated: March 1, 2025
                  </p>
                </div>

                <div className="space-y-6">
                  <section>
                    <h3 className="text-xl font-semibold text-indigo-700 mb-3">
                      Our Commitment to Your Privacy
                    </h3>
                    <p className="text-gray-700">
                      At SplitEase, we take your privacy seriously. This policy
                      outlines how we collect, use, and protect your personal
                      information when you use our services.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-indigo-700 mb-3">
                      Information We Collect
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-indigo-50 p-4 rounded-xl">
                        <h4 className="font-medium text-indigo-700 mb-2">
                          Personal Information
                        </h4>
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <span className="text-indigo-500 mr-2 mt-1">•</span>
                            <span>
                              Name, email address, and contact details
                            </span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-indigo-500 mr-2 mt-1">•</span>
                            <span>Profile information you provide</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-indigo-500 mr-2 mt-1">•</span>
                            <span>
                              Payment method details (securely encrypted)
                            </span>
                          </li>
                        </ul>
                      </div>

                      <div className="bg-purple-50 p-4 rounded-xl">
                        <h4 className="font-medium text-purple-700 mb-2">
                          Usage Information
                        </h4>
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <span className="text-purple-500 mr-2 mt-1">•</span>
                            <span>Device information and IP address</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-purple-500 mr-2 mt-1">•</span>
                            <span>How you interact with our services</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-purple-500 mr-2 mt-1">•</span>
                            <span>Transaction history and expense data</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-indigo-700 mb-3">
                      How We Use Your Information
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <div className="bg-indigo-100 p-2 rounded-full mr-3 mt-1">
                          <FontAwesomeIcon
                            icon={faHandshake}
                            className="text-indigo-600 w-4 h-4"
                          />
                        </div>
                        <div>
                          <span className="font-medium">
                            Provide Our Services
                          </span>
                          <p className="text-gray-600 text-sm mt-1">
                            To manage your account, process transactions, and
                            enable expense splitting with friends
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-indigo-100 p-2 rounded-full mr-3 mt-1">
                          <FontAwesomeIcon
                            icon={faShieldAlt}
                            className="text-indigo-600 w-4 h-4"
                          />
                        </div>
                        <div>
                          <span className="font-medium">Enhance Security</span>
                          <p className="text-gray-600 text-sm mt-1">
                            To protect your account, prevent fraud, and ensure
                            secure transactions
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-indigo-100 p-2 rounded-full mr-3 mt-1">
                          <FontAwesomeIcon
                            icon={faGlobe}
                            className="text-indigo-600 w-4 h-4"
                          />
                        </div>
                        <div>
                          <span className="font-medium">
                            Improve Our Services
                          </span>
                          <p className="text-gray-600 text-sm mt-1">
                            To enhance features, develop new services, and
                            optimize user experience
                          </p>
                        </div>
                      </li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-indigo-700 mb-3">
                      Your Rights
                    </h3>
                    <p className="text-gray-700 mb-4">
                      You have several rights regarding your personal data:
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 p-4 rounded-xl text-center">
                        <p className="font-medium">Access</p>
                        <p className="text-sm text-gray-600">
                          Request a copy of your data
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl text-center">
                        <p className="font-medium">Rectification</p>
                        <p className="text-sm text-gray-600">
                          Update inaccurate information
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl text-center">
                        <p className="font-medium">Erasure</p>
                        <p className="text-sm text-gray-600">
                          Request deletion of your data
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl text-center">
                        <p className="font-medium">Restrict Processing</p>
                        <p className="text-sm text-gray-600">
                          Limit how we use your data
                        </p>
                      </div>
                    </div>
                  </section>
                </div>

                <div className="bg-indigo-50 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-indigo-700 mb-2">
                    Contact Our Privacy Team
                  </h3>
                  <p className="text-gray-700 mb-4">
                    For privacy-related inquiries or to exercise your rights,
                    please contact us at:
                  </p>
                  <div className="flex items-center text-indigo-700">
                    <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                    <a
                      href="mailto:privacy@splitease.com"
                      className="font-medium hover:underline"
                    >
                      privacy@splitease.com
                    </a>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "terms" && (
              <div className="space-y-8">
                <div className="mb-8 text-center">
                  <FontAwesomeIcon
                    icon={faBalanceScale}
                    className="text-5xl text-indigo-600 mb-4"
                  />
                  <h2 className="text-3xl font-bold text-gray-800">
                    Terms of Service
                  </h2>
                  <p className="text-gray-600 mt-2">
                    Last Updated: March 1, 2025
                  </p>
                </div>

                <div className="space-y-6">
                  <section>
                    <h3 className="text-xl font-semibold text-indigo-700 mb-3">
                      Agreement to Terms
                    </h3>
                    <p className="text-gray-700">
                      By accessing or using SplitEase, you agree to be bound by
                      these Terms of Service and all applicable laws and
                      regulations. If you disagree with any part of these terms,
                      you may not use our services.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-indigo-700 mb-3">
                      Account Responsibilities
                    </h3>
                    <div className="bg-gray-50 p-5 rounded-xl space-y-4">
                      <div className="flex items-start">
                        <div className="bg-indigo-100 p-2 rounded-full mr-3 mt-1 flex-shrink-0">
                          <span className="text-indigo-700 font-bold">1</span>
                        </div>
                        <div>
                          <p className="font-medium">
                            Registration Requirements
                          </p>
                          <p className="text-gray-600 text-sm mt-1">
                            You must provide accurate, current, and complete
                            information during registration and keep your
                            account information updated.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="bg-indigo-100 p-2 rounded-full mr-3 mt-1 flex-shrink-0">
                          <span className="text-indigo-700 font-bold">2</span>
                        </div>
                        <div>
                          <p className="font-medium">Account Security</p>
                          <p className="text-gray-600 text-sm mt-1">
                            You're responsible for maintaining the
                            confidentiality of your password and account
                            information, and for all activities that occur under
                            your account.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="bg-indigo-100 p-2 rounded-full mr-3 mt-1 flex-shrink-0">
                          <span className="text-indigo-700 font-bold">3</span>
                        </div>
                        <div>
                          <p className="font-medium">Prohibited Activities</p>
                          <p className="text-gray-600 text-sm mt-1">
                            You may not use our services for any illegal or
                            unauthorized purpose, nor violate any laws in your
                            jurisdiction.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="bg-indigo-100 p-2 rounded-full mr-3 mt-1 flex-shrink-0">
                          <span className="text-indigo-700 font-bold">4</span>
                        </div>
                        <div>
                          <p className="font-medium">Account Termination</p>
                          <p className="text-gray-600 text-sm mt-1">
                            We reserve the right to terminate or suspend
                            accounts that violate these terms or for any other
                            reason at our sole discretion.
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-indigo-700 mb-3">
                      Service Usage
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-purple-50 p-4 rounded-xl">
                        <h4 className="font-medium text-purple-700 mb-2">
                          Expense Tracking
                        </h4>
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <span className="text-purple-500 mr-2 mt-1">•</span>
                            <span>
                              You are responsible for the accuracy of expenses
                              you record
                            </span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-purple-500 mr-2 mt-1">•</span>
                            <span>
                              We are not responsible for disputes between users
                              regarding expenses
                            </span>
                          </li>
                        </ul>
                      </div>

                      <div className="bg-indigo-50 p-4 rounded-xl">
                        <h4 className="font-medium text-indigo-700 mb-2">
                          Payments
                        </h4>
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <span className="text-indigo-500 mr-2 mt-1">•</span>
                            <span>
                              SplitEase facilitates but does not process
                              payments directly
                            </span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-indigo-500 mr-2 mt-1">•</span>
                            <span>
                              Third-party payment processors are subject to
                              their own terms
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-indigo-700 mb-3">
                      Limitation of Liability
                    </h3>
                    <p className="text-gray-700">
                      SplitEase and its suppliers shall not be liable for any
                      indirect, incidental, special, consequential, or punitive
                      damages resulting from your access to or use of, or
                      inability to access or use, the service or any content
                      provided by SplitEase.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-indigo-700 mb-3">
                      Changes to Terms
                    </h3>
                    <p className="text-gray-700">
                      We reserve the right to modify these terms at any time. We
                      will provide notice of significant changes by updating the
                      date at the top of these terms and you waive any right to
                      receive specific notice of each such change.
                    </p>
                  </section>
                </div>

                <div className="bg-indigo-50 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-indigo-700 mb-2">
                    Legal Inquiries
                  </h3>
                  <p className="text-gray-700 mb-4">
                    For legal questions or concerns, please contact our legal
                    team at:
                  </p>
                  <div className="flex items-center text-indigo-700">
                    <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                    <a
                      href="mailto:legal@splitease.com"
                      className="font-medium hover:underline"
                    >
                      legal@splitease.com
                    </a>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "contact" && (
              <div className="space-y-8">
                <div className="mb-8 text-center">
                  <FontAwesomeIcon
                    icon={faHeadset}
                    className="text-5xl text-indigo-600 mb-4"
                  />
                  <h2 className="text-3xl font-bold text-gray-800">
                    Contact Us
                  </h2>
                  <p className="text-gray-600 mt-2">
                    We're here to help you with any questions or concerns
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <section>
                      <h3 className="text-xl font-semibold text-indigo-700 mb-3">
                        Get in Touch
                      </h3>
                      <ul className="space-y-4">
                        <li className="flex items-start">
                          <div className="bg-indigo-100 p-2.5 rounded-full mr-3">
                            <FontAwesomeIcon
                              icon={faEnvelope}
                              className="text-indigo-600 w-4 h-4"
                            />
                          </div>
                          <div>
                            <p className="font-medium">Email Us</p>
                            <a
                              href="mailto:support@splitease.com"
                              className="text-indigo-600 hover:underline"
                            >
                              support@splitease.com
                            </a>
                          </div>
                        </li>

                        <li className="flex items-start">
                          <div className="bg-indigo-100 p-2.5 rounded-full mr-3">
                            <FontAwesomeIcon
                              icon={faPhoneAlt}
                              className="text-indigo-600 w-4 h-4"
                            />
                          </div>
                          <div>
                            <p className="font-medium">Call Us</p>
                            <a
                              href="tel:+919876543210"
                              className="text-indigo-600 hover:underline"
                            >
                              +91 9876 543 210
                            </a>
                            <p className="text-gray-500 text-sm">
                              Monday to Friday, 9am to 6pm IST
                            </p>
                          </div>
                        </li>

                        <li className="flex items-start">
                          <div className="bg-indigo-100 p-2.5 rounded-full mr-3">
                            <FontAwesomeIcon
                              icon={faMapMarkerAlt}
                              className="text-indigo-600 w-4 h-4"
                            />
                          </div>
                          <div>
                            <p className="font-medium">Our Location</p>
                            <p className="text-gray-700">
                              SplitEase Headquarters
                            </p>
                            <p className="text-gray-600 text-sm">
                              Sector 62, Noida, Uttar Pradesh, India
                            </p>
                          </div>
                        </li>

                        <li className="flex items-start">
                          <div className="bg-indigo-100 p-2.5 rounded-full mr-3">
                            <FontAwesomeIcon
                              icon={faClock}
                              className="text-indigo-600 w-4 h-4"
                            />
                          </div>
                          <div>
                            <p className="font-medium">Business Hours</p>
                            <p className="text-gray-600 text-sm">
                              Monday to Friday: 9:00 AM - 6:00 PM IST
                            </p>
                            <p className="text-gray-600 text-sm">
                              Saturday: 10:00 AM - 2:00 PM IST
                            </p>
                            <p className="text-gray-600 text-sm">
                              Sunday: Closed
                            </p>
                          </div>
                        </li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-xl font-semibold text-indigo-700 mb-3">
                        Connect With Us
                      </h3>
                      <div className="flex gap-4 mt-2">
                        <a
                          href="https://twitter.com/lucifer_7951"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-indigo-100 p-3 rounded-full hover:bg-indigo-200 transition-colors"
                        >
                          <FontAwesomeIcon
                            icon={faXTwitter}
                            className="text-indigo-700 w-5 h-5"
                          />
                        </a>
                        <a
                          href="https://linkedin.com/in/tirthoraj-bhattacharya/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-indigo-100 p-3 rounded-full hover:bg-indigo-200 transition-colors"
                        >
                          <FontAwesomeIcon
                            icon={faLinkedin}
                            className="text-indigo-700 w-5 h-5"
                          />
                        </a>
                        <a
                          href="https://github.com/CodeTirtho97"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-indigo-100 p-3 rounded-full hover:bg-indigo-200 transition-colors"
                        >
                          <FontAwesomeIcon
                            icon={faGithub}
                            className="text-indigo-700 w-5 h-5"
                          />
                        </a>
                        <a
                          href="#"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-indigo-100 p-3 rounded-full hover:bg-indigo-200 transition-colors"
                        >
                          <FontAwesomeIcon
                            icon={faInstagram}
                            className="text-indigo-700 w-5 h-5"
                          />
                        </a>
                        <a
                          href="#"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-indigo-100 p-3 rounded-full hover:bg-indigo-200 transition-colors"
                        >
                          <FontAwesomeIcon
                            icon={faFacebook}
                            className="text-indigo-700 w-5 h-5"
                          />
                        </a>
                      </div>
                    </section>
                  </div>

                  <div className="space-y-6">
                    <section>
                      <h3 className="text-xl font-semibold text-indigo-700 mb-3">
                        Specialized Support
                      </h3>
                      <ul className="space-y-4">
                        <li className="flex items-start">
                          <div className="bg-purple-100 p-2.5 rounded-full mr-3">
                            <FontAwesomeIcon
                              icon={faQuestionCircle}
                              className="text-purple-600 w-4 h-4"
                            />
                          </div>
                          <div>
                            <p className="font-medium">General Inquiries</p>
                            <a
                              href="mailto:info@splitease.com"
                              className="text-purple-600 hover:underline"
                            >
                              info@splitease.com
                            </a>
                            <p className="text-gray-500 text-sm">
                              For general questions about our services
                            </p>
                          </div>
                        </li>

                        <li className="flex items-start">
                          <div className="bg-purple-100 p-2.5 rounded-full mr-3">
                            <FontAwesomeIcon
                              icon={faBug}
                              className="text-purple-600 w-4 h-4"
                            />
                          </div>
                          <div>
                            <p className="font-medium">Technical Support</p>
                            <a
                              href="mailto:tech@splitease.com"
                              className="text-purple-600 hover:underline"
                            >
                              tech@splitease.com
                            </a>
                            <p className="text-gray-500 text-sm">
                              For technical issues or bug reports
                            </p>
                          </div>
                        </li>

                        <li className="flex items-start">
                          <div className="bg-purple-100 p-2.5 rounded-full mr-3">
                            <FontAwesomeIcon
                              icon={faBusinessTime}
                              className="text-purple-600 w-4 h-4"
                            />
                          </div>
                          <div>
                            <p className="font-medium">Business Partnerships</p>
                            <a
                              href="mailto:partnerships@splitease.com"
                              className="text-purple-600 hover:underline"
                            >
                              partnerships@splitease.com
                            </a>
                            <p className="text-gray-500 text-sm">
                              For partnership and business inquiries
                            </p>
                          </div>
                        </li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-xl font-semibold text-indigo-700 mb-3">
                        Help Center
                      </h3>
                      <div className="bg-gray-50 p-5 rounded-xl">
                        <p className="text-gray-700 mb-3">
                          Check our comprehensive help center for answers to
                          frequently asked questions, tutorials, and guides.
                        </p>
                        <a
                          href="#"
                          className="inline-block px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-colors"
                        >
                          Visit Help Center
                        </a>
                      </div>
                    </section>
                  </div>
                </div>

                <div>
                  <section className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-5 rounded-xl mt-8">
                    <h3 className="text-xl font-semibold mb-3">
                      Live Chat Support
                    </h3>
                    <p className="mb-4">
                      Need immediate assistance? Our support team is available
                      via live chat during business hours.
                    </p>
                    <button className="bg-white text-indigo-700 px-4 py-2 rounded-lg font-medium hover:bg-indigo-50 transition-colors">
                      Start Live Chat
                    </button>
                  </section>
                </div>

                <div className="border-t border-gray-200 pt-8 mt-8">
                  <h3 className="text-xl font-semibold text-indigo-700 mb-4">
                    Frequently Asked Questions
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <p className="font-medium text-indigo-700">
                        How quickly will I receive a response?
                      </p>
                      <p className="text-gray-600 mt-1">
                        We aim to respond to all inquiries within 24 hours
                        during business days.
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl">
                      <p className="font-medium text-indigo-700">
                        Can I get help with splitting a specific expense?
                      </p>
                      <p className="text-gray-600 mt-1">
                        Yes! Our support team can guide you through any
                        difficulty with expense splitting.
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl">
                      <p className="font-medium text-indigo-700">
                        How do I report a bug in the app?
                      </p>
                      <p className="text-gray-600 mt-1">
                        You can email our technical team at tech@splitease.com
                        with details and screenshots.
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl">
                      <p className="font-medium text-indigo-700">
                        Are there API integrations available?
                      </p>
                      <p className="text-gray-600 mt-1">
                        For API and integration inquiries, please contact our
                        partnerships team.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Back Button - Redesigned with conditional text based on auth state */}
          <div className="flex justify-center">
            <button
              onClick={() => router.push(isLoggedIn ? "/dashboard" : "/")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md"
            >
              <FontAwesomeIcon
                icon={isLoggedIn ? faArrowLeft : faHome}
                className="text-lg"
              />
              {isLoggedIn ? "Back to Dashboard" : "Back to Home"}
            </button>
          </div>
        </div>
      </div>
    </Suspense>
  );
};

export default LegalPage;
