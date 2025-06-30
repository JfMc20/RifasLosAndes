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
      <AdminLayout title={raffle ? `Rifa: ${raffle.name}` : 'Detalle de Rifa'}>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-ui-text-primary">Detalle de la Rifa</h1>
            <p className="text-ui-text-secondary mt-1">Información detallada de la rifa seleccionada.</p>
          </div>
          <Link href="/admin/raffles" legacyBehavior>
            <a className="px-5 py-3 border border-ui-border shadow-sm text-sm font-bold rounded-lg text-ui-text-primary bg-ui-surface hover:bg-ui-background focus:outline-none transition-all duration-200">
              Volver a la lista
            </a>
          </Link>
        </div>

        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-accent"></div>
          </div>
        )}

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">{error}</div>}

        {!loading && !error && raffle && (
          <div className="bg-ui-surface rounded-xl shadow-lg border border-ui-border overflow-hidden">
            <div className="p-6 border-b border-ui-border">
              <div className="flex justify-between items-start">
                <h2 className="text-2xl font-bold text-ui-text-primary">{raffle.name}</h2>
                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${raffle.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {raffle.isActive ? 'Activa' : 'Inactiva'}
                </span>
              </div>
              <p className="text-ui-text-secondary mt-1">{raffle.prize}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-ui-border">
              <div className="bg-ui-surface p-6">
                <h3 className="text-sm font-medium text-ui-text-secondary">Precio por Boleto</h3>
                <p className="mt-1 text-2xl font-semibold text-ui-text-primary">${raffle.ticketPrice}</p>
              </div>
              <div className="bg-ui-surface p-6">
                <h3 className="text-sm font-medium text-ui-text-secondary">Total de Boletos</h3>
                <p className="mt-1 text-2xl font-semibold text-ui-text-primary">{raffle.totalTickets}</p>
              </div>
              <div className="bg-ui-surface p-6">
                <h3 className="text-sm font-medium text-ui-text-secondary">Método de Sorteo</h3>
                <p className="mt-1 text-2xl font-semibold text-ui-text-primary">{raffle.drawMethod}</p>
              </div>
            </div>

            <div className="p-6 flex justify-end space-x-4">
              <Link href={`/admin/raffles/${raffle._id}/edit`} legacyBehavior>
                <a className="px-5 py-3 bg-brand-primary text-white rounded-lg font-semibold hover:bg-opacity-90 transition-all duration-200 transform hover:scale-105 shadow-md">Editar Rifa</a>
              </Link>
              <Link href={`/admin/raffles/${raffle._id}/tickets`} legacyBehavior>
                <a className="px-5 py-3 bg-brand-accent text-white rounded-lg font-semibold hover:bg-opacity-90 transition-all duration-200 transform hover:scale-105 shadow-md">Ver Boletos</a>
              </Link>
            </div>
          </div>
        )}

        {!loading && !raffle && (
          <div className="text-center py-10 text-ui-text-secondary">No se encontró la rifa.</div>
        )}
      </AdminLayout>
    </>
  );
};

export default RaffleDetailPage;
