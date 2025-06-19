import useSWR from 'swr';
import { RaffleData } from '../types';
import { RaffleService } from '../services/raffle.service';

// Función fetcher para SWR que utiliza el servicio real
const fetcher = async (): Promise<RaffleData> => {
  try {
    return await RaffleService.getActiveRaffleDetails();
  } catch (error) {
    console.error('Error fetching raffle data:', error);
    throw error;
  }
};

// Mock data como fallback para desarrollo o cuando la API no está disponible
const mockRaffleData: RaffleData = {
  raffle: {
    _id: '1',
    name: 'Gran Sorteo Toyota Corolla 2020',
    prize: 'Toyota Corolla 2020 SE',
    totalTickets: 1000,
    ticketPrice: 20,
    drawMethod: 'Lotería Nacional',
    isActive: true,
  },
  promotions: [
    { 
      _id: '1', 
      quantity: 2, 
      price: 35, 
      regularPrice: 40, // Precio regular total (2 boletos x $20)
      discount: 5,       // Descuento total ($5 de descuento)
      description: '2 boletos', 
      raffle: '1' 
    },
    { 
      _id: '2', 
      quantity: 5, 
      price: 80, 
      regularPrice: 100, // Precio regular total (5 boletos x $20)
      discount: 20,      // Descuento total ($20 de descuento)
      description: '5 boletos', 
      raffle: '1' 
    },
    { 
      _id: '3', 
      quantity: 10, 
      price: 150, 
      regularPrice: 200, // Precio regular total (10 boletos x $20)
      discount: 50,      // Descuento total ($50 de descuento)
      description: '10 boletos', 
      raffle: '1' 
    },
  ],
};

export const useRaffleData = (useMockData = false) => {
  const { data, error, isLoading, mutate } = useSWR<RaffleData>(
    'activeRaffle',
    useMockData ? () => Promise.resolve(mockRaffleData) : fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 30000, // Revalidar cada 30 segundos
      onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
        // Intentar nuevamente solo un número limitado de veces
        if (retryCount >= 3) return;
        
        // Incrementar el tiempo entre intentos
        setTimeout(() => revalidate({ retryCount }), 5000 * (retryCount + 1));
      }
    }
  );

  return {
    raffleData: data || mockRaffleData, // Usar mockData como fallback
    isLoading,
    isError: error,
    mutate,
  };
};
