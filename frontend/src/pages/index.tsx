import React from 'react';
import { GetServerSideProps } from 'next';
import { HeroContent, FAQ, PaymentMethod, Ticket, Promotion, Raffle, TicketStatus, PrizeCarouselContent, InfoTicker } from '@/types';

// Import layout components
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// Import section components
import HeroSection from '@/components/sections/HeroSection';
import PrizeCarouselSection from '@/components/sections/PrizeCarouselSection';
import SocialMediaBanner from '@/components/sections/SocialMediaBanner';
import TicketsSection from '@/components/sections/TicketsSection';
import PaymentMethodsSection from '@/components/sections/PaymentMethodsSection';
import FAQSection from '@/components/sections/FAQSection';
import InfoTickerSection from '@/components/sections/InfoTickerSection';

// Define RaffleData interface here to ensure it matches our usage
interface RaffleData {
  raffle: Raffle;
  tickets: Ticket[];
  promotions: Promotion[];
  paymentMethods: PaymentMethod[];
  faqs: FAQ[];
  heroContent: HeroContent;
  prizeCarouselContent?: PrizeCarouselContent;
  infoTicker?: InfoTicker;
}

interface HomePageProps {
  initialData: RaffleData;
}

export default function HomePage({ initialData }: HomePageProps) {
  // Extract data from the props
  const {
    raffle,
    tickets,
    promotions,
    paymentMethods,
    faqs,
    heroContent,
    prizeCarouselContent,
    infoTicker,
  } = initialData;

  return (
    <>
      <Header />
      
      <main className="font-montserrat">
        <HeroSection heroContent={heroContent} infoTicker={infoTicker} />
        {prizeCarouselContent && <PrizeCarouselSection carouselContent={prizeCarouselContent} />}
        <SocialMediaBanner />
        <TicketsSection tickets={tickets} promotions={promotions} />
        <PaymentMethodsSection paymentMethods={paymentMethods} />
        <FAQSection faqs={faqs} />
      </main>
      
      <Footer />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    console.log('Fetching data from API for homepage...');
    
    // Asegurar que la URL de la API tenga el formato correcto
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const API_URL = `${API_BASE_URL}/api`; // Añadir explícitamente el prefijo /api
    
    console.log(`Utilizando URL de API: ${API_URL}`);
    
    // Fetch data from the real backend API
    const [
      activeRaffleResponse, // Obtener la rifa activa, promociones y tickets reales
      heroContentResponse,
      prizeCarouselResponse, // Nuevo endpoint para carrusel de premios
      infoTickerResponse, // Obtener información del ticker
      paymentMethodsResponse,
      faqsResponse
    ] = await Promise.all([
      fetch(`${API_URL}/raffle/active-with-tickets`), // Endpoint actualizado para rifa activa con tickets
      fetch(`${API_URL}/content/hero`),
      fetch(`${API_URL}/content/prize-carousel`), // Obtener contenido del carrusel de premios
      fetch(`${API_URL}/content/info-ticker`), // Obtener contenido del ticker de información
      fetch(`${API_URL}/content/payment-methods`),
      fetch(`${API_URL}/content/faqs`)
    ]);
    
    // Obtener la rifa activa, sus promociones y tickets reales
    const activeRaffleData = await activeRaffleResponse.json();
    const heroContent = await heroContentResponse.json();
    
    // Obtener contenido del carrusel de premios (manejando posible 404)
    let prizeCarouselContent = null;
    if (prizeCarouselResponse.ok) {
      prizeCarouselContent = await prizeCarouselResponse.json();
    } else {
      console.log('No se encontró contenido para el carrusel de premios');
    }
    
    // Obtener contenido del ticker de información (manejando posible 404)
    let infoTicker = null;
    if (infoTickerResponse.ok) {
      infoTicker = await infoTickerResponse.json();
    } else {
      console.log('No se encontró contenido para el ticker de información');
    }
    
    const paymentMethods = await paymentMethodsResponse.json();
    const faqs = await faqsResponse.json();
    
    console.log('Successfully fetched content from API');
    
    // Usar los tickets reales devueltos por el backend
    let tickets = [];
    
    if (activeRaffleData && activeRaffleData.tickets) {
      // Usar los tickets reales del backend
      tickets = activeRaffleData.tickets;
    } else {
      // Si no hay tickets, registrar una advertencia y continuar con un array vacío
      console.warn('No se recibieron tickets reales del backend o no hay una rifa activa.');
    }
    
    const initialData: RaffleData = {
      // Usar los datos de la rifa activa desde el backend
      raffle: activeRaffleData?.raffle || {
        _id: '1',
        name: 'No hay rifa activa',
        prize: 'Sin premio definido',
        totalTickets: 1000,
        ticketPrice: 0,
        drawMethod: 'No definido',
        isActive: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      tickets: tickets,
      // Usar las promociones de la rifa activa
      promotions: activeRaffleData?.promotions || [],
      
      // Use the real data from the API
      paymentMethods: Array.isArray(paymentMethods) ? paymentMethods : [],
      faqs: Array.isArray(faqs) ? faqs : [],
      prizeCarouselContent: prizeCarouselContent,
      infoTicker: infoTicker,
      heroContent: heroContent || {
        _id: '',
        title: 'Sitio en construcción',
        subtitle: 'Próximamente',
        description: 'Estamos trabajando para ofrecerte la mejor experiencia.',
        imageUrl: '/images/placeholder.jpg',
        buttonText: 'Ver más'
      },
    };

    return {
      props: {
        initialData,
      },
    };
  } catch (error) {
    console.error('Error fetching raffle data:', error);
    
    // Return fallback data in case of error
    return {
      props: {
        initialData: {
          raffle: {
            _id: '1',
            name: 'Rifa Los Andes',
            prize: 'Premio Principal',
            totalTickets: 1000,
            ticketPrice: 30,
            drawMethod: 'Lotería',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          tickets: [],
          promotions: [],
          paymentMethods: [],
          faqs: [],
          prizeCarouselContent: null,
          infoTicker: null,
          heroContent: {
            _id: '',
            title: 'Error de conexión',
            subtitle: 'No se pudieron cargar los datos',
            description: 'Hubo un problema al cargar el contenido. Por favor, intenta de nuevo más tarde.',
            imageUrl: '/images/placeholder.jpg',
            buttonText: 'Reintentar'
          },
        },
      },
    };
  }
};
