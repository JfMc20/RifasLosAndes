import React, { useEffect, useState } from 'react';
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
import ConfirmationModal from '../../../components/admin/common/ConfirmationModal'; // Importar ConfirmationModal

const RafflesPage: React.FC = () => {
  const router = useRouter();
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [loading, setLoading] = useState(true); // Para carga general de la página
  const [isProcessing, setIsProcessing] = useState(false); // Para acciones específicas como eliminar/inicializar
  const [error, setError] = useState('');

  // Estado para el modal de confirmación
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<{ title: string; message: string; onConfirm: () => void; confirmText?: string; confirmButtonColor?: string; }>({
    title: '',
    message: '',
    onConfirm: () => {},
  });

  useEffect(() => {
    // Verificar autenticación
    if (!AuthService.isAuthenticated()) {
      router.push('/admin/login');
      return;
    }

    const fetchRaffles = async () => {
      try {
        setLoading(true);
        const response = await RaffleService.getAllRaffles();
        // Ensure we have an array of raffles
        if (Array.isArray(response)) {
          setRaffles(response);
        } else {
          // If we don't get an array (like in demo mode), set an empty array
          console.warn('Expected array of raffles but got:', response);
          setRaffles([]);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar rifas:', err);
        setError('No se pudieron cargar las rifas. Por favor, intenta nuevamente.');
        setLoading(false);
      }
    };

    fetchRaffles();
  }, [router]);

  const toggleRaffleStatus = async (raffle: Raffle) => {
    try {
      await RaffleService.updateRaffle(raffle._id, {
        ...raffle,
        isActive: !raffle.isActive
      });
      
      // Actualizar la lista de rifas
      setRaffles(raffles.map((r) => 
        r._id === raffle._id ? { ...r, isActive: !r.isActive } : r
      ));
    } catch (err) {
      console.error('Error al actualizar estado de rifa:', err);
      setError('No se pudo actualizar el estado de la rifa.');
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
          setRaffles(raffles.filter((r) => r._id !== id));
          NotificationService.success('Rifa eliminada correctamente');
        } catch (err) {
          console.error('Error al eliminar la rifa:', err);
          NotificationService.error('No se pudo eliminar la rifa. Por favor, intenta nuevamente.');
          // Considerar si setError es necesario aquí o si el toast es suficiente
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

        {!loading && !error && (
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
                {raffles.map((raffle) => (
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
