import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CustomScrollbar from "@/components/CustomScrollbar";
import "./globals.css";
import { AuthProvider } from "@/context/authContext";
import { ProfileProvider } from "@/context/profileContext";
import { GroupProvider } from "@/context/groupContext";
import { TransactionProvider } from "@/context/transactionContext";

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
