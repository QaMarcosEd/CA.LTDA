import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CustomToaster from "@/components/ui/CustomToaster"; // importa o custom

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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <CustomToaster /> {/* só ele, nada de Toaster direto */}
      </body>
    </html>
  );
}
