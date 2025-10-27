'use client'; // Este layout se ejecuta en el cliente para poder usar hooks

import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 const { isAuthenticated, isLoading } = useAuth();
 const router = useRouter();

 // Añadimos un efecto para realizar la redirección fuera del render
 React.useEffect(() => {
   // Log para diagnóstico
   console.log('[AdminLayout] isLoading=', isLoading, 'isAuthenticated=', isAuthenticated);
   if (!isLoading && !isAuthenticated) {
     // replace evita añadir historial innecesario y prevenir actualizaciones durante render
     router.replace('/login');
   }
 }, [isLoading, isAuthenticated, router]);

 // Mostrar spinner mientras verificamos la sesión o mientras preparamos la redirección
 if (isLoading || !isAuthenticated) {
   return (
     <div className="flex min-h-screen items-center justify-center bg-gray-100">
       <Loader2 className="h-12 w-12 animate-spin text-rose-500" />
     </div>
   );
 }

 // Usuario autenticado: mostrar layout normal
 return (
   <div className="min-h-screen bg-gray-100">
     <Sidebar />
     <div className="flex flex-col">
       <Header />
       <main className="ml-64 mt-16 p-6 md:p-8">{children}</main>
     </div>
   </div>
 );
}