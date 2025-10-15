import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CustomToaster from "@/components/ui/CustomToaster";
import Sidebar from "../components/SideBar";
import { SidebarProvider } from "@/components/SidebarContext";
import MainContent from "@/components/MainContent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Gerenciador de Estoque",
  description: "Sistema para loja de calçados",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        <SidebarProvider>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <MainContent>{children}</MainContent>
          </div>
        </SidebarProvider>
        <CustomToaster />
      </body>
    </html>
  );
}