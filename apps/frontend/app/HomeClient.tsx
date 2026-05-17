'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, AlertTriangle, Sparkles, Package, Menu, X, Home, Search, ShoppingCart } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { fetchCategories } from '@/services/categoryService';
import { fetchProducts } from '@/services/productService';
import { Product } from '@mi-tienda/types';

import PublicHeader from '@/components/layout/PublicHeader';
import CategorySidebar from '@/components/store/CategorySidebar';
import ContactInfo from '@/components/store/ContactInfo';
import ProductGrid from '@/components/store/ProductGrid';
import ProductDetailModal from '@/components/store/ProductDetailModal';
import CartDrawer from '@/components/store/CartDrawer';
import { useCart } from '@/hooks/useCart';

const parseProductIdParam = (value: string | null): number | null => {
  if (!value || !/^\d+$/.test(value)) return null;

  const productId = Number(value);
  return Number.isSafeInteger(productId) && productId > 0 ? productId : null;
};

const FOCUSABLE_DRAWER_ELEMENTS = [
  'a[href]',
  'button:not([disabled])',
  'summary',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'audio[controls]',
  'video[controls]',
  '[contenteditable="true"]',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

const MOBILE_FILTERS_DRAWER_ID = 'mobile-filters-drawer';
const MOBILE_FILTERS_TITLE_ID = 'mobile-filters-title';

const isVisibleElement = (element: HTMLElement) => (
  element.isConnected && element.getClientRects().length > 0
);

const getErrorMessage = (error: unknown): string | undefined => {
  if (!error) return undefined;
  return error instanceof Error ? error.message : 'Ocurrió un error inesperado';
};

const buildRouteWithSearchParams = (pathname: string, params: URLSearchParams) => {
  const queryString = params.toString();
  return queryString ? `${pathname}?${queryString}` : pathname;
};

export default function HomeClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  // selectedProduct and isModalOpen are derived from the URL (?product=ID)
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const mobileDrawerRef = useRef<HTMLDivElement | null>(null);
  const mobileDrawerCloseButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusedElementRef = useRef<HTMLElement | null>(null);
  const focusRestoreFrameRef = useRef<number | null>(null);
  const { totalItems } = useCart();

  // Fetch categories
  const { data: categories = [], isLoading: categoriesLoading, error: categoriesError } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  // Fetch products
  const { data: products = [], isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  // Derivar producto seleccionado e estado del modal desde la URL (evita setState en effect)
  const productIdParam = searchParams.get('product');
  const productId = parseProductIdParam(productIdParam);
  const selectedProduct = useMemo(() => {
    if (productId === null) return null;
    return products.find(p => p.id === productId) ?? null;
  }, [products, productId]);
  const isModalOpen = selectedProduct !== null;

  const activeProducts = useMemo(
    () => products.filter(p => p.isActive),
    [products]
  );

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
  const handleProductSelect = useCallback((product: Product) => {
    // Solo actualizamos la URL; el modal se abrirá porque selectedProduct se deriva desde la URL
    const params = new URLSearchParams(searchParams.toString());
    params.set('product', product.id.toString());
    router.push(buildRouteWithSearchParams(pathname, params), { scroll: false });
  }, [pathname, router, searchParams]);

  const handleScrollToTop = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const handleSidebarOpen = useCallback(() => {
    if (focusRestoreFrameRef.current !== null) {
      window.cancelAnimationFrame(focusRestoreFrameRef.current);
      focusRestoreFrameRef.current = null;
    }

    previousFocusedElementRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;

    setIsCartOpen(false);

    if (isModalOpen) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('product');
      router.push(buildRouteWithSearchParams(pathname, params), { scroll: false });
    }

    setIsSidebarOpen(true);
  }, [isModalOpen, pathname, router, searchParams]);

  const handleSidebarClose = useCallback(() => {
    setIsSidebarOpen(false);

    if (focusRestoreFrameRef.current !== null) {
      window.cancelAnimationFrame(focusRestoreFrameRef.current);
    }

    focusRestoreFrameRef.current = window.requestAnimationFrame(() => {
      const previousFocusedElement = previousFocusedElementRef.current;

      if (previousFocusedElement && isVisibleElement(previousFocusedElement)) {
        previousFocusedElement.focus();
      }

      previousFocusedElementRef.current = null;
      focusRestoreFrameRef.current = null;
    });
  }, []);

  const handleCategorySelect = useCallback((categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
    handleSidebarClose();
  }, [handleSidebarClose]);

  const handleCloseModal = useCallback(() => {
    // Eliminamos el param de la URL; la derivación cerrará el modal
    const params = new URLSearchParams(searchParams.toString());
    params.delete('product');
    router.push(buildRouteWithSearchParams(pathname, params), { scroll: false });
  }, [pathname, router, searchParams]);

  const handleCartOpen = useCallback(() => {
    setIsCartOpen(true);
  }, []);

  const handleCartClose = useCallback(() => {
    setIsCartOpen(false);
  }, []);

  const isLoading = categoriesLoading || productsLoading;
  const categoriesErrorMessage = getErrorMessage(categoriesError);
  const productsErrorMessage = getErrorMessage(productsError);

  useEffect(() => {
    if (!isSidebarOpen) return;

    const originalBodyOverflow = document.body.style.overflow;
    const desktopMediaQuery = window.matchMedia('(min-width: 1024px)');

    document.body.style.overflow = 'hidden';
    mobileDrawerCloseButtonRef.current?.focus();

    const handleDesktopBreakpoint = (event: MediaQueryListEvent) => {
      if (event.matches) {
        handleSidebarClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        handleSidebarClose();
        return;
      }

      if (event.key !== 'Tab' || !mobileDrawerRef.current) return;

      const focusableElements = Array.from(
        mobileDrawerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_DRAWER_ELEMENTS)
      ).filter(element => !element.hasAttribute('disabled') && isVisibleElement(element));

      if (focusableElements.length === 0) {
        event.preventDefault();
        mobileDrawerRef.current.focus();
        return;
      }

      const firstFocusableElement = focusableElements[0];
      const lastFocusableElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (
        activeElement === mobileDrawerRef.current ||
        !(activeElement instanceof HTMLElement) ||
        !mobileDrawerRef.current.contains(activeElement)
      ) {
        event.preventDefault();
        const nextFocusableElement = event.shiftKey ? lastFocusableElement : firstFocusableElement;
        nextFocusableElement.focus();
        return;
      }

      if (event.shiftKey && activeElement === firstFocusableElement) {
        event.preventDefault();
        lastFocusableElement.focus();
        return;
      }

      if (!event.shiftKey && activeElement === lastFocusableElement) {
        event.preventDefault();
        firstFocusableElement.focus();
      }
    };

    desktopMediaQuery.addEventListener('change', handleDesktopBreakpoint);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      desktopMediaQuery.removeEventListener('change', handleDesktopBreakpoint);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleSidebarClose, isSidebarOpen]);

  useEffect(() => {
    return () => {
      if (focusRestoreFrameRef.current !== null) {
        window.cancelAnimationFrame(focusRestoreFrameRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Public Header */}
      <PublicHeader
        products={activeProducts}
        onProductSelect={handleProductSelect}
        onSearchChange={setSearchQuery}
        onCartClick={handleCartOpen}
      />

      {/* Main Content */}
      <div className="w-full max-w-[2000px] ml-0 mr-auto pl-4 pr-4 sm:pl-6 sm:pr-10 lg:pl-4 lg:pr-12 xl:pr-16 2xl:pr-24 py-8 pb-28 lg:pb-8">
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
              {productsErrorMessage}
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
                onClick={handleSidebarOpen}
                aria-controls={MOBILE_FILTERS_DRAWER_ID}
                aria-expanded={isSidebarOpen}
                aria-haspopup="dialog"
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-rose-400 hover:text-rose-600"
              >
                <Menu className="h-4 w-4" />
                Categorías
              </button>
              <span className="text-xs text-gray-500">
                {categoriesError
                  ? 'Error al cargar categorías'
                  : `${categories.length} ${categories.length === 1 ? 'categoría' : 'categorías'}`}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
            {/* Sidebar */}
            <aside className="hidden lg:block">
              <div className="lg:sticky lg:top-24">
                <div className="space-y-6 max-h-[calc(100vh-6rem)] overflow-y-auto pr-1">
                  <CategorySidebar
                    categories={categories}
                    products={products}
                    selectedCategoryId={selectedCategoryId}
                    onCategorySelect={handleCategorySelect}
                    errorMessage={categoriesErrorMessage}
                  />
                  <ContactInfo />
                </div>
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
                  <ProductGrid products={featuredProducts} onProductSelect={handleProductSelect} />
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
                  <ProductGrid products={filteredProducts} onProductSelect={handleProductSelect} />
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
        <div
          id={MOBILE_FILTERS_DRAWER_ID}
          className="fixed inset-0 z-40 flex justify-start lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby={MOBILE_FILTERS_TITLE_ID}
        >
          <div
            className="fixed inset-0 bg-black/40 transition-opacity"
            onClick={handleSidebarClose}
            aria-hidden="true"
          />
          <div
            ref={mobileDrawerRef}
            className="relative mr-auto flex h-full w-64 max-w-full flex-col bg-white shadow-2xl"
            tabIndex={-1}
          >
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-rose-500">Filtros</p>
                <h3 id={MOBILE_FILTERS_TITLE_ID} className="text-base font-semibold text-gray-900">Categorías</h3>
              </div>
              <button
                ref={mobileDrawerCloseButtonRef}
                type="button"
                onClick={handleSidebarClose}
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
                errorMessage={categoriesErrorMessage}
              />
              <ContactInfo />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden">
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white shadow-[0px_-4px_25px_rgba(15,23,42,0.1)]">
          <div className="max-w-[2000px] mx-auto flex items-center justify-between px-6 py-3 text-xs font-semibold text-gray-600">
            <button
              type="button"
              onClick={handleScrollToTop}
              className="flex flex-col items-center gap-1 text-gray-600 transition hover:text-rose-600"
            >
              <Home className="h-5 w-5" />
              Inicio
            </button>
            <button
              type="button"
              onClick={handleSidebarOpen}
              aria-controls={MOBILE_FILTERS_DRAWER_ID}
              aria-expanded={isSidebarOpen}
              aria-haspopup="dialog"
              className="flex flex-col items-center gap-1 text-gray-600 transition hover:text-rose-600"
            >
              <Search className="h-5 w-5" />
              Categorías
            </button>
            <button
              type="button"
              onClick={handleCartOpen}
              className="relative flex flex-col items-center gap-1 text-gray-600 transition hover:text-rose-600"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 right-0 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
              Carrito
            </button>
          </div>
        </div>
        <div className="h-20" aria-hidden="true" />
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
        onClose={handleCartClose}
      />
    </div>
  );
}
