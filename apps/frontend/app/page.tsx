'use client';

import { useState, useMemo } from 'react';
import { Loader2, AlertTriangle, Sparkles, Package } from 'lucide-react';
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
    let filtered = products.filter(p => p.isActive);

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
    return products.filter(p => p.isActive && p.isFeatured).slice(0, 4);
  }, [products, selectedCategoryId, searchQuery]);

  // Handle product selection
  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
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
  <div className="max-w-7xl mr-auto px-4 sm:px-6 lg:pl-4 lg:pr-8 py-8">
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
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="lg:sticky lg:top-24 space-y-6">
                <CategorySidebar
                  categories={categories}
                  products={products}
                  selectedCategoryId={selectedCategoryId}
                  onCategorySelect={setSelectedCategoryId}
                />
                <ContactInfo />
              </div>
            </aside>

            {/* Products Section */}
            <main className="lg:col-span-3 space-y-8">
              {/* Featured Products Section */}
              {featuredProducts.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-6 w-6 text-rose-500" />
                    <h2 className="text-2xl font-bold text-gray-900">Productos Destacados</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
        )}
      </div>

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
