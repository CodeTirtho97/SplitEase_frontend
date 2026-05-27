import { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CustomScrollbar from "@/components/CustomScrollbar";
import "./globals.css";
import AppProviders from "@/components/AppProviders";
import ErrorBoundary from "@/components/ErrorBoundary";
import SessionManager from "@/components/SessionManager";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
        <ErrorBoundary>
          <AppProviders>
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
          </AppProviders>
        </ErrorBoundary>
      </body>
    </html>
  );
}
