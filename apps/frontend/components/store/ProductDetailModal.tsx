'use client';

import { useState } from 'react';
import { Product } from '@mi-tienda/types';
import { Modal } from '@/components/ui/Modal';
import { Package, Tag, X, ChevronLeft, ChevronRight, ShoppingCart, Plus, Minus, Check } from 'lucide-react';
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
  const [showAddedMessage, setShowAddedMessage] = useState(false);
  const { addToCart, isInCart, getItemQuantity } = useCart();

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

  const hasStock = product.stock > 0;
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
    setShowAddedMessage(false);
    onClose();
  };

  const handleAddToCart = () => {
    if (hasStock) {
      addToCart(product, quantity);
      setShowAddedMessage(true);
      setTimeout(() => {
        setShowAddedMessage(false);
        setQuantity(1);
      }, 2000);
    }
  };

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const inCart = isInCart(product.id);
  const cartQuantity = getItemQuantity(product.id);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={product.name} size="4xl">
      <div className="relative">

        <div className="grid md:grid-cols-2 gap-6">
          {/* Image Gallery Section */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
              {images.length > 0 ? (
                isLocalUrl(images[currentImageIndex]) ? (
                  <Image
                    src={images[currentImageIndex]}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                ) : (
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
                    {isLocalUrl(image) ? (
                      <Image
                        src={image}
                        alt={`${product.name} - ${index + 1}`}
                        fill
                        sizes="100px"
                        className="object-cover"
                      />
                    ) : (
                      <img
                        src={image}
                        alt={`${product.name} - ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
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
                  S/ {parseFloat(product.price).toFixed(2)}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-xl text-gray-400 line-through">
                      S/ {parseFloat(product.originalPrice!).toFixed(2)}
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

            {/* Quantity Selector and Add to Cart */}
            {hasStock && (
              <div className="space-y-4">
                {/* Quantity Selector */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cantidad
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={decrementQuantity}
                      disabled={quantity <= 1}
                      className="flex items-center justify-center w-10 h-10 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed rounded-lg transition-colors"
                      aria-label="Disminuir cantidad"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={product.stock}
                      value={quantity}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 1;
                        setQuantity(Math.min(Math.max(value, 1), product.stock));
                      }}
                      className="w-20 h-10 text-center border-2 border-gray-300 rounded-lg font-semibold text-lg focus:outline-none focus:border-rose-500"
                    />
                    <button
                      onClick={incrementQuantity}
                      disabled={quantity >= product.stock}
                      className="flex items-center justify-center w-10 h-10 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed rounded-lg transition-colors"
                      aria-label="Aumentar cantidad"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                    <span className="text-sm text-gray-600 ml-2">
                      (Máx: {product.stock})
                    </span>
                  </div>
                  {inCart && (
                    <p className="text-sm text-blue-600 mt-2">
                      Ya tienes {cartQuantity} en tu carrito
                    </p>
                  )}
                </div>

                {/* Add to Cart Button */}
                {showAddedMessage ? (
                  <div className="flex items-center justify-center gap-2 py-4 bg-green-100 text-green-700 rounded-lg font-medium text-lg">
                    <Check className="w-6 h-6" />
                    ¡Agregado al carrito!
                  </div>
                ) : (
                  <button
                    onClick={handleAddToCart}
                    className="w-full flex items-center justify-center gap-3 py-4 bg-rose-600 text-white font-bold text-lg rounded-lg hover:bg-rose-700 transition-colors focus:outline-none focus:ring-4 focus:ring-rose-300"
                  >
                    <ShoppingCart className="w-6 h-6" />
                    Agregar al carrito
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
