'use client';

import React, { useState } from 'react';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { SaleFormData, Product } from '@mi-tienda/types';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { ProductSearch } from './ProductSearch';
import { ShoppingCart } from './ShoppingCart';

// Componentes de UI básicos (copiados de ProductForm.tsx o SupplierForm.tsx)
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  id: string;
}

const FormInput = ({ label, error, id, className = '', ...props }: FormInputProps) => (
  <div className="space-y-1">
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <input
      id={id}
      className={`mt-1 sm:text-sm ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''} ${className}`}
      {...props}
    />
    {error && <p className="text-sm text-red-600">{error}</p>}
  </div>
);

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  id: string;
  children: React.ReactNode;
}

const FormSelect = ({ label, error, id, children, className = '', ...props }: FormSelectProps) => (
  <div className="space-y-1">
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <select
      id={id}
      className={`mt-1 sm:text-sm ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''} ${className}`}
      {...props}
    >
      {children}
    </select>
    {error && <p className="text-sm text-red-600">{error}</p>}
  </div>
);

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  id: string;
}

const FormTextarea = ({ label, error, id, className = '', ...props }: FormTextareaProps) => (
  <div className="space-y-1">
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <textarea
      id={id}
      className={`mt-1 sm:text-sm ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''} ${className}`}
      {...props}
    />
    {error && <p className="text-sm text-red-600">{error}</p>}
  </div>
);

interface SaleFormProps {
  form: UseFormReturn<SaleFormData>;
  onSubmit: (data: SaleFormData) => void;
  isLoading: boolean;
  products: Product[];
}

export const SaleForm = ({ form, onSubmit, isLoading, products }: SaleFormProps) => {
  const { register, handleSubmit, control, formState: { errors }, setValue, watch } = form;
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Inicializa useFieldArray para manejar los items del carrito
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  // Manejar la selección de producto
  const handleSelectProduct = (product: Product | null) => {
    setSelectedProduct(product);
    
    // Si se selecciona un producto, agregarlo al carrito
    if (product) {
      append({
        productId: product.id,
        quantity: 1,
        price: product.price ? parseFloat(product.price) : 0.01
      });
      // Limpiar la selección después de agregar
      setSelectedProduct(null);
    }
  };

  // Actualizar cantidad de un item
  const updateItemQuantity = (index: number, quantity: number) => {
    const currentItems = watch('items');
    const updatedItems = [...currentItems];
    updatedItems[index] = {
      ...updatedItems[index],
      quantity: Math.max(1, quantity)
    };
    setValue('items', updatedItems);
  };

  // Actualizar precio de un item sin restricción de precio mínimo
  const updateItemPrice = (index: number, newPrice: number) => {
    const currentItems = watch('items');
    
    // Validar que el precio sea mayor que 0
    const validatedPrice = Math.max(0.01, newPrice);
    
    const updatedItems = [...currentItems];
    updatedItems[index] = {
      ...updatedItems[index],
      price: validatedPrice
    };
    setValue('items', updatedItems);
  };

  // Calcular subtotal para un item
  const calculateSubtotal = (item: { quantity?: number; price?: number }) => {
    return (item.quantity || 0) * (item.price || 0);
  };

  // Preparar items para el carrito
  const cartItems = fields.map((field, index) => {
    const item = watch(`items.${index}`);
    const product = products.find(p => p.id === item.productId);
    
    return {
      productId: item.productId,
      productName: product?.name || 'Producto no encontrado',
      productCode: product?.code || null,
      quantity: item.quantity || 1,
      purchasePrice: item.price || 0,
      subtotal: calculateSubtotal(item)
    };
  });

  // Calcular total de la venta
  const totalAmount = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Sección 1: Datos del Cliente y Venta */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Datos del Cliente y Venta</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormInput
            label="Nombre del Cliente"
            id="customerName"
            {...register('customerName')}
            error={errors.customerName?.message}
          />
          
          <FormInput
            label="Teléfono Cliente"
            id="customerPhone"
            {...register('customerPhone')}
            error={errors.customerPhone?.message}
          />
          
          <FormSelect
            label="Método de Pago"
            id="paymentMethod"
            {...register('paymentMethod')}
            error={errors.paymentMethod?.message}
          >
            <option value="">Seleccione un método</option>
            <option value="EFECTIVO">Efectivo</option>
            <option value="YAPE">Yape</option>
            <option value="PLIN">Plin</option>
            <option value="TRANSFERENCIA">Transferencia</option>
            <option value="CHEQUE">Cheque</option>
            <option value="CREDITO">Crédito</option>
          </FormSelect>
          
          <FormSelect
            label="Método de Entrega"
            id="deliveryMethod"
            {...register('deliveryMethod')}
            error={errors.deliveryMethod?.message}
          >
            <option value="">Seleccione un método</option>
            <option value="OFICINA">Oficina</option>
            <option value="DELIVERY">Delivery</option>
            <option value="ENVIO">Envío</option>
          </FormSelect>
          
          <FormInput
            label="Costo de Envío"
            id="deliveryCost"
            type="number"
            step="0.01"
            {...register('deliveryCost', { valueAsNumber: true })}
            error={errors.deliveryCost?.message}
          />
          
          <div className="md:col-span-3">
            <FormTextarea
              label="Lugar de Entrega / Notas"
              id="deliveryLocation"
              rows={3}
              {...register('deliveryLocation')}
              error={errors.deliveryLocation?.message}
            />
          </div>
        </div>
      </div>

      {/* Sección 2: Carrito de Venta */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Productos</h3>
        
        {/* Buscador de productos */}
        <div className="mb-6">
          <ProductSearch
            products={products}
            selectedProduct={selectedProduct}
            onSelectProduct={handleSelectProduct}
            placeholder="Buscar producto para agregar al carrito..."
            label="Agregar Producto"
            error={errors.items?.message}
          />
        </div>
        
        {/* Carrito de compras */}
        <ShoppingCart
          items={cartItems}
          onRemoveItem={remove}
          onUpdateQuantity={updateItemQuantity}
          onUpdatePrice={updateItemPrice}
          allowPriceEdit={true}
        />
        
        {/* Total de la venta */}
        {cartItems.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-base font-medium text-gray-700">Total de la Venta:</span>
              <span className="text-xl font-bold text-green-600">
                S/ {totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Sección 3: Botón de Envío Principal */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading || fields.length === 0}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Registrar Venta
        </button>
      </div>
    </form>
  );
};
