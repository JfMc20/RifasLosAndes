import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminLayout from '../../../../components/admin/Layout';
import RaffleForm from '../../../../components/admin/RaffleForm';
import { RaffleService } from '../../../../services/raffle.service';
import { AuthService } from '../../../../services/auth.service';
import { Raffle, Promotion } from '../../../../types';

const EditRafflePage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Verificar autenticación
  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      router.push('/admin/login');
      return;
    }

    // Cargar datos de la rifa
    const fetchRaffleData = async () => {
      if (!id || typeof id !== 'string') return;

      try {
        setLoading(true);
        setError('');

        // Obtener la rifa
        const raffleData = await RaffleService.getRaffle(id);
        setRaffle(raffleData);

        // Obtener promociones de la rifa
        const rafflePromotions = await RaffleService.getRafflePromotions(id);
        setPromotions(rafflePromotions);

        setLoading(false);
      } catch (err: any) {
        console.error('Error al cargar datos de la rifa:', err);
        setError(err.response?.data?.message || 'Error al cargar la información de la rifa');
        setLoading(false);
      }
    };

    if (id) {
      fetchRaffleData();
    }
  }, [id, router]);

  // Manejar la actualización de la rifa
  const handleUpdateRaffle = async (
    raffleData: Partial<Raffle>,
    promotionsData: Partial<Promotion>[]
  ) => {
    if (!id || typeof id !== 'string' || !raffle) {
      setError('ID de rifa inválido');
      return;
    }

    try {
      // Actualizar la rifa
      await RaffleService.updateRaffle(id, raffleData);

      // Actualizar promociones existentes y crear nuevas
      for (const promo of promotionsData) {
        if (promo._id) {
          // Actualizar promoción existente
          await RaffleService.updatePromotion(promo._id, promo);
        } else {
          // Crear nueva promoción - asegurando que quantity tenga un valor por defecto
          await RaffleService.createPromotion({
            quantity: 1, // Valor por defecto
            price: 0,    // Valores por defecto requeridos
            regularPrice: 0,
            discount: 0,
            description: '',
            ...promo,    // Sobrescribir con los valores proporcionados
            raffle: id
          });
        }
      }

      // Eliminar promociones que ya no existen
      const existingPromoIds = promotions.map(p => p._id);
      const updatedPromoIds = promotionsData
        .filter(p => p._id)
        .map(p => p._id);
      
      const deletedPromoIds = existingPromoIds.filter(
        id => !updatedPromoIds.includes(id)
      );
      
      for (const promoId of deletedPromoIds) {
        if (promoId) {
          await RaffleService.deletePromotion(promoId);
        }
      }

      // Redireccionar a la lista de rifas
      router.push('/admin/raffles');
    } catch (error) {
      console.error('Error al actualizar rifa:', error);
      throw error;
    }
  };

  return (
    <>
      <Head>
        <title>Editar Rifa - Admin Panel - Rifa Los Andes</title>
      </Head>
      
      <AdminLayout title={raffle ? `Editando: ${raffle.name}` : 'Editar Rifa'}>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-ui-text-primary">Editar Rifa</h1>
          <p className="text-ui-text-secondary mt-1">Modifica los detalles de la rifa y sus promociones.</p>
        </div>

        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-accent"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
            <button
              onClick={() => router.push('/admin/raffles')}
              className="mt-4 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              Volver a la lista
            </button>
          </div>
        )}

        {!loading && !error && raffle ? (
          <RaffleForm
            initialRaffle={raffle}
            initialPromotions={promotions}
            isEditing={true}
            onSubmit={handleUpdateRaffle}
          />
        ) : (
          !loading && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg relative" role="alert">
              <strong className="font-bold">Aviso:</strong>
              <span className="block sm:inline"> No se encontró la rifa solicitada.</span>
              <button
                onClick={() => router.push('/admin/raffles')}
                className="mt-4 px-4 py-2 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition-colors duration-200"
              >
                Volver a la lista
              </button>
            </div>
          )
        )}
      </AdminLayout>
    </>
  );
};

export default EditRafflePage;
