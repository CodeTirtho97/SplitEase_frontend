import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CustomScrollbar from "@/components/CustomScrollbar";
import "./globals.css";
import { AuthProvider } from "@/context/authContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          <CustomScrollbar />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
