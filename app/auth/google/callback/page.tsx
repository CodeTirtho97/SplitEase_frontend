"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";
import Cookies from "js-cookie";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const { setUser, setToken, user, token } = useAuth() || {};
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function processCallback() {
      try {
        // Check if we already have user and token in context
        if (user && token) {
          router.push("/dashboard");
          return;
        }

        // Get authentication data from cookies
        const authToken = Cookies.get("googleAuthToken");
        const authUserString = Cookies.get("googleAuthUser");

        if (authToken && authUserString && setToken && setUser) {
          try {
            // Parse the user data from the cookie
            const authUser = JSON.parse(authUserString);

            // Store in persistent cookies for session
            Cookies.set("token", authToken, {
              expires: 7,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
            });

            Cookies.set("user", authUserString, {
              expires: 7,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
            });

            // Remove temporary cookies
            Cookies.remove("googleAuthToken");
            Cookies.remove("googleAuthUser");

            // Update auth context
            setToken(authToken);
            setUser(authUser);

            // Show success message
            setSuccess(true);

            // Redirect to dashboard after a delay
            setTimeout(() => {
              router.push("/dashboard");
            }, 1500);

            return;
          } catch (e) {
            console.error("Error parsing user data:", e);
            setError("Failed to process authentication data");
          }
        } else {
          setError("No authentication data found");
        }

        // If we reach here, redirect to login after delay
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } catch (err) {
        console.error("Error in Google callback:", err);
        setError("Authentication failed");
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } finally {
        setIsLoading(false);
      }
    }

    processCallback();
  }, [router, setToken, setUser, user, token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-gray-50 to-purple-50">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full text-center border border-gray-300">
        {isLoading ? (
          <>
            <div className="w-16 h-16 border-4 border-t-indigo-600 border-r-transparent border-b-indigo-600 border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-800">
              Completing login...
            </h2>
            <p className="text-gray-600 mt-2">
              Please wait while we securely sign you in.
            </p>
          </>
        ) : error ? (
          <>
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-red-600">{error}</h2>
            <p className="text-gray-600 mt-2">
              Redirecting you back to login...
            </p>
          </>
        ) : (
          <>
            <div className="text-green-500 text-5xl mb-4">✅</div>
            <h2 className="text-xl font-semibold text-green-600">
              Login successful!
            </h2>
            <p className="text-gray-600 mt-2">
              Redirecting you to dashboard...
            </p>
          </>
        )}
      </div>
    </div>
  );
}
