import { Metadata } from 'next';
import { Suspense } from 'react';
import HomeClient from './HomeClient';
import { fetchProducts } from '@/services/productService';
import { Product } from '@mi-tienda/types';

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

// Esta función genera los metadatos dinámicos para redes sociales
export async function generateMetadata(
  { searchParams }: Props
): Promise<Metadata> {
  // 1. Obtener el ID del producto de la URL
  const resolvedSearchParams = await searchParams;
  const productId = resolvedSearchParams.product;

  // 2. Definir valores por defecto (si no hay producto seleccionado)
  const defaultTitle = "Mi Tienda App - Los mejores productos";
  const defaultDescription = "Explora nuestro catálogo de productos increíbles.";
  // Asegúrate de tener una imagen por defecto en public/images o usa una URL absoluta
  const defaultImage = "/images/og-default.jpg"; 

  // Si no hay ID, devolvemos los datos generales
  if (!productId || Array.isArray(productId)) {
    return {
      title: defaultTitle,
      description: defaultDescription,
      openGraph: {
        images: [defaultImage],
      },
    };
  }

  try {
    // 3. Buscar el producto específico
    // NOTA: Idealmente deberías tener una función fetchProductById(id) para no traer todos
    const products = await fetchProducts(); 
    const product = products.find((p: Product) => p.id.toString() === productId);

    if (!product) {
      return {
        title: defaultTitle,
        description: defaultDescription,
      };
    }

    // 4. Retornar los metadatos del producto específico
    return {
      title: `${product.name} | Mi Tienda`,
      description: product.description || `Compra ${product.name} al mejor precio.`,
      openGraph: {
        title: product.name,
        description: product.description || `Compra ${product.name} al mejor precio.`,
        images: [
          {
            url: product.imageUrl || defaultImage, // La URL de la imagen del producto
            width: 800,
            height: 600,
            alt: product.name,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: product.name,
        description: product.description || `Compra ${product.name} al mejor precio.`,
        images: [product.imageUrl || defaultImage],
      },
    };
  } catch (error) {
    console.error("Error generando metadata:", error);
    return {
      title: defaultTitle,
    };
  }
}

// Este es ahora un Server Component que renderiza tu Client Component
export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
      </div>
    }>
      <HomeClient />
    </Suspense>
  );
}
