'use client';

import type { Product } from '@mi-tienda/types';

import ProductCard from '@/components/store/ProductCard';

interface ProductGridProps {
  products: Product[];
  onProductSelect: (product: Product) => void;
}

export default function ProductGrid({ products, onProductSelect }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 min-[1400px]:grid-cols-5 min-[1800px]:grid-cols-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onClick={onProductSelect}
        />
      ))}
    </div>
  );
}
