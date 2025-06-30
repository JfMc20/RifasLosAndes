import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import AdminLayout from '../../../components/admin/Layout';
import { RaffleService } from '../../../services/raffle.service';
import { TicketService } from '../../../services/ticket.service';
import { AuthService } from '../../../services/auth.service';
import { Raffle } from '../../../types';
import ActionButtons from '../../../components/admin/common/ActionButtons';
import { NotificationService } from '../../../services/notification.service';
import ConfirmationModal from '../../../components/admin/common/ConfirmationModal';
import Pagination from '../../../components/admin/common/Pagination'; // Importar Pagination

const RAFFLES_PER_PAGE = 10; // O el valor que prefieras

const RafflesPage: React.FC = () => {
  const router = useRouter();
  // const [allRaffles, setAllRaffles] = useState<Raffle[]>([]); // Ya no es necesario si el backend pagina
  const [displayedRaffles, setDisplayedRaffles] = useState<Raffle[]>([]); // Rifas para la página actual

  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false); // Para acciones individuales, no para carga de página
  const [error, setError] = useState('');

  // Estado de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRaffles, setTotalRaffles] = useState(0);

  // Estado para el modal de confirmación
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<{ title: string; message: string; onConfirm: () => void; confirmText?: string; confirmButtonColor?: string; }>({
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const fetchRafflesData = useCallback(async (pageToFetch: number) => {
    setLoading(true);
    setError('');
    try {
      const response = await RaffleService.getAllRaffles(pageToFetch, RAFFLES_PER_PAGE);
      setDisplayedRaffles(response.data);
      setTotalRaffles(response.totalItems);
      setTotalPages(response.totalPages);
      setCurrentPage(response.currentPage);
    } catch (err) {
      console.error('Error al cargar rifas:', err);
      setError('No se pudieron cargar las rifas. Por favor, intenta nuevamente.');
      setDisplayedRaffles([]);
      setTotalRaffles(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, []); // useCallback para evitar re-creación

  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      router.push('/admin/login');
      return;
    }
    fetchRafflesData(currentPage);
  }, [router, currentPage, fetchRafflesData]);

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber !== currentPage) {
      setCurrentPage(pageNumber); // Esto disparará el useEffect para cargar nuevos datos
      window.scrollTo(0, 0);
    }
  };

  // Refresca los datos de la página actual (ej. después de una actualización)
  const refreshCurrentPageData = () => {
    fetchRafflesData(currentPage);
  };

  const toggleRaffleStatus = async (raffle: Raffle) => {
    try {
      setIsProcessing(true);
      const updatedRaffle = await RaffleService.updateRaffle(raffle._id, {
        ...raffle,
        isActive: !raffle.isActive
      });
      // Actualizar solo el item modificado en displayedRaffles si aún está en la página actual
      // O mejor, recargar los datos de la página actual para consistencia.
      refreshCurrentPageData();
      NotificationService.success(`Rifa "${updatedRaffle.name}" ${updatedRaffle.isActive ? 'activada' : 'desactivada'}.`);
    } catch (err) {
      console.error('Error al actualizar estado de rifa:', err);
      NotificationService.error('No se pudo actualizar el estado de la rifa.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Función para eliminar una rifa
  const handleDeleteRaffle = (id: string) => {
    setModalContent({
      title: 'Confirmar Eliminación',
      message: '¿Estás seguro de que deseas eliminar esta rifa? Esta acción no se puede deshacer y también eliminará todos los boletos asociados.',
      confirmText: 'Eliminar Rifa',
      confirmButtonColor: 'bg-brand-danger hover:bg-brand-danger-dark',
      onConfirm: async () => {
        setIsModalOpen(false);
        setIsProcessing(true);
        try {
          await RaffleService.deleteRaffle(id);
          NotificationService.success('Rifa eliminada correctamente');
          // Volver a cargar los datos para la página actual o la anterior si la actual queda vacía
          if (displayedRaffles.length === 1 && currentPage > 1) {
            setCurrentPage(currentPage - 1); // Esto disparará el useEffect
          } else {
            fetchRafflesData(currentPage); // Recargar página actual
          }
        } catch (err) {
          console.error('Error al eliminar la rifa:', err);
          NotificationService.error('No se pudo eliminar la rifa. Por favor, intenta nuevamente.');
        } finally {
          setIsProcessing(false);
        }
      },
    });
    setIsModalOpen(true);
  };

  const handleInitializeTickets = (raffleId: string, raffleName: string) => {
    setModalContent({
      title: `Inicializar Boletos para "${raffleName}"`,
      message: '¿Estás seguro de que deseas inicializar los boletos para esta rifa? Si ya existen boletos, serán eliminados y recreados. Esta acción es irreversible.',
      confirmText: 'Sí, Inicializar Boletos',
      confirmButtonColor: 'bg-yellow-500 hover:bg-yellow-600',
      onConfirm: async () => {
        setIsModalOpen(false);
        setIsProcessing(true);
        try {
          const result = await TicketService.initializeTickets(raffleId);
          NotificationService.success(`Boletos inicializados para "${raffleName}"`, result.message);
        } catch (err: any) {
          console.error('Error al inicializar boletos:', err);
          if (err?.response?.data?.message?.includes('duplicate key error') ||
              err?.response?.data?.message?.includes('E11000')) {
            NotificationService.error('Error: Ya existen boletos para esta rifa.', 'El sistema intentó eliminarlos y crearlos nuevamente sin éxito. Contacte a soporte si el problema persiste.');
          } else {
            NotificationService.error('No se pudieron inicializar los boletos', err?.response?.data?.message || 'Error desconocido');
          }
        } finally {
          setIsProcessing(false);
        }
      },
    });
    setIsModalOpen(true);
  };

  return (
    <>
      <Head>
        <title>Gestión de Rifas - Admin Panel - Rifa Los Andes</title>
      </Head>
      
      <AdminLayout title="Gestión de Rifas">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-ui-text-primary">Tus Rifas</h1>
            <p className="text-ui-text-secondary mt-1">Crea, gestiona y visualiza todas tus rifas desde aquí.</p>
          </div>
          <Link href="/admin/raffles/create" legacyBehavior>
            <a className="flex items-center justify-center px-5 py-3 bg-brand-primary text-white rounded-lg font-bold hover:bg-brand-primary-dark transition-all duration-200 transform hover:scale-105 shadow-lg">
              Crear Nueva Rifa
            </a>
          </Link>
        </div>

        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-brand-accent"></div>
          </div>
        )}

        {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-3 rounded-lg relative" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
            </div>
        )}

        {!loading && !error && displayedRaffles.length === 0 && (
           <div className="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19V8.5a1.5 1.5 0 00-3 0V19m0 0h-2m2 0h2M9 19V8.5a1.5 1.5 0 00-3 0V19m0 0h-2m2 0h2" /> {/* Icono más representativo */}
            </svg>
            <h3 className="mt-2 text-lg font-medium text-ui-text-primary">No hay rifas creadas</h3>
            <p className="mt-1 text-sm text-ui-text-secondary">
              Empieza creando tu primera rifa.
            </p>
          </div>
        )}

        {!loading && !error && displayedRaffles.length > 0 && (
          <>
            <div className="overflow-x-auto bg-ui-surface rounded-xl shadow-lg border border-ui-border">
              <table className="min-w-full divide-y divide-ui-border">
                <thead className="bg-ui-background">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-ui-text-secondary uppercase tracking-wider">Nombre</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-ui-text-secondary uppercase tracking-wider">Premio</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-ui-text-secondary uppercase tracking-wider">Precio</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-ui-text-secondary uppercase tracking-wider">Total Boletos</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-ui-text-secondary uppercase tracking-wider">Estado</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-ui-text-secondary uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-ui-surface divide-y divide-ui-border">
                  {displayedRaffles.map((raffle) => (
                    <tr key={raffle._id} className="hover:bg-ui-background transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-ui-text-primary">{raffle.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-ui-text-secondary">{raffle.prize}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-ui-text-secondary">${raffle.ticketPrice}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-ui-text-secondary">{raffle.totalTickets}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${raffle.isActive ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                          {raffle.isActive ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Link href={`/admin/raffles/${raffle._id}`} legacyBehavior><a className="px-3 py-1 rounded-md bg-brand-accent/20 text-brand-accent font-bold hover:bg-brand-accent/30 transition">Ver</a></Link>
                        <Link href={`/admin/raffles/${raffle._id}/edit`} legacyBehavior><a className="px-3 py-1 rounded-md bg-blue-500/20 text-blue-500 font-bold hover:bg-blue-500/30 transition">Editar</a></Link>
                        <button onClick={() => toggleRaffleStatus(raffle)} className={`px-3 py-1 rounded-md font-bold transition ${raffle.isActive ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-green-500/20 text-green-500 hover:bg-green-500/30'}`}>{raffle.isActive ? 'Desactivar' : 'Activar'}</button>
                        <button onClick={() => handleInitializeTickets(raffle._id, raffle.name)} className="px-3 py-1 rounded-md bg-yellow-500/20 text-yellow-500 font-bold hover:bg-yellow-500/30 transition">Init. Boletos</button>
                        <button onClick={() => handleDeleteRaffle(raffle._id)} className="px-3 py-1 rounded-md bg-brand-danger/20 text-brand-danger font-bold hover:bg-brand-danger/30 transition">Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={totalRaffles}
              itemsPerPage={RAFFLES_PER_PAGE}
              itemName="rifas"
            />
          </>
        )}
        <ConfirmationModal
          isOpen={isModalOpen}
          title={modalContent.title}
          message={modalContent.message}
          onConfirm={modalContent.onConfirm}
          onCancel={() => setIsModalOpen(false)}
          confirmText={modalContent.confirmText}
          confirmButtonColor={modalContent.confirmButtonColor}
          isConfirming={isProcessing}
        />
      </AdminLayout>
    </>
  );
};

export default RafflesPage;
