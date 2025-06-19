import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AdminLayout from '../../components/admin/Layout';
import { RaffleService } from '../../services/raffle.service';
import { TicketService, type TicketStatusSummary } from '../../services/ticket.service';
import { AuthService } from '../../services/auth.service';
import { Raffle, TicketStatus, Ticket } from '../../types';
// Importamos el componente de barra de progreso de tickets
import TicketProgressBar from '../../components/admin/tickets/TicketProgressBar';

const Dashboard: React.FC = () => {
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
    <>
      <Head>
        <title>Dashboard | Rifa Los Andes Admin</title>
      </Head>
      <AdminLayout title="Dashboard">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando información...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Reintentar
            </button>
          </div>
        ) : !activeRaffle ? (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
            <p>No hay una rifa activa en este momento.</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Rifa Activa: {activeRaffle.name}</h2>
              <Link 
                href="/admin/dashboard-stats"
                className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Ver estadísticas
              </Link>
            </div>
            <div className="mb-6"></div>
            <TicketProgressBar tickets={tickets} totalTickets={activeRaffle.totalTickets || 0} />
            
            {/* Componente de ingresos por ventas */}
            <div className="mb-8 p-4 bg-white shadow-md rounded-lg">
              <h3 className="text-lg font-medium mb-3">Ingresos por Ventas</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <p className="text-sm text-blue-800 font-medium">Total Recaudado</p>
                  <p className="text-2xl font-bold text-blue-900">
                    ${totalRecaudado.toLocaleString()}
                  </p>
                  <p className="text-xs text-blue-700 mt-1">{soldCount} boletos vendidos</p>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                  <p className="text-sm text-yellow-800 font-medium">Proyección Pendiente</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    ${proyeccionPendiente.toLocaleString()}
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">{reservedCount} boletos reservados</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <p className="text-sm text-green-800 font-medium">Proyección Total</p>
                  <p className="text-2xl font-bold text-green-900">
                    ${proyeccionTotal.toLocaleString()}
                  </p>
                  <p className="text-xs text-green-700 mt-1">Si se venden todos los boletos</p>
                </div>
              </div>
              
              {/* Barra de progreso de recaudación */}
              <div className="mt-4">
                <div className="flex justify-between items-center text-sm mb-1">
                  <span>Progreso de recaudación</span>
                  <span>
                    ${totalRecaudado.toLocaleString()} de ${proyeccionTotal.toLocaleString()}
                  </span>
                </div>
                <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500" 
                    style={{ width: `${proyeccionTotal > 0 ? (totalRecaudado / proyeccionTotal * 100) : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            {/* Acciones Rápidas */}
            <div className="bg-white shadow rounded-lg p-4 mb-4">
              <div className="flex justify-center md:justify-end items-center gap-4">
                <Link 
                  href={`/admin/raffles/${activeRaffle._id}/edit`} 
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Editar Rifa
                </Link>
                <Link 
                  href={`/admin/raffles/${activeRaffle._id}/tickets`} 
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition duration-200 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                  Gestionar Boletos
                </Link>
              </div>
            </div>
          </>
        )}
      </AdminLayout>
    </>
  );
};

export default Dashboard;
