"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";
import Cookies from "js-cookie";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const { setUser, setToken, user, token } = useAuth() || {};
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function processCallback() {
      try {
        setIsLoading(true);

        // Check if we already have user and token in context
        if (user && token) {
          router.push("/dashboard");
          return;
        }

        // Try to parse the JSON response if it's displayed on the page
        const responseText = document.body.textContent;
        if (
          responseText &&
          responseText.includes('"token"') &&
          responseText.includes('"user"')
        ) {
          try {
            // Try to find valid JSON in the page content
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const responseData = JSON.parse(jsonMatch[0]);

              if (responseData.token && responseData.user) {
                // Store in cookies
                Cookies.set("token", responseData.token, {
                  expires: 7,
                  secure: process.env.NODE_ENV === "production",
                  sameSite: "lax",
                });

                Cookies.set("user", JSON.stringify(responseData.user), {
                  expires: 7,
                  secure: process.env.NODE_ENV === "production",
                  sameSite: "lax",
                });

                // Update auth context
                if (setToken && setUser) {
                  setToken(responseData.token);
                  setUser(responseData.user);
                }

                // Redirect to dashboard
                setTimeout(() => {
                  router.push("/dashboard");
                }, 1000);

                return;
              }
            }
          } catch (e) {
            console.error("Error parsing JSON:", e);
          }
        }

        // If we reached here, try to get data from query parameters
        const urlParams = new URLSearchParams(window.location.search);
        const urlToken = urlParams.get("token");
        const urlUserId = urlParams.get("userId");

        if (urlToken && urlUserId) {
          try {
            // Fetch user data using the token and userId
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/profile/${urlUserId}`,
              {
                headers: {
                  Authorization: `Bearer ${urlToken}`,
                },
              }
            );

            if (response.ok) {
              const userData = await response.json();

              // Store in cookies
              Cookies.set("token", urlToken, {
                expires: 7,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
              });

              Cookies.set("user", JSON.stringify(userData), {
                expires: 7,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
              });

              // Update auth context
              if (setToken && setUser) {
                setToken(urlToken);
                setUser(userData);
              }

              // Redirect to dashboard
              setTimeout(() => {
                router.push("/dashboard");
              }, 1000);

              return;
            }
          } catch (e) {
            console.error("Error fetching user data:", e);
          }
        }

        // If all else fails, show error and redirect to login
        setError("Could not process authentication response");
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
