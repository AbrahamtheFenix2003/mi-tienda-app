'use client';

import { useState, useMemo } from 'react';
import { Loader2, AlertTriangle, Sparkles, Package, Menu, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchCategories } from '@/services/categoryService';
import { fetchProducts } from '@/services/productService';
import { Product } from '@mi-tienda/types';

import PublicHeader from '@/components/layout/PublicHeader';
import CategorySidebar from '@/components/store/CategorySidebar';
import ContactInfo from '@/components/store/ContactInfo';
import ProductCard from '@/components/store/ProductCard';
import ProductDetailModal from '@/components/store/ProductDetailModal';
import CartDrawer from '@/components/store/CartDrawer';

export default function HomePage() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Fetch categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  // Fetch products
  const { data: products = [], isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  // Filter products by category and search query
  const filteredProducts = useMemo(() => {
    let filtered = products.filter(p => p.isActive && p.stock > 0);

    // Filter by category
    if (selectedCategoryId !== null) {
      filtered = filtered.filter(p => p.categoryId === selectedCategoryId);
    }

    // Filter by search query
    if (searchQuery.trim().length > 0) {
      const searchTerm = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((product) => {
        const matchesName = product.name.toLowerCase().includes(searchTerm);
        const matchesCode = product.code.toLowerCase().includes(searchTerm);
        const matchesCategory = product.category?.name.toLowerCase().includes(searchTerm);
        const matchesTags = product.tags?.some(tag => tag.toLowerCase().includes(searchTerm));
        return matchesName || matchesCode || matchesCategory || matchesTags;
      });
    }

    return filtered;
  }, [products, selectedCategoryId, searchQuery]);

  // Get featured products (only if no filters applied)
  const featuredProducts = useMemo(() => {
    if (selectedCategoryId !== null || searchQuery.trim().length > 0) {
      return [];
    }
    return products.filter(p => p.isActive && p.stock > 0 && p.isFeatured).slice(0, 4);
  }, [products, selectedCategoryId, searchQuery]);

  // Handle product selection
  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCategorySelect = (categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
    setIsSidebarOpen(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const isLoading = categoriesLoading || productsLoading;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Public Header */}
      <PublicHeader
        products={products.filter(p => p.isActive)}
        onProductSelect={handleProductSelect}
        onSearchChange={setSearchQuery}
        onCartClick={() => setIsCartOpen(true)}
      />

      {/* Main Content */}
      <div className="w-full max-w-[2000px] ml-0 mr-auto pl-4 pr-4 sm:pl-6 sm:pr-10 lg:pl-4 lg:pr-12 xl:pr-16 2xl:pr-24 py-8">
        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-12 w-12 text-rose-500 animate-spin" />
          </div>
        )}

        {/* Error State */}
        {!isLoading && productsError && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Error al cargar productos</h3>
            <p className="text-gray-600">
              {productsError instanceof Error ? productsError.message : 'Ocurrió un error inesperado'}
            </p>
          </div>
        )}

        {/* Main Layout: Sidebar + Products */}
        {!isLoading && !productsError && (
          <>
            {/* Mobile Filters Button */}
            <div className="mb-4 flex items-center justify-between lg:hidden">
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-rose-400 hover:text-rose-600"
              >
                <Menu className="h-4 w-4" />
                Categorías
              </button>
              <span className="text-xs text-gray-500">
                {categories.length} {categories.length === 1 ? 'categoría' : 'categorías'}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:[grid-template-columns:320px_minmax(0,1fr)]">
            {/* Sidebar */}
            <aside className="hidden lg:block">
              <div className="lg:sticky lg:top-24 space-y-6">
                <CategorySidebar
                  categories={categories}
                  products={products}
                  selectedCategoryId={selectedCategoryId}
                  onCategorySelect={handleCategorySelect}
                />
                <ContactInfo />
              </div>
            </aside>

            {/* Products Section */}
            <main className="space-y-8">
              {/* Featured Products Section */}
              {featuredProducts.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-6 w-6 text-rose-500" />
                    <h2 className="text-2xl font-bold text-gray-900">Productos Destacados</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 min-[1400px]:grid-cols-5 min-[1800px]:grid-cols-6 gap-4">
                    {featuredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onClick={handleProductSelect}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* All Products Section */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedCategoryId !== null
                      ? categories.find(c => c.id === selectedCategoryId)?.name || 'Productos'
                      : searchQuery.trim().length > 0
                      ? 'Resultados de búsqueda'
                      : 'Todos los Productos'}
                  </h2>
                  <span className="text-sm text-gray-600">
                    {filteredProducts.length} {filteredProducts.length === 1 ? 'producto' : 'productos'}
                  </span>
                </div>

                {/* Products Grid */}
                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 min-[1400px]:grid-cols-5 min-[1800px]:grid-cols-6 gap-4">
                    {filteredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onClick={handleProductSelect}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-lg border border-gray-200">
                    <Package className="h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {searchQuery.trim().length > 0
                        ? 'No se encontraron productos'
                        : 'No hay productos en esta categoría'}
                    </h3>
                    <p className="text-gray-600">
                      {searchQuery.trim().length > 0
                        ? 'Intenta con otro término de búsqueda'
                        : 'Selecciona otra categoría para ver productos'}
                    </p>
                  </div>
                )}
            </section>
          </main>
          </div>
        </>
        )}
      </div>

      {/* Mobile Sidebar Drawer */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 flex justify-start lg:hidden" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-black/40 transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />
          <div className="relative mr-auto flex h-full w-80 max-w-full flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-rose-500">Filtros</p>
                <h3 className="text-base font-semibold text-gray-900">Categorías</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                aria-label="Cerrar filtros"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 space-y-6 overflow-y-auto px-4 py-4">
              <CategorySidebar
                categories={categories}
                products={products}
                selectedCategoryId={selectedCategoryId}
                onCategorySelect={handleCategorySelect}
              />
              <ContactInfo />
            </div>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      <ProductDetailModal
        key={selectedProduct?.id ?? 'empty'}
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </div>
  );
}
