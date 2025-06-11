import { useState, useMemo } from 'react';
import { Ticket, Promotion, TicketStatus } from '@/types';

// Interfaz que define el valor de retorno del hook
interface UseTicketSelectionReturn {
  selectedTickets: string[];
  toggleTicket: (number: string) => void;
  clearSelections: () => void;
  totalPrice: number;
  appliedPromotion: Promotion | null;
  generateWhatsAppLink: (name?: string, phone?: string) => string;
  isWhatsAppPopupOpen: boolean;
  openWhatsAppPopup: () => void;
  closeWhatsAppPopup: () => void;
}

export const useTicketSelection = (tickets: Ticket[], promotions: Promotion[]): UseTicketSelectionReturn => {
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [isWhatsAppPopupOpen, setIsWhatsAppPopupOpen] = useState(false);

  // Toggle ticket selection
  const toggleTicket = (number: string) => {
    const ticket = tickets.find(t => t.number === number);
    
    // Only allow toggling if ticket is available or already selected
    if (!ticket || (ticket.status !== TicketStatus.AVAILABLE && !selectedTickets.includes(number))) {
      return;
    }
    
    setSelectedTickets(prev => {
      if (prev.includes(number)) {
        return prev.filter(t => t !== number);
      } else {
        return [...prev, number];
      }
    });
  };

  // Clear all selections
  const clearSelections = () => {
    setSelectedTickets([]);
  };

  // Calculate the best promotion to apply
  const appliedPromotion = useMemo(() => {
    if (selectedTickets.length === 0 || promotions.length === 0) {
      return null;
    }

    // Find the best applicable promotion based on quantity
    const applicablePromotions = promotions
      .filter(p => p.quantity <= selectedTickets.length)
      .sort((a, b) => {
        // Sort by discount percentage in descending order
        const aDiscountPerc = (a.discount / (a.quantity * a.regularPrice)) * 100;
        const bDiscountPerc = (b.discount / (b.quantity * b.regularPrice)) * 100;
        return bDiscountPerc - aDiscountPerc;
      });

    return applicablePromotions.length > 0 ? applicablePromotions[0] : null;
  }, [selectedTickets, promotions]);

  // Calculate total price with promotions
  const totalPrice = useMemo(() => {
    if (selectedTickets.length === 0) {
      return 0;
    }

    // Definimos los precios base según las promociones configuradas
    // Estos son los precios por defecto si no hay promociones específicas
    const singleTicketPrice = 30; // Precio individual por boleto
    const twoTicketsPrice = 50;   // Promoción para 2 boletos
    const fiveTicketsPrice = 100; // Promoción para 5 boletos

    // Estrategia: aplicar promociones de mayor a menor
    let remainingTickets = selectedTickets.length;
    let totalPrice = 0;

    // Aplicar promoción de 5 tickets (si hay suficientes)
    if (remainingTickets >= 5) {
      const fiveTicketBundles = Math.floor(remainingTickets / 5);
      totalPrice += fiveTicketBundles * fiveTicketsPrice;
      remainingTickets %= 5;
    }

    // Aplicar promoción de 2 tickets (si quedan suficientes)
    if (remainingTickets >= 2) {
      const twoTicketBundles = Math.floor(remainingTickets / 2);
      totalPrice += twoTicketBundles * twoTicketsPrice;
      remainingTickets %= 2;
    }

    // Aplicar precio individual a los tickets restantes
    if (remainingTickets > 0) {
      totalPrice += remainingTickets * singleTicketPrice;
    }

    return totalPrice;
  }, [selectedTickets]);

  // Open WhatsApp popup
  const openWhatsAppPopup = () => {
    setIsWhatsAppPopupOpen(true);
  };

  // Close WhatsApp popup
  const closeWhatsAppPopup = () => {
    setIsWhatsAppPopupOpen(false);
  };

  // Generate WhatsApp message with selected tickets
  const generateWhatsAppLink = (name = '', phone = '') => {
    if (selectedTickets.length === 0) {
      return '#';
    }

    const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '17083621726'; // +1 (708) 362-1726
    
    // Información específica sobre la promoción aplicada basada en la cantidad
    let promotionInfo = '';
    
    // Construimos un mensaje de promoción específico según la cantidad de boletos
    if (selectedTickets.length >= 5) {
      // Si es múltiplo exacto de 5
      if (selectedTickets.length % 5 === 0) {
        promotionInfo = ` (${selectedTickets.length / 5} promociones de 5 boletos por $100 c/u)`;
      } else {
        // Si hay tickets adicionales a los múltiplos de 5
        const bundles = Math.floor(selectedTickets.length / 5);
        const remaining = selectedTickets.length % 5;
        
        if (remaining >= 2) {
          // Con packs de 2 tickets
          const twoPacks = Math.floor(remaining / 2);
          const singles = remaining % 2;
          promotionInfo = ` (${bundles} promociones de 5 boletos, ${twoPacks} promociones de 2 boletos${singles > 0 ? ` y ${singles} boletos individuales` : ''})`;
        } else {
          // Solo boletos individuales restantes
          promotionInfo = ` (${bundles} promociones de 5 boletos y ${remaining} boletos individuales)`;
        }
      }
    } else if (selectedTickets.length >= 2) {
      // Promoción de 2 boletos
      if (selectedTickets.length % 2 === 0) {
        promotionInfo = ` (${selectedTickets.length / 2} promociones de 2 boletos por $50 c/u)`;
      } else {
        // Con tickets individuales adicionales
        const bundles = Math.floor(selectedTickets.length / 2);
        promotionInfo = ` (${bundles} promociones de 2 boletos y 1 boleto individual)`;
      }
    }
    
    // Mensaje con variables reemplazables que el componente PopupWhatsApp modificará
    const message = `Hola! Soy {{nombre}}, mi teléfono es {{telefono}}. Me interesan los siguientes números para la rifa: ${selectedTickets.join(', ')}${promotionInfo}. El total es $${totalPrice}.`;

    // Si se proporciona nombre y teléfono, reemplazar las variables
    const finalMessage = message
      .replace('{{nombre}}', name || 'cliente')
      .replace('{{telefono}}', phone || 'no proporcionado');

    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(finalMessage)}`;
  };

  return {
    selectedTickets,
    toggleTicket,
    clearSelections,
    totalPrice,
    appliedPromotion,
    generateWhatsAppLink,
    isWhatsAppPopupOpen,
    openWhatsAppPopup,
    closeWhatsAppPopup
  };
};
