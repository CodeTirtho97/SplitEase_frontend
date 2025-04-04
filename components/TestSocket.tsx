import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Cookies from "js-cookie";

export default function TestSocket() {
  const [status, setStatus] = useState("Initializing...");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      setStatus("No token found");
      return;
    }

    // Try multiple URLs to find the correct one
    const urls = [
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
      "http://localhost:5000",
      "https://splitease-backend-34tz.onrender.com",
    ];

    let successfulUrl = "";

    urls.forEach((baseUrl) => {
      try {
        // Clean URL
        while (baseUrl.endsWith("/")) {
          baseUrl = baseUrl.slice(0, -1);
        }

        console.log(`Testing socket connection to: ${baseUrl}`);

        const socket = io(baseUrl, {
          auth: { token },
          transports: ["websocket", "polling"],
        });

        socket.on("connect", () => {
          setStatus(`Connected to ${baseUrl}`);
          successfulUrl = baseUrl;
          console.log("Connection successful to:", baseUrl);
        });

        socket.on("connect_error", (err) => {
          console.log(`Connection to ${baseUrl} failed:`, err.message);
          if (!successfulUrl) {
            setError(`${baseUrl}: ${err.message}`);
          }
        });

        // Cleanup
        return () => {
          socket.disconnect();
        };
      } catch (err) {
        console.error(`Error with ${baseUrl}:`, err);
      }
    });
  }, []);

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-lg font-bold">Socket.IO Test</h2>
      <div className="mt-2">
        <p>
          <strong>Status:</strong> {status}
        </p>
        {error && (
          <p className="text-red-500">
            <strong>Error:</strong> {error}
          </p>
        )}
      </div>
    </div>
  );
}
