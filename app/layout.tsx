import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CustomScrollbar from "@/components/CustomScrollbar";
import "./globals.css";
import { AuthProvider } from "@/context/authContext";
import { ProfileProvider } from "@/context/profileContext";

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
            <Navbar />
            <CustomScrollbar />
            {children}
            <Footer />
          </ProfileProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
