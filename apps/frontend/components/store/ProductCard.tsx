'use client';

import type { MouseEvent } from 'react';
import { Product } from '@mi-tienda/types';
import { Package, ShoppingCart, Tag, Plus, Minus, X } from 'lucide-react';
import Image from 'next/image';
import { getAbsoluteImageUrl, isLocalUrl } from '@/lib/imageUtils';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/useToast';

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  const imageUrl = product.imageUrl ? getAbsoluteImageUrl(product.imageUrl) : null;
  const hasStock = product.stock > 0;
  const hasDiscount = product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price);
  const { addItem, getItemQuantity, updateQuantity, removeItem } = useCart();
  const { addToast } = useToast();
  const existingQuantity = getItemQuantity(product.id);
  const remainingStock = Math.max(product.stock - existingQuantity, 0);
  const canAddToCart = hasStock && remainingStock > 0;
  const isInCart = existingQuantity > 0;

  const handleAddToCart = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (!canAddToCart) return;
    addItem(product, 1);
    addToast(`Se añadió 1 unidad de ${product.name} al carrito`, 'success');
  };

  const handleIncreaseQuantity = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (!canAddToCart) return;
    updateQuantity(product.id, existingQuantity + 1);
    addToast(`Se actualizó la cantidad de ${product.name} a ${existingQuantity + 1}`, 'success');
  };

  const handleDecreaseQuantity = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (existingQuantity <= 1) {
      removeItem(product.id);
      addToast(`Se eliminó ${product.name} del carrito`, 'success');
    } else {
      updateQuantity(product.id, existingQuantity - 1);
      addToast(`Se actualizó la cantidad de ${product.name} a ${existingQuantity - 1}`, 'success');
    }
  };

  const handleRemoveFromCart = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    removeItem(product.id);
    addToast(`Se eliminó ${product.name} del carrito`, 'success');
  };

  return (
    <div
      onClick={() => onClick(product)}
      className="group cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:border-rose-300 hover:shadow-md"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {imageUrl && isLocalUrl(imageUrl) ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-200 group-hover:scale-105"
          />
        ) : imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Package className="h-16 w-16 text-gray-300" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {product.isFeatured && (
            <span className="rounded bg-rose-500 px-2 py-1 text-xs font-semibold text-white shadow-sm">
              Destacado
            </span>
          )}
          {hasDiscount && (
            <span className="rounded bg-green-500 px-2 py-1 text-xs font-semibold text-white shadow-sm">
              Oferta
            </span>
          )}
        </div>

        {/* Stock Badge */}
        <div className="absolute right-2 top-2">
          {!hasStock && (
            <span className="rounded bg-gray-800 px-2 py-1 text-xs font-semibold text-white shadow-sm">
              Agotado
            </span>
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Category */}
        {product.category && (
          <div className="mb-1 flex items-center gap-1 text-xs text-gray-500">
            <Tag className="h-3 w-3" />
            <span>{product.category.name}</span>
          </div>
        )}

        {/* Product Name */}
        <h3 className="mb-2 min-h-10 font-semibold text-gray-900 transition-colors line-clamp-2 group-hover:text-rose-600">
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold text-rose-600">
            S/. {parseFloat(product.price).toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-gray-400 line-through">
              S/. {parseFloat(product.originalPrice!).toFixed(2)}
            </span>
          )}
        </div>

        {/* Stock Info */}
        {hasStock ? (
          <div className="mt-1 space-y-1 text-xs">
            <p className="text-green-600">{product.stock} disponibles</p>
            {existingQuantity > 0 && (
              <p className="text-gray-500">
                En tu cesta: {existingQuantity}
                {remainingStock <= 0 && ' (límite alcanzado)'}
              </p>
            )}
          </div>
        ) : (
          <p className="mt-1 text-xs font-medium text-red-600">Sin stock</p>
        )}

        <div className="mt-4">
          {isInCart ? (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center rounded-full border border-gray-300">
                <button
                  type="button"
                  onClick={handleDecreaseQuantity}
                  className="flex h-8 w-8 items-center justify-center rounded-l-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:text-gray-300"
                  disabled={existingQuantity <= 0}
                  aria-label="Disminuir cantidad"
                >
                  {existingQuantity <= 1 ? (
                    <X className="h-4 w-4" />
                  ) : (
                    <Minus className="h-4 w-4" />
                  )}
                </button>
                <span className="min-w-8 text-center text-sm font-semibold text-gray-900">
                  {existingQuantity}
                </span>
                <button
                  type="button"
                  onClick={handleIncreaseQuantity}
                  className="flex h-8 w-8 items-center justify-center rounded-r-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:text-gray-300"
                  disabled={!canAddToCart}
                  aria-label="Incrementar cantidad"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <button
                type="button"
                onClick={handleRemoveFromCart}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white transition-colors hover:bg-red-600"
                aria-label="Eliminar del carrito"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!canAddToCart}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-rose-500 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-600 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>{canAddToCart ? 'Añadir a la cesta' : 'Sin disponibilidad'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
