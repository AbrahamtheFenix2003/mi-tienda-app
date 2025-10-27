'use client';

import { Home, List, Loader2, AlertTriangle } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { fetchCategories } from '@/services/categoryService';

export default function HomePage() {
  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  return (
    <main className="flex min-h-screen flex-col items-center p-8 md:p-12 lg:p-24 bg-gray-50">
      {/* Encabezado */}
      <div className="flex flex-col items-center gap-2 mb-12">
        <Home className="h-10 w-10 text-rose-500" />
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
          Tienda Pública
        </h1>
        <p className="text-base md:text-lg text-gray-600">
          Frontend listo para conectar a la API
        </p>
      </div>

      {/* Sección de Categorías */}
      <div className="w-full max-w-2xl bg-white p-6 rounded-lg shadow border">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
          <List className="h-5 w-5 mr-2 text-blue-500" />
          Categorías desde la API:
        </h2>

        {isLoading && (
          <div className="flex justify-center items-center py-4 text-gray-500">
            <Loader2 className="h-6 w-6 mr-2 animate-spin" />
            Cargando categorías...
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center text-center py-4 text-red-600 bg-red-50 border border-red-200 rounded">
            <AlertTriangle className="h-8 w-8 mb-2" />
            <span className="font-semibold">Error al cargar categorías</span>
            <span className="text-sm">{error instanceof Error ? error.message : String(error)}</span>
          </div>
        )}

        {!isLoading && !error && categories && categories.length > 0 && (
          <ul className="space-y-2 list-disc list-inside">
            {categories.map((category) => (
              <li key={category.id} className="text-gray-700">
                {category.name} <span className="text-xs text-gray-400">(ID: {category.id})</span>
              </li>
            ))}
          </ul>
        )}

        {!isLoading && !error && categories && categories.length === 0 && (
          <p className="text-center text-gray-500 py-4">No hay categorías registradas en la API.</p>
        )}
      </div>
    </main>
  );
}
