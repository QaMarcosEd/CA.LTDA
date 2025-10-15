'use client';

import { useSidebar } from '@/components/SidebarContext';

export default function MainContent({ children }) {
  const { isSidebarOpen } = useSidebar();

  return (
    <main
      className={`flex-1 min-w-0 transition-all duration-300 ease-in-out ${
        isSidebarOpen ? 'md:ml-64' : 'md:ml-16'
      } overflow-y-auto`}
    >
      {children}
    </main>
  );
}