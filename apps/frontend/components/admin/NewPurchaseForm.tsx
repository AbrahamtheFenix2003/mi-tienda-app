// components/admin/NewPurchaseForm.tsx

'use client';

import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { PurchaseFormData, Product, Supplier } from '@mi-tienda/types';
import { ProductSearch } from './ProductSearch';
import { ShoppingCart } from './ShoppingCart';
import { Plus, ShoppingCart as CartIcon } from 'lucide-react';

interface CartItem {
  productId: number;
  productName: string;
  productCode?: string | null;
  quantity: number;
  purchasePrice: number;
  subtotal: number;
}

interface NewPurchaseFormProps {
  form: UseFormReturn<PurchaseFormData>;
  onSubmit: (data: PurchaseFormData) => void | Promise<void>;
  isLoading: boolean;
  suppliers: Supplier[];
  products: Product[];
}

const getFieldClasses = (hasError?: boolean, extra?: string) => {
  const base = `mt-1 sm:text-sm ${
    hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''
  }`.trim();
  return extra ? `${base} ${extra}` : base;
};

export const NewPurchaseForm: React.FC<NewPurchaseFormProps> = ({
  form,
  onSubmit,
  isLoading,
  suppliers,
  products,
}) => {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = form;

  // Estado para la cesta de compras
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Estado para el producto seleccionado en búsqueda
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Estado para formulario de agregar producto
  const [quantity, setQuantity] = useState(1);
  const [purchasePrice, setPurchasePrice] = useState('');

  // Prevenir envío del formulario con Enter en inputs específicos
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  // Agregar producto a la cesta
  const addToCart = () => {
    if (!selectedProduct) return;
    
    const price = parseFloat(purchasePrice);
    if (price <= 0) return;

    const newItem: CartItem = {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      productCode: selectedProduct.code,
      quantity: quantity,
      purchasePrice: price,
      subtotal: quantity * price,
    };

    // Verificar si el producto ya existe en la cesta
    const existingIndex = cartItems.findIndex(item => item.productId === selectedProduct.id);
    
    let updatedCartItems: CartItem[];
    
    if (existingIndex >= 0) {
      // Actualizar cantidad del producto existente
      updatedCartItems = [...cartItems];
      updatedCartItems[existingIndex] = {
        ...updatedCartItems[existingIndex],
        quantity: updatedCartItems[existingIndex].quantity + quantity,
        subtotal: (updatedCartItems[existingIndex].quantity + quantity) * price,
      };
    } else {
      // Agregar nuevo producto
      updatedCartItems = [...cartItems, newItem];
    }

    // Sincronizar inmediatamente con el formulario para React Hook Form
    const formItems = updatedCartItems.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      purchasePrice: item.purchasePrice,
      loteId: null,
      fechaVencimiento: null,
    }));
    
    setValue('items', formItems, { shouldValidate: true });
    setCartItems(updatedCartItems);

    // Limpiar formulario
    setSelectedProduct(null);
    setQuantity(1);
    setPurchasePrice('');
  };

  // Remover producto de la cesta
  const removeFromCart = (index: number) => {
    const newCartItems = cartItems.filter((_, i) => i !== index);
    setCartItems(newCartItems);
    
    // Sincronizar con el formulario
    const formItems = newCartItems.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      purchasePrice: item.purchasePrice,
      loteId: null,
      fechaVencimiento: null,
    }));
    setValue('items', formItems, { shouldValidate: true });
  };

  // Actualizar cantidad en la cesta
  const updateCartQuantity = (index: number, newQuantity: number) => {
    const updatedItems = cartItems.map((item, i) => {
      if (i === index) {
        return {
          ...item,
          quantity: newQuantity,
          subtotal: newQuantity * item.purchasePrice,
        };
      }
      return item;
    });
    setCartItems(updatedItems);
    
    // Sincronizar con el formulario
    const formItems = updatedItems.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      purchasePrice: item.purchasePrice,
      loteId: null,
      fechaVencimiento: null,
    }));
    setValue('items', formItems, { shouldValidate: true });
  };

  // Actualizar precio en la cesta
  const updateCartPrice = (index: number, newPrice: number) => {
    const updatedItems = cartItems.map((item, i) => {
      if (i === index) {
        return {
          ...item,
          purchasePrice: newPrice,
          subtotal: item.quantity * newPrice,
        };
      }
      return item;
    });
    setCartItems(updatedItems);
    
    // Sincronizar con el formulario
    const formItems = updatedItems.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      purchasePrice: item.purchasePrice,
      loteId: null,
      fechaVencimiento: null,
    }));
    setValue('items', formItems, { shouldValidate: true });
  };

  // Manejar envío del formulario
  const handleFormSubmit = handleSubmit((data) => {
    if (cartItems.length === 0) {
      alert('Debe agregar al menos un producto a la compra');
      return;
    }

    // Convertir carrito a formato de array para el backend
    const purchaseItems = cartItems.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      purchasePrice: item.purchasePrice,
      loteId: null,
      fechaVencimiento: null,
    }));

    // Combinar datos del formulario con los items del carrito
    const formData: PurchaseFormData = {
      ...data,
      items: purchaseItems,
    };

    onSubmit(formData);
  });

  // Obtener precio por defecto del producto seleccionado
  const getDefaultPrice = () => {
    return selectedProduct?.price ? parseFloat(selectedProduct.price) : 0;
  };

  // Establecer precio por defecto cuando se selecciona un producto
  React.useEffect(() => {
    if (selectedProduct && !purchasePrice) {
      const defaultPrice = getDefaultPrice();
      setPurchasePrice(defaultPrice.toString());
    }
  }, [selectedProduct]);

  return (
    <div className="space-y-6">
      <form onSubmit={handleFormSubmit} className="space-y-6">
        
        {/* Sección 1: Datos de la Compra */}
        <div className="bg-white p-6 md:p-8 shadow border rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-6">
            Datos de la Compra
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Proveedor */}
            <div>
              <label htmlFor="supplierId" className="block text-sm font-medium text-gray-700">
                Proveedor *
              </label>
              <select
                id="supplierId"
                {...register('supplierId', { valueAsNumber: true })}
                className={getFieldClasses(Boolean(errors.supplierId))}
              >
                <option value={0}>Seleccionar proveedor...</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
              {errors.supplierId && (
                <p className="mt-1 text-xs text-red-600">{errors.supplierId.message}</p>
              )}
            </div>

            {/* Fecha de Compra */}
            <div>
              <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700">
                Fecha de Compra *
              </label>
              <input
                id="purchaseDate"
                type="date"
                {...register('purchaseDate')}
                className={getFieldClasses(Boolean(errors.purchaseDate))}
              />
              {errors.purchaseDate && (
                <p className="mt-1 text-xs text-red-600">{errors.purchaseDate.message}</p>
              )}
            </div>

            {/* Método de Pago */}
            <div>
              <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">
                Método de Pago
              </label>
              <select
                id="paymentMethod"
                {...register('paymentMethod')}
                className={getFieldClasses(Boolean(errors.paymentMethod))}
              >
                <option value="">Seleccionar método...</option>
                <option value="EFECTIVO">Efectivo</option>
                <option value="TRANSFERENCIA">Transferencia</option>
                <option value="YAPE">Yape</option>
                <option value="PLIN">Plin</option>
                <option value="CHEQUE">Cheque</option>
                <option value="CREDITO">Crédito</option>
              </select>
              {errors.paymentMethod && (
                <p className="mt-1 text-xs text-red-600">{errors.paymentMethod.message}</p>
              )}
            </div>

            {/* Notas - Ocupa toda la fila */}
            <div className="md:col-span-2">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Notas
              </label>
              <textarea
                id="notes"
                rows={3}
                {...register('notes')}
                placeholder="Observaciones adicionales..."
                className={getFieldClasses(Boolean(errors.notes))}
              />
              {errors.notes && (
                <p className="mt-1 text-xs text-red-600">{errors.notes.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Sección 2: Agregar Productos */}
        <div className="bg-white p-6 md:p-8 shadow border rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-6">
            Agregar Productos
          </h3>
          
          <div className="space-y-4">
            {/* Búsqueda de producto */}
            <ProductSearch
              products={products}
              selectedProduct={selectedProduct}
              onSelectProduct={setSelectedProduct}
              label="Buscar Producto"
              placeholder="Escribe para buscar productos..."
            />

            {/* Formulario para agregar producto */}
            {selectedProduct && (
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h4 className="text-sm font-medium text-gray-900 mb-4">
                  Agregar: {selectedProduct.name}
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Cantidad */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Cantidad *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      onKeyDown={handleKeyDown}
                      className={getFieldClasses()}
                    />
                  </div>

                  {/* Precio de Compra */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Precio de Compra (S/) *
                    </label>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="0.00"
                      className={getFieldClasses()}
                    />
                  </div>
                </div>

                {/* Subtotal y botón agregar */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Subtotal: <span className="font-medium text-gray-900">
                      S/ {(quantity * parseFloat(purchasePrice || '0')).toFixed(2)}
                    </span>
                  </div>
                  
                  <button
                    type="button"
                    onClick={addToCart}
                    disabled={!selectedProduct || !purchasePrice || parseFloat(purchasePrice) <= 0}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar a la Cesta
                  </button>
                </div>
              </div>
            )}

            {errors.items && (
              <p className="text-sm text-red-600">{errors.items.message}</p>
            )}
          </div>
        </div>

        {/* Sección 3: Cesta de Compras */}
        {cartItems.length > 0 && (
          <ShoppingCart
            items={cartItems}
            onRemoveItem={removeFromCart}
            onUpdateQuantity={updateCartQuantity}
            onUpdatePrice={updateCartPrice}
            allowPriceEdit={true}
          />
        )}

        {/* Sección 4: Botón de Envío */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading || cartItems.length === 0}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Guardando Compra...
              </>
            ) : (
              <>
                <CartIcon className="h-5 w-5 mr-2" />
                Guardar Compra ({cartItems.length} productos)
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewPurchaseForm;
