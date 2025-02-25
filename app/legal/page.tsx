"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShieldAlt,
  faFileContract,
  faEnvelope,
  faHome,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import {
  faXTwitter,
  faLinkedin,
  faGithub,
} from "@fortawesome/free-brands-svg-icons";

const LegalPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams(); // ✅ Only used in client-side effects
  const [activeTab, setActiveTab] = useState("privacy");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // ✅ Check if user is logged in (Client-Side Only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userToken = localStorage.getItem("userToken");
      setIsLoggedIn(!!userToken);
    }
  }, []);

  // ✅ Get Query Params for Tabs (Client-Side Only)
  useEffect(() => {
    if (searchParams) {
      const tab = searchParams.get("tab");
      if (tab === "privacy" || tab === "terms" || tab === "contact") {
        setActiveTab(tab);
      }
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen pt-24 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100 text-gray-800 flex flex-col items-center p-8">
      {/* ✅ Header */}
      <div className="w-full max-w-3xl bg-white shadow-md rounded-lg p-6 text-center">
        <h1 className="text-3xl font-extrabold text-indigo-700">
          Legal & Contact
        </h1>
        <p className="text-gray-600 mt-1">
          Learn about our policies & reach out to us.
        </p>

        {/* ✅ Navigation Tabs */}
        <div className="mt-6 flex justify-center gap-4">
          {["privacy", "terms", "contact"].map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 font-semibold rounded-md ${
                activeTab === tab
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 text-gray-700"
              } transition`}
              onClick={() => setActiveTab(tab)}
            >
              <FontAwesomeIcon
                icon={
                  tab === "privacy"
                    ? faShieldAlt
                    : tab === "terms"
                    ? faFileContract
                    : faEnvelope
                }
                className="mr-2"
              />
              {tab === "privacy"
                ? "Privacy Policy"
                : tab === "terms"
                ? "Terms of Service"
                : "Contact Us"}
            </button>
          ))}
        </div>
      </div>

      {/* ✅ Content Section */}
      <div className="w-full max-w-3xl bg-white shadow-md rounded-lg p-6 mt-6 text-gray-700">
        {activeTab === "privacy" && (
          <div>
            <h2 className="text-2xl font-semibold text-indigo-700">
              Privacy Policy
            </h2>
            <p className="mt-3">
              Your privacy is important to us. We collect and process personal
              data only for necessary services.
            </p>
            <ul className="mt-3 list-disc pl-5">
              <li>🔒 We securely store your personal and financial data.</li>
              <li>
                🔹 Your information is never shared without your explicit
                consent.
              </li>
              <li>
                📜 You can request access, update, or delete your data at any
                time.
              </li>
              <li>
                📧 For privacy concerns, contact{" "}
                <span className="text-indigo-600 font-semibold">
                  privacy@splitapp.com
                </span>
                .
              </li>
            </ul>
          </div>
        )}

        {activeTab === "terms" && (
          <div>
            <h2 className="text-2xl font-semibold text-indigo-700">
              Terms of Service
            </h2>
            <p className="mt-3">
              By using our services, you agree to abide by the following terms
              and conditions.
            </p>
            <ul className="mt-3 list-disc pl-5">
              <li>
                ✅ You must provide accurate information while registering.
              </li>
              <li>
                🚫 Any fraudulent activity or misuse of the platform is
                prohibited.
              </li>
              <li>
                ⚖️ We reserve the right to terminate accounts violating our
                policies.
              </li>
              <li>
                🔄 These terms may be updated, and continued use implies
                acceptance.
              </li>
              <li>
                📧 For legal inquiries, contact{" "}
                <span className="text-indigo-600 font-semibold">
                  legal@splitapp.com
                </span>
                .
              </li>
            </ul>
          </div>
        )}

        {activeTab === "contact" && (
          <div>
            <h2 className="text-2xl font-semibold text-indigo-700">
              Contact Us
            </h2>
            <p className="mt-3">
              Need help? Reach out to us through any of the following methods:
            </p>
            <ul className="mt-3 list-disc pl-5">
              <li>
                📧 Support Email:{" "}
                <span className="text-indigo-600 font-semibold">
                  support@splitapp.com
                </span>
              </li>
              <li>
                📞 Phone: <span className="font-semibold">+91-9876543210</span>
              </li>
              <li>💬 Live Chat: Available in the Help section of the app.</li>
            </ul>
          </div>
        )}
      </div>

      {/* ✅ Social Media Links */}
      <div className="mt-8 flex gap-6">
        <a
          href="https://twitter.com/lucifer_7951"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-700 hover:text-indigo-700 transition"
        >
          <FontAwesomeIcon icon={faXTwitter} className="text-2xl" />
        </a>
        <a
          href="https://linkedin.com/in/tirthoraj-bhattacharya/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-700 hover:text-indigo-700 transition"
        >
          <FontAwesomeIcon icon={faLinkedin} className="text-2xl" />
        </a>
        <a
          href="https://github.com/CodeTirtho97"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-700 hover:text-indigo-700 transition"
        >
          <FontAwesomeIcon icon={faGithub} className="text-2xl" />
        </a>
      </div>

      {/* ✅ Back Button */}
      <button
        className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-md font-semibold flex items-center gap-2 hover:bg-indigo-700 transition"
        onClick={() => router.push(isLoggedIn ? "/dashboard" : "/")}
      >
        <FontAwesomeIcon
          icon={isLoggedIn ? faArrowLeft : faHome}
          className="text-lg"
        />
        {isLoggedIn ? "Back to Dashboard" : "Back to Home"}
      </button>
    </div>
  );
};

export default LegalPage;
