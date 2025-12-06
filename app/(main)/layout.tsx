import { NavbarDemo } from "../../components/NavFooter/Navbar";
import Footer from "../../components/NavFooter/Footer";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen">
      <NavbarDemo />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
