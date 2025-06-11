// Define interfaces for all data types used in the application

// Enum para el estado de los boletos
export enum TicketStatus {
  AVAILABLE = 'available',
  RESERVED = 'reserved',
  SOLD = 'sold',
  SELECTED = 'selected'
}

// Interface para la rifa
export interface Raffle {
  _id: string;
  name: string;
  prize: string;
  totalTickets: number;
  ticketPrice: number;
  drawMethod: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Interface para los boletos
export interface Ticket {
  _id?: string;
  number: string;
  status: TicketStatus;
  raffle?: string;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  transactionId?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Interface para las promociones
export interface Promotion {
  _id: string;
  quantity: number;
  price: number;
  regularPrice: number;  // Precio individual regular por boleto
  discount: number;     // Descuento total aplicado en la promoción
  description: string;
  raffle: string;
  createdAt?: string;
  updatedAt?: string;
}

// Interface para los métodos de pago
export interface PaymentMethod {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
  iconUrl?: string; // Icon for the payment method
  isActive: boolean;
  accountNumber?: string; // For bank transfers
  accountOwner?: string; // For bank transfers
  createdAt?: string;
  updatedAt?: string;
}

// Interface para las FAQ
export interface FAQ {
  _id: string;
  question: string;
  answer: string;
  order?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Interface para la sección hero
export interface HeroContent {
  _id: string;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  buttonText?: string; // Call to action button text
  createdAt?: string;
  updatedAt?: string;
}

// Interface para la selección de boletos del usuario
export interface TicketSelection {
  selectedNumbers: string[];
  totalPrice: number;
  appliedPromotion: Promotion | null;
  whatsappNumber?: string;
}

// Interface para la respuesta de la rifa activa
export interface RaffleData {
  raffle: Raffle;
  promotions: Promotion[];
}

// Interface para el carrusel de fotos del premio
export interface PrizeCarouselContent {
  _id: string;
  title: string;
  description: string;
  images: string[];
  createdAt?: string;
  updatedAt?: string;
}

// Interface para el ticker de información
export interface InfoTicker {
  _id: string;
  ticketPrice: string;
  drawDate: string;
  announcementChannel: string;
  additionalInfo?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Interface para el contenido completo del sitio
export interface WebsiteContent {
  heroContent: HeroContent | null;
  prizeCarouselContent: PrizeCarouselContent | null;
  infoTicker: InfoTicker | null;
  faqs: FAQ[];
  paymentMethods: PaymentMethod[];
}

// Interface para la autenticación
export interface User {
  _id: string;
  username: string;
  role: 'admin' | 'seller' | 'user';
  name?: string;
  fullName?: string;
  email?: string;
  active?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Interface para la respuesta de login
export interface AuthResponse {
  user: User;
  accessToken: string;
}
