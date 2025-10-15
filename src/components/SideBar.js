'use client';

import { usePathname } from 'next/navigation';
import { useSidebar } from '@/components/SidebarContext';
import { Menu, X } from 'lucide-react';

const menuItems = [
  { id: '/', label: 'Home', icon: '🏠', href: '/' },
  { id: 'dashboard', label: 'Dashboard', icon: '📊', href: '/dashboard' },
  { id: 'clientes', label: 'Clientes', icon: '🧑‍🦱', href: '/clientes' },
  { id: 'estoque', label: 'Estoque', icon: '📦', href: '/estoque' },
  { id: 'vendas', label: 'Vendas', icon: '📈', href: '/vendas' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { mobileOpen, setMobileOpen, isSidebarOpen, setIsSidebarOpen } = useSidebar();
  
  const activeId = pathname.split('/')[1] || '/';

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    if (mobileOpen) setMobileOpen(false); // Fecha no mobile se estiver aberto
  };

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-white shadow-xl border-r border-gray-200 flex flex-col z-40 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'w-64' : 'w-16'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className={`p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white flex items-center ${
          isSidebarOpen ? 'justify-between' : 'justify-center'
        }`}>
          {isSidebarOpen && (
            <h1 className="text-xl font-bold font-poppins flex items-center gap-2">
              <span className="text-2xl">👟</span> Calçados Araújo
            </h1>
          )}
          <button
            onClick={toggleSidebar}
            className={`p-1 rounded-lg hover:bg-blue-700 transition-colors ${
              isSidebarOpen ? 'ml-auto' : 'mx-auto'
            }`}
          >
            {isSidebarOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
          </button>
        </div>
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <a
              href={item.href}
              key={item.id}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-poppins text-sm transition-all duration-200 ${
                activeId === item.id
                  ? 'bg-blue-100 text-blue-700 shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              } ${isSidebarOpen ? '' : 'justify-center'}`}
              title={item.label}
            >
              <span className="text-lg">{item.icon}</span>
              {isSidebarOpen && <span>{item.label}</span>}
            </a>
          ))}
        </nav>
        {isSidebarOpen && (
          <div className="p-4 border-t border-gray-200">
            <p className="text-xs font-poppins text-gray-500">Versão 2.0 | Calçados Araújo</p>
          </div>
        )}
      </aside>

      {/* Overlay para mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
        />
      )}

      {/* Botão de hambúrguer para mobile */}
      {!mobileOpen && (
        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden fixed top-4 left-4 z-50 text-gray-700 bg-white p-2 rounded-lg shadow-md"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}
    </>
  );
}