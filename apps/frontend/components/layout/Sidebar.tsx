// components/layout/Sidebar.tsx

'use client';

import React from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Package,
  Building2,      // Icono para "Proveedores"
  ShoppingCart,   // Icono para "Punto de ventas"
  AreaChart,      // Icono para "Reportes"
  // Calculator,   // Icono para "Rentabilidad" - Oculto temporalmente
  Warehouse,      // Icono para "Almacen"
  Truck,          // Icono para "Compras"
  Wallet,         // Icono para "Caja"
  Home,           // Icono para "Ver Tienda"
  FolderOpen,     // Icono para "Categorias"
} from 'lucide-react';
import Link from 'next/link'; // Usamos el Link de Next.js
import { usePathname } from 'next/navigation'; // Hook para saber la ruta activa
import { useAuth } from '@/hooks/useAuth';
import { Role } from '@mi-tienda/types';

// 1. Definimos los items de navegación con roles permitidos
interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  requiredRoles?: Role[];
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }, // Visible para todos
  { href: '/productos', label: 'Productos', icon: Package, requiredRoles: ['SUPER_ADMIN'] },
  { href: '/categorias', label: 'Categorias', icon: FolderOpen, requiredRoles: ['SUPER_ADMIN'] },
  { href: '/proveedores', label: 'Proveedores', icon: Building2, requiredRoles: ['SUPER_ADMIN', 'SUPER_VENDEDOR'] },
  { href: '/punto-de-ventas', label: 'Punto de ventas', icon: ShoppingCart }, // Visible para todos
  { href: '/reportes', label: 'Reportes', icon: AreaChart, requiredRoles: ['SUPER_ADMIN', 'SUPER_VENDEDOR'] },
  // { href: '/rentabilidad', label: 'Analisis de rentabilidad', icon: Calculator }, // Oculto temporalmente
  { href: '/almacen', label: 'Almacen', icon: Warehouse, requiredRoles: ['SUPER_ADMIN', 'SUPER_VENDEDOR'] },
  { href: '/compras', label: 'Compras', icon: Truck, requiredRoles: ['SUPER_ADMIN', 'SUPER_VENDEDOR'] },
  { href: '/caja', label: 'Caja', icon: Wallet, requiredRoles: ['SUPER_ADMIN', 'SUPER_VENDEDOR'] },
];

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  // 2. Hook para saber qué ruta está activa
  const pathname = usePathname();
  const { user } = useAuth();
  const previousPathRef = React.useRef(pathname);

  React.useEffect(() => {
    if (previousPathRef.current !== pathname && isOpen) {
      onClose();
    }
    previousPathRef.current = pathname;
  }, [pathname, isOpen, onClose]);

  // 3. Filtrar items según el rol del usuario
  const visibleItems = navItems.filter(item => {
    // Si el item no tiene requiredRoles, es visible para todos
    if (!item.requiredRoles) return true;
    // Si el usuario no existe, no mostrar
    if (!user) return false;
    // Mostrar si el rol del usuario está en requiredRoles
    return item.requiredRoles.includes(user.role);
  });

  const handleNavClick = () => {
    if (isOpen) {
      onClose();
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-black/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-64 bg-gray-900 text-white shadow-2xl transition-transform duration-300 ease-in-out lg:border-r lg:border-gray-800 lg:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex h-full flex-col overflow-y-auto px-3 py-4">
          
          {/* Logo o Título */}
          <Link href="/dashboard" className="mb-5 flex items-center space-x-3 px-2 rtl:space-x-reverse" onClick={handleNavClick}>
            <Package className="h-8 w-8 text-rose-500" />
            <span className="self-center whitespace-nowrap text-2xl font-semibold">
              Mi Panel
            </span>
          </Link>

          {/* 4. Lista de Navegación (mapeada con filtrado por rol) */}
          <ul className="space-y-2 font-medium">
            {visibleItems.map((item) => {
              // Comprobamos si la ruta actual es la del item
              const isActive = pathname === item.href;

              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    onClick={handleNavClick}
                    className={`
                      group flex items-center rounded-lg p-2
                      ${isActive
                        ? 'bg-rose-600 text-white' // Estilo activo
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white' // Estilo normal
                      }
                    `}
                  >
                    <item.icon className={`
                      h-5 w-5 transition duration-75
                      ${isActive
                        ? 'text-white' // Icono activo
                        : 'text-gray-400 group-hover:text-white' // Icono normal
                      }
                    `} />
                    <span className="ms-3">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

           {/* Link de regreso a la tienda */}
           <div className="mt-auto border-t border-gray-700 pt-4">
              <Link
                href="/"
                onClick={handleNavClick}
                className="group flex items-center rounded-lg p-2 text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                <Home className="h-5 w-5 text-gray-400 transition duration-75 group-hover:text-white" />
                <span className="ms-3">Ver Tienda</span>
              </Link>
           </div>
        </div>
      </aside>
    </>
  );
};
