// In app/auth/google/callback/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";
import Cookies from "js-cookie";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const { setUser, setToken } = useAuth() || {};
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function processCallback() {
      try {
        setIsLoading(true);

        // Debug logging
        console.log("Window location:", window.location.href);
        console.log("Available cookies:", document.cookie);
        console.log("Search params:", window.location.search);

        // Get data from URL parameters
        const params = new URLSearchParams(window.location.search);
        const urlToken = params.get("token");
        const encodedUserData = params.get("userData");

        console.log("Token from URL:", urlToken);
        console.log("User data from URL:", encodedUserData);

        if (urlToken && encodedUserData && setToken && setUser) {
          try {
            // Decode the base64 encoded user data
            const decodedUserData = atob(encodedUserData);
            console.log("Decoded user data:", decodedUserData);

            const authUser = JSON.parse(decodedUserData);
            console.log("Parsed user object:", authUser);

            // Store in persistent cookies
            Cookies.set("token", urlToken, {
              expires: 7,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
            });

            Cookies.set("user", JSON.stringify(authUser), {
              expires: 7,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
            });

            // Update auth context
            setToken(urlToken);
            setUser(authUser);

            // Show success message
            setSuccess(true);

            // Redirect to dashboard after a delay
            setTimeout(() => {
              router.push("/dashboard");
            }, 1500);

            return;
          } catch (e: any) {
            console.error("Error processing authentication data:", e);
            setError(`Error processing authentication data: ${e.message}`);
          }
        } else {
          setError("No authentication data found in URL parameters");
        }

        // If we reach here, no auth data was found or there was an error
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } catch (err: any) {
        console.error("Error in Google callback:", err);
        setError(`Authentication failed: ${err.message}`);
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } finally {
        setIsLoading(false);
      }
    }

    processCallback();
  }, [router, setToken, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-gray-50 to-purple-50">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full text-center border border-gray-300">
        {isLoading ? (
          <>
            <div className="w-16 h-16 border-4 border-t-indigo-600 border-r-transparent border-b-indigo-600 border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-800">
              Processing authentication...
            </h2>
            <p className="text-gray-600 mt-2">
              Please wait while we securely sign you in.
            </p>
          </>
        ) : error ? (
          <>
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-red-600">
              Authentication Error
            </h2>
            <p className="text-gray-600 mt-2">{error}</p>
            <p className="text-gray-500 mt-4">Redirecting to login page...</p>
          </>
        ) : (
          <>
            <div className="text-green-500 text-5xl mb-4">✅</div>
            <h2 className="text-xl font-semibold text-green-600">
              Login successful!
            </h2>
            <p className="text-gray-600 mt-2">
              Redirecting to your dashboard...
            </p>
          </>
        )}
      </div>
    </div>
  );
}
