import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CustomScrollbar from "@/components/CustomScrollbar";
import "./globals.css";
import { AuthProvider } from "@/context/authContext";
import { ProfileProvider } from "@/context/profileContext";
import { GroupProvider } from "@/context/groupContext";

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
              <Navbar />
              <CustomScrollbar />
              {children}
              <Footer />
            </GroupProvider>
          </ProfileProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
