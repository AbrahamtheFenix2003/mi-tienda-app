'use client';

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Image from 'next/image';
import {
  ChevronDown,
  Minus,
  Package,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { getAbsoluteImageUrl, isLocalUrl } from '@/lib/imageUtils';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Advisor {
  id: string;
  name: string;
  displayPhone: string;
  phone: string;
}

const advisors: Advisor[] = [
  {
    id: 'milka',
    name: 'Milka',
    displayPhone: '+51 938 256 218',
    phone: '51938256218',
  },
  {
    id: 'ana',
    name: 'Ana',
    displayPhone: '+51 931 257 162',
    phone: '51931257162',
  },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M12.04 2a9.94 9.94 0 0 0-8.54 15.08L2 22l5.08-1.48A10.01 10.01 0 1 0 12.04 2Zm.01 18.12a8.1 8.1 0 0 1-4.12-1.13l-.29-.18-3.01.88.89-2.94-.19-.3a8.15 8.15 0 1 1 6.72 3.67Zm4.52-6.13c-.24-.12-1.43-.7-1.65-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.03-.38-1.95-1.21-.72-.64-1.2-1.43-1.34-1.67-.14-.24-.02-.37.1-.49.1-.1.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.48-.4-.42-.54-.43l-.46-.01c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.31.98 2.47c.12.16 1.7 2.6 4.12 3.65.58.25 1.03.4 1.38.5.58.18 1.12.15 1.54.09.47-.07 1.43-.58 1.63-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28Z" />
  </svg>
);

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    totalItems,
    totalPrice,
  } = useCart();
  const [showAdvisors, setShowAdvisors] = useState(false);

  const cartIsEmpty = items.length === 0;
  const advisorOptionsVisible = !cartIsEmpty && showAdvisors;

  const handleQuantityChange = (productId: number, quantity: number) => {
    updateQuantity(productId, quantity);
  };

  const handleSendToAdvisor = (advisor: Advisor) => {
    if (typeof window === 'undefined' || cartIsEmpty) return;

    const summaryLines = items.map((item, index) => {
      const unitPrice = Number.parseFloat(item.product.price);
      const safeUnitPrice = Number.isFinite(unitPrice) ? unitPrice : 0;
      const lineTotal = safeUnitPrice * item.quantity;
      return `${index + 1}. ${item.product.name} (Código: ${item.product.code}) x${item.quantity} - ${formatCurrency(lineTotal)}`;
    });

    const messageBody = [
      `Hola ${advisor.name}, me gustaría hacer el siguiente pedido:`,
      '',
      ...summaryLines,
      '',
      `Total estimado: ${formatCurrency(totalPrice)}`,
      '',
      '¿Podrías ayudarme con el proceso? Muchas gracias.',
    ].join('\n');

    const url = `https://wa.me/${advisor.phone}?text=${encodeURIComponent(messageBody)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setShowAdvisors(false);
    onClose();
  };

  const advisoryButtonDisabled = cartIsEmpty;

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-8">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col bg-white shadow-xl">
                    <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                      <Dialog.Title className="text-lg font-semibold text-gray-900">
                        Mi cesta ({totalItems})
                      </Dialog.Title>
                      <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                        aria-label="Cerrar cesta"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="flex-1 overflow-hidden px-6 py-4">
                      {cartIsEmpty ? (
                        <div className="flex h-full flex-col items-center justify-center text-center text-gray-500">
                          <WhatsAppIcon className="h-12 w-12 text-gray-300" />
                          <p className="mt-4 text-lg font-semibold text-gray-700">Tu cesta está vacía</p>
                          <p className="mt-1 text-sm text-gray-500">Añade productos para organizar tu pedido.</p>
                        </div>
                      ) : (
                        <div className="flex h-full flex-col">
                          <div className="flex-1 space-y-4 overflow-y-auto pr-2">
                            {items.map((item) => {
                              const imageUrl = item.product.imageUrl
                                ? getAbsoluteImageUrl(item.product.imageUrl)
                                : null;
                              const unitPrice = Number.parseFloat(item.product.price);
                              const safeUnitPrice = Number.isFinite(unitPrice) ? unitPrice : 0;
                              const lineTotal = safeUnitPrice * item.quantity;
                              const canIncrease = item.quantity < Math.max(item.product.stock, 0);

                              return (
                                <div
                                  key={item.product.id}
                                  className="flex gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm"
                                >
                                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-gray-100">
                                    {imageUrl && isLocalUrl(imageUrl) ? (
                                      <Image
                                        src={imageUrl}
                                        alt={item.product.name}
                                        fill
                                        sizes="80px"
                                        className="object-cover"
                                      />
                                    ) : imageUrl ? (
                                      // eslint-disable-next-line @next/next/no-img-element
                                      <img
                                        src={imageUrl}
                                        alt={item.product.name}
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      <div className="flex h-full w-full items-center justify-center text-gray-300">
                                        <Package className="h-8 w-8" />
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex flex-1 flex-col">
                                    <div className="flex items-start justify-between gap-2">
                                      <div>
                                        <p className="font-semibold text-gray-900">{item.product.name}</p>
                                        <p className="text-xs text-gray-500">Código: {item.product.code}</p>
                                        <p className="text-xs text-gray-500">Stock disponible: {item.product.stock}</p>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => removeItem(item.product.id)}
                                        className="text-gray-400 transition-colors hover:text-red-500"
                                        aria-label="Eliminar producto de la cesta"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>

                                    <div className="mt-3 flex items-center justify-between">
                                      <div className="inline-flex items-center rounded-full border border-gray-300 bg-white">
                                        <button
                                          type="button"
                                          onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                                          className="flex h-9 w-9 items-center justify-center text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
                                          aria-label="Disminuir cantidad"
                                        >
                                          <Minus className="h-4 w-4" />
                                        </button>
                                        <span className="min-w-8 text-center text-sm font-semibold text-gray-900">
                                          {item.quantity}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                                          disabled={!canIncrease}
                                          className="flex h-9 w-9 items-center justify-center text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700 disabled:cursor-not-allowed disabled:text-gray-300"
                                          aria-label="Incrementar cantidad"
                                        >
                                          <Plus className="h-4 w-4" />
                                        </button>
                                      </div>
                                      <span className="text-sm font-semibold text-gray-900">
                                        {formatCurrency(lineTotal)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <div className="border-t border-gray-200 pt-4">
                            <div className="flex items-center justify-between text-sm text-gray-700">
                              <span>Total de productos</span>
                              <span className="font-semibold">{totalItems}</span>
                            </div>
                            <div className="mt-2 flex items-center justify-between text-lg font-semibold text-gray-900">
                              <span>Total estimado</span>
                              <span>{formatCurrency(totalPrice)}</span>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                              * El total es referencial. El precio final puede variar al coordinar con la asesora.
                            </p>

                            <div className="mt-4 space-y-3">
                              <button
                                type="button"
                                onClick={() => setShowAdvisors((prev) => !prev)}
                                disabled={advisoryButtonDisabled}
                                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#22bf5d] focus:outline-none focus:ring-2 focus:ring-[#1ebe58] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
                              >
                                <WhatsAppIcon className="h-5 w-5" />
                                <span>Contactar por WhatsApp</span>
                                <ChevronDown className={`h-4 w-4 transition-transform ${advisorOptionsVisible ? 'rotate-180' : ''}`} />
                              </button>

                              {advisorOptionsVisible && (
                                <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                                  <p className="text-xs font-medium text-gray-600">
                                    Selecciona la asesora con la que prefieres coordinar tu pedido.
                                  </p>
                                  {advisors.map((advisor) => (
                                    <button
                                      key={advisor.id}
                                      type="button"
                                      onClick={() => handleSendToAdvisor(advisor)}
                                      className="flex w-full items-center justify-between rounded-lg bg-white px-3 py-2 text-left text-sm font-semibold text-gray-700 transition-colors hover:bg-rose-50 hover:text-rose-600"
                                    >
                                      <span>{advisor.name}</span>
                                      <span className="text-xs font-medium text-gray-500">{advisor.displayPhone}</span>
                                    </button>
                                  ))}
                                </div>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  clearCart();
                                  setShowAdvisors(false);
                                }}
                                className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100"
                              >
                                Vaciar cesta
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
