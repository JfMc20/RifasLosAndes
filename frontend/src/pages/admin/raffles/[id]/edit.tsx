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
          // Crear nueva promoción
          await RaffleService.createPromotion({
            ...promo,
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
      
      <AdminLayout title="Editar Rifa">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-xl text-gray-600">Cargando información de la rifa...</div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
            <p>{error}</p>
            <button
              onClick={() => router.push('/admin/raffles')}
              className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none"
            >
              Volver a Rifas
            </button>
          </div>
        ) : raffle ? (
          <RaffleForm
            initialRaffle={raffle}
            initialPromotions={promotions}
            isEditing={true}
            onSubmit={handleUpdateRaffle}
          />
        ) : (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
            <p>No se encontró la rifa solicitada.</p>
            <button
              onClick={() => router.push('/admin/raffles')}
              className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none"
            >
              Volver a Rifas
            </button>
          </div>
        )}
      </AdminLayout>
    </>
  );
};

export default EditRafflePage;
