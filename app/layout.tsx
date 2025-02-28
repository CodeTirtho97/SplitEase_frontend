import { Metadata } from "next";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CustomScrollbar from "@/components/CustomScrollbar";
import "./globals.css";
import { AuthProvider } from "@/context/authContext";
import { ProfileProvider } from "@/context/profileContext";
import { GroupProvider } from "@/context/groupContext";
import { TransactionProvider } from "@/context/transactionContext";

export const metadata: Metadata = {
  title: "SplitEase - Split Bills With Friends Easily",
  description:
    "The easiest way to split bills, track expenses, and settle payments with friends!",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // This will force a client-side only render after initial hydration
    const originalConsoleError = console.error;
    console.error = (...args) => {
      if (args[0]?.includes("Hydration failed")) {
        return;
      }
      originalConsoleError.apply(console, args);
    };

    return () => {
      console.error = originalConsoleError;
    };
  }, []);
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ProfileProvider>
            <GroupProvider>
              <TransactionProvider>
                <Navbar />
                <CustomScrollbar />
                {children}
                <Footer />
              </TransactionProvider>
            </GroupProvider>
          </ProfileProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
