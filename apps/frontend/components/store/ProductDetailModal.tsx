'use client';

import { useState } from 'react';
import { Product } from '@mi-tienda/types';
import { Modal } from '@/components/ui/Modal';
import { Package, Tag, ChevronLeft, ChevronRight, Minus, Plus, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import { getAbsoluteImageUrl, isLocalUrl } from '@/lib/imageUtils';
import { useCart } from '@/hooks/useCart';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductDetailModal({ product, isOpen, onClose }: ProductDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addItem, getItemQuantity } = useCart();

  const productId = product?.id ?? null;
  const stockValue = product?.stock ?? 0;
  const hasStock = stockValue > 0;
  const existingQuantity = productId ? getItemQuantity(productId) : 0;
  const remainingStock = Math.max(stockValue - existingQuantity, 0);
  const canAddToCart = Boolean(product) && hasStock && remainingStock > 0;
  const displayQuantity = canAddToCart ? Math.min(Math.max(quantity, 1), remainingStock) : 0;

  if (!product) return null;

  // Collect all available images
  const images = [
    product.imageUrl,
    product.imageUrl2,
    product.imageUrl3,
    product.imageUrl4,
  ]
    .filter((url): url is string => !!url)
    .map(url => getAbsoluteImageUrl(url));

  const hasDiscount = product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleClose = () => {
    setCurrentImageIndex(0);
    setQuantity(1);
    onClose();
  };

  const handleDecrease = () => {
    if (!canAddToCart) return;
    setQuantity((prev) => {
      const current = Math.min(Math.max(prev, 1), remainingStock);
      return Math.max(current - 1, 1);
    });
  };

  const handleIncrease = () => {
    if (!canAddToCart) return;
    setQuantity((prev) => {
      const current = Math.min(Math.max(prev, 1), remainingStock);
      return Math.min(current + 1, remainingStock);
    });
  };

  const handleAddToCart = () => {
    if (!product || !canAddToCart || displayQuantity <= 0) return;
    addItem(product, displayQuantity);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={product.name} size="4xl">
      <div className="relative">

        <div className="grid md:grid-cols-2 gap-6">
          {/* Image Gallery Section */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
              {images.length > 0 && images[currentImageIndex] ? (
                isLocalUrl(images[currentImageIndex]) ? (
                  <Image
                    src={images[currentImageIndex]}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={images[currentImageIndex]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                )
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Package className="h-24 w-24 text-gray-300" />
                </div>
              )}

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5 text-gray-800" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-colors"
                  >
                    <ChevronRight className="h-5 w-5 text-gray-800" />
                  </button>
                </>
              )}

              {/* Image Counter */}
              {images.length > 1 && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {images.length}
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      currentImageIndex === index
                        ? 'border-rose-500 ring-2 ring-rose-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {image && isLocalUrl(image) ? (
                      <Image
                        src={image}
                        alt={`${product.name} - ${index + 1}`}
                        fill
                        sizes="100px"
                        className="object-cover"
                      />
                    ) : image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={image}
                        alt={`${product.name} - ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gray-100">
                        <Package className="h-4 w-4 text-gray-300" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information Section */}
          <div className="space-y-6">
            {/* Category */}
            {product.category && (
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Tag className="h-4 w-4" />
                <span>{product.category.name}</span>
              </div>
            )}

            {/* Product Name */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{product.name}</h2>
              <p className="text-sm text-gray-500 mt-1">Código: {product.code}</p>
            </div>

            {/* Price */}
            <div className="border-t border-b border-gray-200 py-4">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-rose-600">
                  S/. {parseFloat(product.price).toFixed(2)}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-xl text-gray-400 line-through">
                      S/. {parseFloat(product.originalPrice!).toFixed(2)}
                    </span>
                    <span className="bg-green-500 text-white text-sm font-semibold px-2 py-1 rounded">
                      {Math.round((1 - parseFloat(product.price) / parseFloat(product.originalPrice!)) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Stock Status */}
            <div>
              {hasStock ? (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-green-700 font-semibold">
                    En stock ({product.stock} disponibles)
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-red-700 font-semibold">Sin stock</span>
                </div>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Descripción</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Etiquetas</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Featured Badge */}
            {product.isFeatured && (
              <div className="bg-rose-50 border border-rose-200 rounded-lg p-3">
                <p className="text-rose-700 font-semibold text-center">
                  ⭐ Producto Destacado
                </p>
              </div>
            )}

            {/* Add to Cart Section */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-rose-500" />
                <h3 className="font-semibold text-gray-900">Añadir a la cesta</h3>
              </div>

              {canAddToCart ? (
                <div className="mt-3 space-y-4">
                  <p className="text-sm text-gray-600">
                    Puedes añadir hasta {remainingStock} unidades
                    {existingQuantity > 0 && ` (ya tienes ${existingQuantity} en tu cesta)`}.
                  </p>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="inline-flex items-center rounded-full border border-gray-300 bg-white">
                      <button
                        type="button"
                        onClick={handleDecrease}
                        disabled={displayQuantity <= 1}
                        className="flex h-10 w-10 items-center justify-center text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700 disabled:cursor-not-allowed disabled:text-gray-300"
                        aria-label="Disminuir cantidad"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="min-w-10 text-center text-base font-semibold text-gray-900">
                        {displayQuantity}
                      </span>
                      <button
                        type="button"
                        onClick={handleIncrease}
                        disabled={displayQuantity >= remainingStock}
                        className="flex h-10 w-10 items-center justify-center text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700 disabled:cursor-not-allowed disabled:text-gray-300"
                        aria-label="Incrementar cantidad"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddToCart}
                      className="flex flex-1 items-center justify-center gap-2 rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      <span>Agregar a la cesta</span>
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-sm font-medium text-red-600">
                  {!hasStock
                    ? 'Por el momento no contamos con stock'
                    : 'Ya agregaste todas las unidades disponibles para este producto.'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
