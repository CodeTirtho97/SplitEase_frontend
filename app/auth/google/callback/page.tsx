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
      console.log("Window location:", window.location.href);
      console.log("Available cookies:", document.cookie);
      console.log("Search params:", window.location.search);
      try {
        setIsLoading(true);

        // Try to get authentication data from cookies first
        const authToken = Cookies.get("googleAuthToken");
        const authUserString = Cookies.get("googleAuthUser");

        // If cookies are available, use them
        if (authToken && authUserString) {
          try {
            const authUser = JSON.parse(authUserString);

            // Set persistent cookies and auth context, then redirect
            handleSuccessfulAuth(authToken, authUser);
            return;
          } catch (e) {
            console.error("Error parsing cookie user data:", e);
          }
        }

        // After trying to get cookies
        console.log("Auth token from cookie:", authToken);
        console.log("Auth user from cookie:", authUserString);

        // If cookies aren't available, try URL parameters
        const params = new URLSearchParams(window.location.search);
        const urlToken = params.get("token");
        const encodedUserData = params.get("userData");

        // After trying to get URL params
        console.log("Token from URL:", urlToken);
        console.log("User data from URL:", encodedUserData);

        if (urlToken && encodedUserData) {
          try {
            // Decode the base64 encoded user data
            const decodedUserData = atob(encodedUserData);
            const authUser = JSON.parse(decodedUserData);

            // Set persistent cookies and auth context, then redirect
            handleSuccessfulAuth(urlToken, authUser);
            return;
          } catch (e) {
            console.error("Error parsing URL user data:", e);
          }
        }

        // If we reach here, no auth data was found
        setError("No authentication data found");
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

    // Helper function to handle successful authentication
    function handleSuccessfulAuth(token: string, user: any) {
      // Store in persistent cookies
      Cookies.set("token", token, {
        expires: 7,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      Cookies.set("user", JSON.stringify(user), {
        expires: 7,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      // Update auth context
      setToken(token);
      setUser(user);

      // Show success message
      setSuccess(true);

      // Redirect to dashboard after a delay
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
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
