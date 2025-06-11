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

const RafflesPage: React.FC = () => {
  const router = useRouter();
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
  const deleteRaffle = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta rifa? Esta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      setLoading(true);
      await RaffleService.deleteRaffle(id);
      // Actualizar la lista de rifas eliminando la borrada
      setRaffles(raffles.filter((r) => r._id !== id));
      setLoading(false);
      alert('Rifa eliminada correctamente');
    } catch (err) {
      console.error('Error al eliminar la rifa:', err);
      setError('No se pudo eliminar la rifa. Por favor, intenta nuevamente.');
      setLoading(false);
    }
  };

  const initializeTickets = async (raffleId: string) => {
    if (!confirm('¿Estás seguro de que deseas inicializar los boletos para esta rifa? Si ya existen boletos, serán eliminados y recreados.')) {
      return;
    }
    
    try {
      setLoading(true); // Mostrar loading mientras se inicializan
      const result = await TicketService.initializeTickets(raffleId);
      alert(`Boletos inicializados correctamente: ${result.message}`);
      setLoading(false);
    } catch (err: any) {
      console.error('Error al inicializar boletos:', err);
      
      // Si el error es de clave duplicada, mostrar un mensaje más específico
      if (err?.response?.data?.message?.includes('duplicate key error') || 
          err?.response?.data?.message?.includes('E11000')) {
        alert('Error: Ya existen boletos para esta rifa. El sistema intentará eliminarlos y crearlos nuevamente. Por favor intenta nuevamente.');
      } else {
        alert(`No se pudieron inicializar los boletos: ${err?.response?.data?.message || 'Error desconocido'}`);
      }
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Gestión de Rifas - Admin Panel - Rifa Los Andes</title>
      </Head>
      
      <AdminLayout title="Gestión de Rifas">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Rifas</h2>
          <Link href="/admin/raffles/create" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none">
              Crear nueva rifa
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-xl text-gray-600">Cargando rifas...</div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
            <p>{error}</p>
          </div>
        ) : raffles.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <p className="text-gray-600 mb-4">No hay rifas creadas.</p>
            <Link href="/admin/raffles/create" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none">
                Crear primera rifa
            </Link>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Premio
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total boletos
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {raffles.map((raffle) => (
                  <tr key={raffle._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{raffle.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{raffle.prize}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">${raffle.ticketPrice}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{raffle.totalTickets}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        raffle.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {raffle.isActive ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <ActionButtons 
                        actions={[
                          {
                            label: "Ver",
                            href: `/admin/raffles/${raffle._id}`,
                            color: "primary"
                          },
                          {
                            label: "Editar",
                            href: `/admin/raffles/${raffle._id}/edit`,
                            color: "indigo"
                          },
                          {
                            label: "Boletos",
                            href: `/admin/raffles/${raffle._id}/tickets`,
                            color: "blue"
                          },
                          {
                            label: raffle.isActive ? "Desactivar" : "Activar",
                            color: raffle.isActive ? "red" : "green",
                            onClick: () => toggleRaffleStatus(raffle)
                          },
                          {
                            label: "Init. Boletos",
                            color: "yellow",
                            onClick: () => initializeTickets(raffle._id)
                          },
                          {
                            label: "Eliminar",
                            color: "red",
                            onClick: () => deleteRaffle(raffle._id)
                          }
                        ]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminLayout>
    </>
  );
};

export default RafflesPage;
