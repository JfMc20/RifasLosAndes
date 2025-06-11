import axios, { AxiosInstance, AxiosResponse, AxiosRequestConfig } from 'axios';
import { RaffleData, Ticket, TicketStatus, Promotion, PaymentMethod, FAQ, HeroContent } from '../types';

// API base URL - can be configured via environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Flag para modo demo (desarrollo sin backend)
 * Desactivado para usar el backend real en producción
 */
const DEMO_MODE = false;

// Store the demo mode flag in localStorage for other services to use
if (typeof window !== 'undefined') {
  localStorage.setItem('DEMO_MODE', DEMO_MODE.toString());
}

// Create axios instance with default config
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available (for admin panel)
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API response interface
interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
  headers: any;
}

// API service class
export class ApiService {
  // Transform axios response to our ApiResponse format
  private static transformResponse<T>(response: AxiosResponse): ApiResponse<T> {
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    };
  }

  // Generic GET request
  static async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    if (DEMO_MODE) {
      // Devolver datos simulados para demostración
      return this.getMockData<T>(url);
    }
    
    try {
      const response = await axiosInstance.get<T>(url, config);
      return this.transformResponse<T>(response);
    } catch (error) {
      console.error('API No Response:', error);
      // Fallback a datos simulados si no se puede conectar al backend
      return this.getMockData<T>(url);
    }
  }
  
  // Get mock data for demo mode or fallback
  private static getMockData<T>(url: string): ApiResponse<T> {
    // Datos simulados para diferentes endpoints
    const mockData = {
      // All raffles (admin)
      '/raffle': [
        {
          _id: 'mock-raffle-id-1',
          name: 'Toyota Corolla 2025',
          prize: 'Toyota Corolla SE 2025',
          ticketPrice: 100,
          totalTickets: 1000,
          drawMethod: 'Lotería Nacional',
          drawDate: new Date('2026-01-15').toISOString(),
          isActive: true,
          createdAt: new Date('2025-01-01').toISOString(),
          updatedAt: new Date('2025-01-01').toISOString()
        },
        {
          _id: 'mock-raffle-id-2',
          name: 'iPhone 16 Pro',
          prize: 'iPhone 16 Pro 512GB',
          ticketPrice: 50,
          totalTickets: 500,
          drawMethod: 'En vivo por Instagram',
          drawDate: new Date('2025-08-30').toISOString(),
          isActive: false,
          createdAt: new Date('2025-04-15').toISOString(),
          updatedAt: new Date('2025-04-15').toISOString()
        }
      ],
      // Dashboard stats
      '/stats/summary': {
        totalTickets: 1000,
        soldTickets: 650,
        reservedTickets: 150,
        availableTickets: 200,
        totalRevenue: 65000,
        soldPercentage: 65,
        reservedPercentage: 15,
        availablePercentage: 20
      },
      // Active raffle
      '/raffle/active': {
        _id: 'mock-raffle-id',
        title: 'Toyota Corolla 2025 Limited',
        description: 'Gran rifa de un Toyota Corolla 2025 Limited Edition con opciones premium',
        price: 100,
        totalTickets: 1000,
        startDate: new Date('2025-01-01').toISOString(),
        endDate: new Date('2025-12-31').toISOString(),
        drawDate: new Date('2026-01-15').toISOString(),
        imageUrl: '/assets/images/prize-toyota-corolla.jpg',
        status: 'active',
        mainPrize: 'Toyota Corolla 2025 Limited Edition',
        secondaryPrizes: ['MacBook Pro 16"', 'iPhone 15 Pro', 'Apple Watch Ultra'],
        rules: 'El sorteo se realizará mediante transmisión en vivo a través de nuestras redes sociales.'
      },
      // Monthly sales chart
      '/stats/monthly-sales': [
        { month: 'Ene', sales: 85 },
        { month: 'Feb', sales: 95 },
        { month: 'Mar', sales: 110 },
        { month: 'Abr', sales: 90 },
        { month: 'May', sales: 120 },
        { month: 'Jun', sales: 150 },
      ],
      // Ticket status breakdown
      '/stats/tickets-status': [
        { status: 'Vendido', quantity: 650 },
        { status: 'Reservado', quantity: 150 },
        { status: 'Disponible', quantity: 200 }
      ],
      // Daily tickets data
      '/stats/daily-tickets': [
        { date: '01/06/2025', sold: 22, reserved: 5 },
        { date: '02/06/2025', sold: 18, reserved: 8 },
        { date: '03/06/2025', sold: 25, reserved: 10 },
        { date: '04/06/2025', sold: 35, reserved: 12 },
        { date: '05/06/2025', sold: 28, reserved: 7 }
      ],
      // Recent transactions
      '/transaction/recent': [
        { id: 'txn-001', user: 'Carlos Rodríguez', ticketNumber: '045', amount: 100, date: new Date('2025-06-05T10:30:00').toISOString(), status: 'Completado' },
        { id: 'txn-002', user: 'María González', ticketNumber: '128', amount: 100, date: new Date('2025-06-04T15:45:00').toISOString(), status: 'Completado' },
        { id: 'txn-003', user: 'Juan Pérez', ticketNumber: '256', amount: 100, date: new Date('2025-06-04T09:15:00').toISOString(), status: 'Completado' },
        { id: 'txn-004', user: 'Ana López', ticketNumber: '512', amount: 100, date: new Date('2025-06-03T14:20:00').toISOString(), status: 'Completado' },
        { id: 'txn-005', user: 'Roberto Díaz', ticketNumber: '623', amount: 100, date: new Date('2025-06-02T11:10:00').toISOString(), status: 'Completado' }
      ],
      // User sales stats
      '/stats/users-sales': [
        { user: 'Carlos Rodríguez', ticketsSold: 45, totalAmount: 4500 },
        { user: 'María González', ticketsSold: 32, totalAmount: 3200 },
        { user: 'Juan Pérez', ticketsSold: 28, totalAmount: 2800 },
        { user: 'Ana López', ticketsSold: 20, totalAmount: 2000 },
        { user: 'Roberto Díaz', ticketsSold: 18, totalAmount: 1800 }
      ],
      // Content endpoints
      '/content/faqs': [
        {
          _id: 'faq-001',
          question: '¿Cómo puedo participar en la rifa?',
          answer: 'Puedes adquirir tus boletos en nuestra página web o con cualquiera de nuestros vendedores autorizados.',
          order: 1,
          isActive: true,
          createdAt: new Date('2025-01-15').toISOString(),
          updatedAt: new Date('2025-01-15').toISOString()
        },
        {
          _id: 'faq-002',
          question: '¿Cuándo se realiza el sorteo?',
          answer: 'El sorteo se realizará en la fecha indicada en la página de la rifa actual. Generalmente, los sorteos se transmiten en vivo a través de nuestras redes sociales.',
          order: 2,
          isActive: true,
          createdAt: new Date('2025-01-16').toISOString(),
          updatedAt: new Date('2025-01-16').toISOString()
        },
        {
          _id: 'faq-003',
          question: '¿Cómo sé si gané?',
          answer: 'Publicamos los resultados en nuestra página web y contactamos directamente a los ganadores por teléfono o email.',
          order: 3,
          isActive: true,
          createdAt: new Date('2025-01-17').toISOString(),
          updatedAt: new Date('2025-01-17').toISOString()
        }
      ],
      '/content/payment-methods': [
        {
          _id: 'payment-001',
          name: 'PayPal',
          description: 'Paga de forma segura con tu cuenta de PayPal.',
          imageUrl: '/images/paypal.png',
          isActive: true,
          createdAt: new Date('2025-01-10').toISOString(),
          updatedAt: new Date('2025-01-10').toISOString()
        },
        {
          _id: 'payment-002',
          name: 'Transferencia Bancaria',
          description: 'Realiza una transferencia directa a nuestra cuenta bancaria.',
          imageUrl: '/images/bank-transfer.png',
          isActive: true,
          createdAt: new Date('2025-01-11').toISOString(),
          updatedAt: new Date('2025-01-11').toISOString()
        },
        {
          _id: 'payment-003',
          name: 'Efectivo',
          description: 'Paga en efectivo a nuestros vendedores autorizados.',
          imageUrl: '/images/cash.png',
          isActive: true,
          createdAt: new Date('2025-01-12').toISOString(),
          updatedAt: new Date('2025-01-12').toISOString()
        }
      ],
      '/content/hero': {
        _id: 'hero-001',
        title: 'Gran Rifa - Toyota Corolla 2025',
        subtitle: '¡Gana un Toyota Corolla 2025 totalmente nuevo!',
        description: 'Participa en nuestra gran rifa y podrías ser el afortunado ganador de un Toyota Corolla 2025 completamente nuevo. Los fondos recaudados serán destinados a causas benéficas en la comunidad.',
        imageUrl: '/images/toyota-corolla.jpg',
        createdAt: new Date('2025-01-01').toISOString(),
        updatedAt: new Date('2025-01-01').toISOString()
      },
      
      // Tickets endpoints
      'ticket/raffle/mock-raffle-id-1': [
        ...Array(50).fill(0).map((_, idx) => ({
          _id: `ticket-${(idx + 1).toString().padStart(3, '0')}`,
          number: (idx + 1).toString().padStart(3, '0'),
          status: idx < 30 ? 'sold' : (idx < 40 ? 'reserved' : 'available'),
          raffle: 'mock-raffle-id-1',
          ...(idx < 30 ? {
            buyerName: `Cliente ${idx + 1}`,
            buyerEmail: `cliente${idx + 1}@example.com`,
            buyerPhone: `555-${idx.toString().padStart(4, '0')}`,
            transactionId: `txn-${idx.toString().padStart(6, '0')}`
          } : {}),
          createdAt: new Date('2025-01-15').toISOString(),
          updatedAt: new Date('2025-01-15').toISOString()
        }))
      ],
      'ticket/raffle/mock-raffle-id-1/status': {
        available: 10,
        reserved: 10,
        sold: 30
      },
      'ticket/raffle/mock-raffle-id-1/available': [
        ...Array(10).fill(0).map((_, idx) => ({
          _id: `ticket-${(idx + 41).toString().padStart(3, '0')}`,
          number: (idx + 41).toString().padStart(3, '0'),
          status: 'available',
          raffle: 'mock-raffle-id-1',
          createdAt: new Date('2025-01-15').toISOString(),
          updatedAt: new Date('2025-01-15').toISOString()
        }))
      ],
      
      // Users list for admin panel
      '/users': [
        {
          _id: 'user-001',
          username: 'admin',
          name: 'Administrador',
          email: 'admin@rifalosandes.com',
          role: 'admin',
          active: true,
          createdAt: new Date('2025-01-01').toISOString(),
          updatedAt: new Date('2025-01-01').toISOString()
        },
        {
          _id: 'user-002',
          username: 'carlos.rodriguez',
          name: 'Carlos Rodríguez',
          email: 'carlos@example.com',
          role: 'seller',
          active: true,
          createdAt: new Date('2025-02-15').toISOString(),
          updatedAt: new Date('2025-02-15').toISOString()
        },
        {
          _id: 'user-003',
          username: 'maria.gonzalez',
          name: 'María González',
          email: 'maria@example.com',
          role: 'seller',
          active: true,
          createdAt: new Date('2025-02-20').toISOString(),
          updatedAt: new Date('2025-02-20').toISOString()
        },
        {
          _id: 'user-004',
          username: 'juan.perez',
          name: 'Juan Pérez',
          email: 'juan@example.com',
          role: 'seller',
          active: false,
          createdAt: new Date('2025-03-10').toISOString(),
          updatedAt: new Date('2025-04-15').toISOString()
        }
      ]
    };
    
    // Determinar qué datos devolver según la URL solicitada
    let responseData: any = { message: 'Mock data not available for this endpoint' };
    
    Object.keys(mockData).forEach(endpoint => {
      if (url.includes(endpoint)) {
        responseData = mockData[endpoint];
      }
    });
    
    // Para la autenticación de administrador
    if (url.includes('/auth/login')) {
      responseData = {
        user: {
          id: 'mock-admin-id',
          username: 'admin',
          fullName: 'Administrator',
          email: 'admin@rifalosandes.com',
          role: 'admin'
        },
        token: 'mock-jwt-token-for-admin-authentication'
      };
    }
    
    return {
      data: responseData as T,
      status: 200,
      statusText: 'OK (DEMO MODE)',
      headers: {}
    };
  }

  // Generic POST request
  static async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await axiosInstance.post<T>(url, data, config);
      return this.transformResponse<T>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Generic PUT request
  static async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await axiosInstance.put<T>(url, data, config);
      return this.transformResponse<T>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Generic DELETE request
  static async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await axiosInstance.delete<T>(url, config);
      return this.transformResponse<T>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Error handler
  private static handleError(error: any): Error {
    if (error?.response?.data) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error Response:', error.response.data);
      
      // Mostrar información detallada sobre el error
      if (typeof error.response.data === 'object') {
        console.log('Error response details:', JSON.stringify(error.response.data, null, 2));
      }
      
      // Usar un mensaje genérico si no podemos extraer uno específico
      const errorMessage = 
        (typeof error.response.data === 'string' ? error.response.data : null) ||
        (error.response.data && typeof error.response.data.message === 'string' ? error.response.data.message : null) ||
        `API Error: ${error.response.status} ${error.response.statusText}`;
      
      return new Error(errorMessage);
    } else if (error?.request) {
      // The request was made but no response was received
      console.error('API No Response - The request was made but no response was received');
      return new Error('No se pudo conectar al servidor. Verifique su conexión a internet o contacte al administrador.');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Request Error:', error?.message || 'Unknown error');
      return new Error('Error al procesar la solicitud. Por favor, intente de nuevo.');
    }
  }
}
