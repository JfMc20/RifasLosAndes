import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import AdminLayout from '../../../../components/admin/Layout';
import { RaffleService } from '../../../../services/raffle.service';
import { AuthService } from '../../../../services/auth.service';
import { Raffle } from '../../../../types';

const RaffleDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Verificar autenticación
    if (!AuthService.isAuthenticated()) {
      router.push('/admin/login');
      return;
    }

    const fetchRaffle = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await RaffleService.getRaffle(id as string);
        setRaffle(data);
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar los datos de la rifa:', err);
        setError('No se pudo cargar la información de la rifa.');
        setLoading(false);
      }
    };

    if (id) {
      fetchRaffle();
    }
  }, [id, router]);

  return (
    <>
      <Head>
        <title>{raffle ? `Rifa: ${raffle.name}` : 'Detalle de Rifa'}</title>
      </Head>
      <AdminLayout title="Detalle de Rifa">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Detalle de la Rifa</h1>
            <p className="mt-1 text-sm text-gray-500">
              Información detallada de la rifa seleccionada.
            </p>
          </div>
          <Link href="/admin/raffles" passHref>
            <span className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 cursor-pointer">
              Volver a la lista
            </span>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-600">Cargando información...</p>
          </div>
        ) : error ? (
          <div className="rounded-md bg-red-50 p-4 my-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        ) : raffle ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 bg-gray-50">
              <h3 className="text-lg leading-6 font-medium text-gray-900">{raffle.name}</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {raffle.isActive ? (
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Activa
                  </span>
                ) : (
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                    Inactiva
                  </span>
                )}
              </p>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Premio</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{raffle.prize}</dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Precio por boleto</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">${raffle.ticketPrice}</dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Total de boletos</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{raffle.totalTickets}</dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Método de sorteo</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {raffle.drawMethod}
                  </dd>
                </div>
                {raffle.prize && (
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Premio</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{raffle.prize}</dd>
                  </div>
                )}
              </dl>
            </div>
            
            <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 flex justify-end space-x-3">
              <Link href={`/admin/raffles/${raffle._id}/edit`} passHref>
                <span className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer">
                  Editar Rifa
                </span>
              </Link>
              <Link href={`/admin/raffles/${raffle._id}/tickets`} passHref>
                <span className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer">
                  Ver Boletos
                </span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-600">No se encontró la rifa.</p>
          </div>
        )}
      </AdminLayout>
    </>
  );
};

export default RaffleDetailPage;
