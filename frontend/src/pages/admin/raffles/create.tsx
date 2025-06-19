import React from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminLayout from '../../../components/admin/Layout';
import RaffleForm from '../../../components/admin/RaffleForm';
import { RaffleService } from '../../../services/raffle.service';
import { TicketService } from '../../../services/ticket.service';
import { AuthService } from '../../../services/auth.service';
import { Raffle, Promotion } from '../../../types';

const CreateRaffle: React.FC = () => {
  const router = useRouter();

  // Verificar autenticación
  React.useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      router.push('/admin/login');
    }
  }, [router]);

  // Manejar la creación de una nueva rifa
  const handleCreateRaffle = async (
    raffleData: Partial<Raffle>,
    promotions: Partial<Promotion>[]
  ) => {
    try {
      // Asegurar que todos los campos requeridos estén presentes
      const raffleToCreate: Omit<Raffle, '_id'> = {
        name: raffleData.name || 'Nueva Rifa',
        prize: raffleData.prize || 'Premio por definir',
        totalTickets: raffleData.totalTickets || 1000,
        ticketPrice: raffleData.ticketPrice || 100,
        drawMethod: raffleData.drawMethod || 'sorteo',
        isActive: raffleData.isActive || false,
        ...raffleData // Sobrescribir con los valores proporcionados
      };
      
      // Crear la rifa
      const newRaffle = await RaffleService.createRaffle(raffleToCreate);
      
      // Crear las promociones asociadas a la rifa
      if (newRaffle._id && promotions.length > 0) {
        await Promise.all(
          promotions.map(promotion => {
            // Asegurar que todos los campos requeridos estén presentes
            const promotionToCreate: Omit<Promotion, '_id'> = {
              quantity: promotion.quantity || 1,
              price: promotion.price || 0,
              description: promotion.description || '',
              raffle: newRaffle._id,
              // Filtramos solo las propiedades permitidas, eliminando regularPrice y discount
              ...Object.keys(promotion)
                .filter(key => ['quantity', 'price', 'description', 'raffle'].includes(key))
                .reduce((obj, key) => ({ ...obj, [key]: promotion[key] }), {})
            };
            
            return RaffleService.createPromotion(promotionToCreate);
          })
        );
      }
      
      // Inicializar boletos para la nueva rifa
      await TicketService.initializeTickets(newRaffle._id);
      
      // Redireccionar a la lista de rifas
      router.push('/admin/raffles');
    } catch (error) {
      console.error('Error al crear rifa:', error);
      throw error;
    }
  };

  return (
    <>
      <Head>
        <title>Crear Rifa - Admin Panel - Rifa Los Andes</title>
      </Head>
      
      <AdminLayout title="Crear Nueva Rifa">
        <RaffleForm onSubmit={handleCreateRaffle} />
      </AdminLayout>
    </>
  );
};

export default CreateRaffle;
