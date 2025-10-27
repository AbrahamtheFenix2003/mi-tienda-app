// components/QueryProvider.tsx

'use client';

import React from 'react';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'; // <-- IMPORTACIÓN CORREGIDA

// Crea una instancia de QueryClient.
// Creamos el cliente aquí (useState) para evitar que se comparta entre usuarios en el servidor.
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false, // Desactivar refetch por defecto
        staleTime: 60 * 1000, // 1 minuto de caché
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Servidor: siempre crear un nuevo cliente
    return makeQueryClient();
  } else {
    // Navegador: usar un cliente singleton
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

interface QueryProviderProps {
  children: React.ReactNode;
}

export default function QueryProvider({ children }: QueryProviderProps) {
  // NOTA: getQueryClient() asegura que solo tengamos una instancia en el navegador.
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}