import type { Metadata } from "next";
// Importamos los estilos globales de Tailwind CSS
import "./globals.css";
import QueryProvider from "@/components/QueryProvider";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/contexts/CartContext";

// Definición de metadatos (tipado estricto)
export const metadata: Metadata = {
  title: "Mi Tienda E-commerce - Next.js",
  description: "Frontend para la gestión de productos y ventas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      {/* El body estará limpio, listo para usar las clases de Tailwind */}
      <body className="min-h-screen antialiased">
        {/* 2. Envuelve toda la aplicación con el proveedor */}
        <AuthProvider>
          <CartProvider>
            <QueryProvider>
              {children}
            </QueryProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
