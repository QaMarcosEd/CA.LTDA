// // // src/app/layout.js
// import { Geist, Geist_Mono } from "next/font/google";
// import "./globals.css";
// import CustomToaster from "@/components/ui/CustomToaster";
// import Sidebar from "../components/SideBar";
// import { SidebarProvider } from "@/components/SidebarContext";
// import MainContent from "@/components/MainContent";
// import AuthProvider from "../components/providers/SessionProvider";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// export const metadata = {
//   title: "Gerenciador de Estoque",
//   description: "Sistema para loja de calçados",
// };

// export default function RootLayout({ children }) {
//   return (
//     <html lang="pt-BR">
//       <body
//         suppressHydrationWarning
//         className={`${geistSans.variable} ${geistMono.variable} antialiased`}
//       >
//         {/* ✅ REMOVI bg-gray-50 - PROBLEMA RESOLVIDO! */}
//         <AuthProvider>
//           <SidebarProvider>
//             <div className="min-h-screen flex">
//               <Sidebar />
//               <MainContent>{children}</MainContent>
//             </div>
//           </SidebarProvider>
//           <CustomToaster />
//         </AuthProvider>
//       </body>
//     </html>
//   );
// }


// import { Geist, Geist_Mono } from "next/font/google";
// import "./globals.css";
// import CustomToaster from "@/components/ui/CustomToaster";
// import Sidebar from "../components/SideBar";
// import { SidebarProvider } from "@/components/SidebarContext";
// import MainContent from "@/components/MainContent";
// import AuthProvider from "../components/providers/SessionProvider";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// export const metadata = {
//   title: "Gerenciador de Estoque",
//   description: "Sistema para loja de calçados",
// };

// export default function RootLayout({ children }) {
//   return (
//     <html lang="pt-BR">
//       <body
//         suppressHydrationWarning
//         className={`${geistSans.variable} ${geistMono.variable} antialiased`}
//       >
//         <AuthProvider>
//           <SidebarProvider>
//             <div className="min-h-screen flex">
//               <Sidebar />
//               <MainContent>{children}</MainContent>
//             </div>
//           </SidebarProvider>
//           <CustomToaster />
//         </AuthProvider>
//       </body>
//     </html>
//   );
// }

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CustomToaster from "@/components/ui/CustomToaster";
import Sidebar from "../components/SideBar";
import { SidebarProvider } from "@/components/SidebarContext";
import MainContent from "@/components/MainContent";
import AuthProvider from "../components/providers/SessionProvider";

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
        className={`
          ${geistSans.variable} ${geistMono.variable} antialiased
          /* ✅ FUNDO NO BODY - NUNCA MAIS PARTE PRETA */
          bg-gray-50 dark:bg-gray-900
        `}
      >
        <AuthProvider>
          <SidebarProvider>
            <div className="min-h-screen flex">
              <Sidebar />
              <MainContent>{children}</MainContent>
            </div>
          </SidebarProvider>
          <CustomToaster />
        </AuthProvider>
      </body>
    </html>
  );
}