'use client';

import { Product } from '@mi-tienda/types';
import { Package, Tag } from 'lucide-react';
import Image from 'next/image';
import { getAbsoluteImageUrl, isLocalUrl } from '@/lib/imageUtils';

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  const imageUrl = product.imageUrl ? getAbsoluteImageUrl(product.imageUrl) : null;
  const hasStock = product.stock > 0;
  const hasDiscount = product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price);

  return (
    <div
      onClick={() => onClick(product)}
      className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden border border-gray-200 hover:border-rose-300"
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        {imageUrl && isLocalUrl(imageUrl) ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Package className="h-16 w-16 text-gray-300" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isFeatured && (
            <span className="bg-rose-500 text-white text-xs font-semibold px-2 py-1 rounded shadow-sm">
              Destacado
            </span>
          )}
          {hasDiscount && (
            <span className="bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded shadow-sm">
              Oferta
            </span>
          )}
        </div>

        {/* Stock Badge */}
        <div className="absolute top-2 right-2">
          {!hasStock && (
            <span className="bg-gray-800 text-white text-xs font-semibold px-2 py-1 rounded shadow-sm">
              Agotado
            </span>
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Category */}
        {product.category && (
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
            <Tag className="h-3 w-3" />
            <span>{product.category.name}</span>
          </div>
        )}

        {/* Product Name */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem] group-hover:text-rose-600 transition-colors">
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold text-rose-600">
            ${parseFloat(product.price).toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-gray-400 line-through">
              ${parseFloat(product.originalPrice!).toFixed(2)}
            </span>
          )}
        </div>

        {/* Stock Info */}
        {hasStock && (
          <p className="text-xs text-green-600 mt-1">
            {product.stock} disponibles
          </p>
        )}
      </div>
    </div>
  );
}
