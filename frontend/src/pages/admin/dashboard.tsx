import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AdminLayout from '../../components/admin/Layout';
import { RaffleService } from '../../services/raffle.service';
import { TicketService, type TicketStatusSummary } from '../../services/ticket.service';
import { AuthService } from '../../services/auth.service';
import { Raffle, TicketStatus, Ticket } from '../../types';
import TicketProgressBar from '../../components/admin/tickets/TicketProgressBar';
import MetricCard from '../../components/admin/dashboard/MetricCard';
import QuickActions from '../../components/admin/dashboard/QuickActions';
import RaffleDetails from '../../components/admin/dashboard/RaffleDetails';

const DashboardPage: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeRaffle, setActiveRaffle] = useState<Raffle | null>(null);
  const [ticketSummary, setTicketSummary] = useState({
    [TicketStatus.AVAILABLE]: 0,
    [TicketStatus.RESERVED]: 0,
    [TicketStatus.SOLD]: 0,
  });
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    // Verificar autenticación
    if (!AuthService.isAuthenticated()) {
      router.push('/admin/login');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Obtener la rifa activa
        const raffleData = await RaffleService.getActiveRaffleDetails();
        console.log('Rifa activa:', raffleData.raffle);
        setActiveRaffle(raffleData.raffle);

        // Si hay una rifa activa, obtener resumen de boletos y todos los tickets
        if (raffleData.raffle && raffleData.raffle._id) {
          // Obtener resumen de estado de tickets
          const summary = await TicketService.getTicketStatusSummary(raffleData.raffle._id);
          console.log('Resumen de tickets (raw):', summary);
          
          // Asegurarse de que el resumen tiene la estructura correcta
          // La interfaz TicketStatusSummary espera las propiedades en inglés
          const formattedSummary: TicketStatusSummary = {
            [TicketStatus.AVAILABLE]: summary[TicketStatus.AVAILABLE] || 0,
            [TicketStatus.RESERVED]: summary[TicketStatus.RESERVED] || 0,
            [TicketStatus.SOLD]: summary[TicketStatus.SOLD] || 0
          };
          
          console.log('Resumen formateado:', formattedSummary);
          setTicketSummary(formattedSummary);
          
          // Obtener todos los tickets para la barra de progreso
          const allTickets = await TicketService.getAllTickets(raffleData.raffle._id);
          
          // Contar boletos por estado para verificar si coincide con el resumen
          const soldCount = allTickets.filter(t => t.status === TicketStatus.SOLD).length;
          const reservedCount = allTickets.filter(t => t.status === TicketStatus.RESERVED).length;
          const availableCount = allTickets.filter(t => t.status === TicketStatus.AVAILABLE).length;
          
          console.log('Conteo desde tickets:', {
            sold: soldCount,
            reserved: reservedCount,
            available: availableCount
          });
          
          // Si hay discrepancia, usar el conteo real de tickets
          if (soldCount > 0 && formattedSummary[TicketStatus.SOLD] === 0) {
            console.log('Corrigiendo resumen basado en el conteo real de tickets');
            formattedSummary[TicketStatus.SOLD] = soldCount;
            formattedSummary[TicketStatus.RESERVED] = reservedCount;
            formattedSummary[TicketStatus.AVAILABLE] = availableCount;
            setTicketSummary({...formattedSummary});
          }
          
          console.log('Todos los tickets:', allTickets.length, 'Precio del boleto:', raffleData.raffle.ticketPrice);
          console.log('Ingresos esperados:', formattedSummary[TicketStatus.SOLD] * raffleData.raffle.ticketPrice);
          setTickets(allTickets);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error al cargar datos del dashboard:', err);
        setError('No se pudo cargar la información. Por favor, intenta nuevamente.');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  // Calcular porcentajes y valores monetarios
  const totalTickets = activeRaffle?.totalTickets || 0;
  const ticketPrice = activeRaffle?.ticketPrice || 0;
  
  const soldCount = ticketSummary[TicketStatus.SOLD] || 0;
  const reservedCount = ticketSummary[TicketStatus.RESERVED] || 0;
  const availableCount = ticketSummary[TicketStatus.AVAILABLE] || 0;
  
  const soldPercentage = totalTickets > 0 
    ? ((soldCount / totalTickets) * 100).toFixed(1) 
    : '0';
  
  const reservedPercentage = totalTickets > 0 
    ? ((reservedCount / totalTickets) * 100).toFixed(1) 
    : '0';
  
  const availablePercentage = totalTickets > 0 
    ? ((availableCount / totalTickets) * 100).toFixed(1) 
    : '0';
    
  // Calcular ingresos
  const totalRecaudado = soldCount * ticketPrice;
  const proyeccionPendiente = reservedCount * ticketPrice;
  const proyeccionTotal = totalTickets * ticketPrice;
  
  // Log para debug
  console.log('Valores calculados:');
  console.log('- Boletos vendidos:', soldCount);
  console.log('- Precio por boleto:', ticketPrice);
  console.log('- Total recaudado:', totalRecaudado);

  return (
    <AdminLayout title="Dashboard">
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-brand-accent"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-3 rounded-lg" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {!loading && !error && !activeRaffle && (
        <div className="bg-ui-surface text-center p-12 rounded-xl shadow-lg border border-ui-border flex flex-col items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-brand-accent mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
          <h2 className="text-2xl font-bold text-ui-text-primary">No hay ninguna rifa activa</h2>
          <p className="text-ui-text-secondary mt-2 mb-6">Para empezar a vender boletos, primero debes crear y activar una rifa.</p>
          <Link href="/admin/raffles/create" legacyBehavior>
            <a className="px-6 py-3 bg-brand-primary text-white rounded-lg font-bold hover:bg-brand-primary-dark transition-all duration-200 transform hover:scale-105 shadow-lg">
              Crear mi primera Rifa
            </a>
          </Link>
        </div>
      )}

      {!loading && !error && activeRaffle && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna Principal (2/3) */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-ui-surface shadow-lg rounded-xl p-6 border border-ui-border">
              <h2 className="text-2xl font-bold text-ui-text-primary mb-4">Progreso de Ventas</h2>
              <TicketProgressBar tickets={tickets} totalTickets={activeRaffle.totalTickets} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricCard
                title="Total Recaudado"
                value={`$${totalRecaudado.toLocaleString()}`}
                footerText={`${soldCount} boletos vendidos`}
                icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                iconBgColor="bg-green-500/20"
                iconColor="text-green-600"
              />
              <MetricCard
                title="Proyección Pendiente"
                value={`$${proyeccionPendiente.toLocaleString()}`}
                footerText={`${reservedCount} boletos reservados`}
                icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                iconBgColor="bg-yellow-500/20"
                iconColor="text-yellow-600"
              />
              <MetricCard
                title="Proyección Total"
                value={`$${proyeccionTotal.toLocaleString()}`}
                footerText="Meta final"
                icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                iconBgColor="bg-blue-500/20"
                iconColor="text-blue-600"
              />
            </div>
          </div>

          {/* Columna Lateral (1/3) */}
          <div className="lg:col-span-1 space-y-8">
            <RaffleDetails raffle={activeRaffle} />
            <QuickActions raffleId={activeRaffle._id} />
          </div>
        </div>
      )} 
    </AdminLayout>
  );
};

export default DashboardPage;