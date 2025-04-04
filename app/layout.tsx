import { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CustomScrollbar from "@/components/CustomScrollbar";
import "./globals.css";
import { AuthProvider } from "@/context/authContext";
import { ProfileProvider } from "@/context/profileContext";
import { GroupProvider } from "@/context/groupContext";
import { TransactionProvider } from "@/context/transactionContext";
import { SocketProvider } from "@/context/socketContext";
import SessionManager from "@/components/SessionManager"; // Import Session Manager
import { ToastContainer } from "react-toastify"; // Import ToastContainer
import TestSocket from "../components/TestSocket";
import "react-toastify/dist/ReactToastify.css"; // Import toastify styles

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
  return (
    <html lang="en">
      <body>
        {process.env.NODE_ENV === "development" && <TestSocket />}
        <AuthProvider>
          <ProfileProvider>
            <GroupProvider>
              <TransactionProvider>
                <SocketProvider>
                  <SessionManager>
                    <Navbar />
                    <CustomScrollbar />
                    {children}
                  </SessionManager>
                  <ToastContainer
                    position="top-right"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                  />
                  <Footer />
                </SocketProvider>
              </TransactionProvider>
            </GroupProvider>
          </ProfileProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
