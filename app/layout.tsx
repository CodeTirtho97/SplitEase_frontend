import { Metadata } from "next";
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
