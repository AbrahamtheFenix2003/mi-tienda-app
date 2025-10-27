// components/layout/Sidebar.tsx

'use client';

import {
  LayoutDashboard,
  Package,
  ShoppingCart, // Icono para "Punto de ventas"
  BarChart,       // Icono para "Reportes"
  Calculator,     // Icono para "Rentabilidad"
  Warehouse,      // Icono para "Almacen"
  Truck,          // Icono para "Compras"
  Wallet,         // Icono para "Caja"
  Home,           // Icono para "Ver Tienda"
} from 'lucide-react';
import Link from 'next/link'; // Usamos el Link de Next.js
import { usePathname } from 'next/navigation'; // Hook para saber la ruta activa

// 1. Definimos los items de navegación (tu lista)
const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/productos', label: 'Productos', icon: Package },
  { href: '/punto-de-ventas', label: 'Punto de ventas', icon: ShoppingCart },
  { href: '/reportes', label: 'Reportes', icon: BarChart },
  { href: '/rentabilidad', label: 'Analisis de rentabilidad', icon: Calculator },
  { href: '/almacen', label: 'Almacen', icon: Warehouse },
  { href: '/compras', label: 'Compras', icon: Truck },
  { href: '/caja', label: 'Caja', icon: Wallet },
];

export const Sidebar = () => {
  // 2. Hook para saber qué ruta está activa
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-gray-900 text-white transition-transform">
      <div className="flex h-full flex-col overflow-y-auto px-3 py-4">
        
        {/* Logo o Título */}
        <Link href="/dashboard" className="mb-5 flex items-center space-x-3 rtl:space-x-reverse px-2">
          <Package className="h-8 w-8 text-rose-500" />
          <span className="self-center whitespace-nowrap text-2xl font-semibold">
            Mi Panel
          </span>
        </Link>

        {/* 3. Lista de Navegación (mapeada) */}
        <ul className="space-y-2 font-medium">
          {navItems.map((item) => {
            // Comprobamos si la ruta actual es la del item
            const isActive = pathname === item.href;
            
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
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
         <div className="mt-auto pt-4 border-t border-gray-700">
            <Link
              href="/"
              className="group flex items-center rounded-lg p-2 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <Home className="h-5 w-5 text-gray-400 transition duration-75 group-hover:text-white" />
              <span className="ms-3">Ver Tienda</span>
            </Link>
         </div>
      </div>
    </aside>
  );
};