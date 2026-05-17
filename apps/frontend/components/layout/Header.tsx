 // components/layout/Header.tsx

'use client';

import { UserCircle, LogOut, Menu } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth'; // <-- 1. Importar el hook

type HeaderProps = {
  onToggleSidebar: () => void;
};

export const Header = ({ onToggleSidebar }: HeaderProps) => {
  // 2. Usar el hook
  const { user, logout, isLoading } = useAuth();

  // No mostrar nada si está cargando o no hay usuario (aunque el layout ya protege)
  if (isLoading || !user) {
    return (
      <header className="fixed top-0 left-0 z-30 h-16 w-full bg-white shadow-sm lg:pl-64">
        <div className="flex h-full items-center px-4 sm:px-6">
          <button
            type="button"
            aria-label="Abrir menú"
            className="inline-flex items-center justify-center rounded-md border border-gray-200 bg-white p-2 text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-rose-500 lg:hidden"
            onClick={onToggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 left-0 z-30 w-full bg-white shadow-sm lg:pl-64">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
        <button
          type="button"
          aria-label="Abrir menú"
          className="inline-flex items-center justify-center rounded-md border border-gray-200 bg-white p-2 text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-rose-500 lg:hidden"
          onClick={onToggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* 3. Menú de Usuario (con datos reales) */}
        <div className="ml-auto flex items-center space-x-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-800">
              {user.name || 'Usuario'}
            </p>
            <p className="text-xs text-gray-500">
              {user.email}
            </p>
          </div>
          <UserCircle className="h-9 w-9 text-gray-400" />
          
          {/* 4. Botón de Logout funcional */}
          <button
            onClick={logout} // <-- Conectar la función de logout
            title="Cerrar Sesión"
            className="rounded-full p-1.5 text-gray-600 hover:bg-gray-100 hover:text-red-500"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
