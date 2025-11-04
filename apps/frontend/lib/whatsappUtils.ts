import { CartItem, Advisor } from '@mi-tienda/types';

/**
 * Generates a formatted WhatsApp message with cart items
 */
export function generateWhatsAppMessage(cartItems: CartItem[], totalAmount: number): string {
  const greeting = '¡Hola! Me gustaría hacer un pedido:';

  const header = '\n\n📦 *Detalles del Pedido:*\n';

  const items = cartItems
    .map((item, index) => {
      const itemNumber = index + 1;
      const name = item.product.name;
      const quantity = item.quantity;
      const price = item.subtotal.toFixed(2);
      return `${itemNumber}. ${name} - Cantidad: ${quantity} - Precio: S/ ${price}`;
    })
    .join('\n');

  const total = `\n\n💰 *Total: S/ ${totalAmount.toFixed(2)}*`;

  const footer = '\n\n¿Podrían confirmar disponibilidad y forma de pago?\n\n¡Gracias!';

  return greeting + header + items + total + footer;
}

/**
 * Formats phone number for WhatsApp API (removes spaces, dashes, and plus sign)
 */
export function formatPhoneNumber(phone: string): string {
  return phone.replace(/[\s\-+]/g, '');
}

/**
 * Generates WhatsApp Web/App URL with pre-filled message
 */
export function generateWhatsAppURL(advisor: Advisor, message: string): string {
  const phoneNumber = formatPhoneNumber(advisor.phone);
  const encodedMessage = encodeURIComponent(message);

  // Use wa.me for universal compatibility (works on mobile and desktop)
  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
}

/**
 * Opens WhatsApp with the pre-filled message
 */
export function redirectToWhatsApp(advisor: Advisor, cartItems: CartItem[], totalAmount: number): void {
  const message = generateWhatsAppMessage(cartItems, totalAmount);
  const url = generateWhatsAppURL(advisor, message);

  // Open in new window/tab
  window.open(url, '_blank');
}
