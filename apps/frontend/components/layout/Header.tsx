 // components/layout/Header.tsx

'use client';

import { UserCircle, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth'; // <-- 1. Importar el hook

export const Header = () => {
  // 2. Usar el hook
  const { user, logout, isLoading } = useAuth();

  // No mostrar nada si está cargando o no hay usuario (aunque el layout ya protege)
  if (isLoading || !user) {
    return (
      <header className="fixed top-0 left-0 z-30 w-full bg-white shadow-sm pl-64 h-16" />
    );
  }

  return (
    <header className="fixed top-0 left-0 z-30 w-full bg-white shadow-sm pl-64">
      <div className="flex h-16 items-center justify-end px-6">
        
        {/* 3. Menú de Usuario (con datos reales) */}
        <div className="flex items-center space-x-3">
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