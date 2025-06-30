import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { TicketService } from '../services/ticket.service';
import { Ticket, TicketStatus } from '../types';
import { NextPage } from 'next';
import Head from 'next/head';

// Define a more specific type for the verified ticket
type VerifiedTicket = Ticket & {
  raffle: {
    name: string;
    prize: string;
  };
};

const VerifyTicketPage: NextPage = () => {
  const router = useRouter();
  const { ticketId } = router.query;

  const [ticket, setTicket] = useState<VerifiedTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ticketId && typeof ticketId === 'string') {
      const fetchTicket = async () => {
        try {
          setLoading(true);
          const response = await TicketService.verifyTicket(ticketId);
          setTicket(response.data);
          setError(null);
        } catch (err: any) {
          setError(err.message || 'No se pudo verificar el boleto.');
          setTicket(null);
        } finally {
          setLoading(false);
        }
      };
      fetchTicket();
    } else if (router.isReady) {
        setLoading(false);
        setError('No se proporcionó un ID de boleto.');
    }
  }, [ticketId, router.isReady]);

  const getStatusChip = (status: TicketStatus) => {
    const baseClasses = 'px-4 py-1 text-sm font-bold text-white rounded-full shadow-md';
    switch (status) {
      case TicketStatus.SOLD:
        return `${baseClasses} bg-green-500`;
      case TicketStatus.RESERVED:
        return `${baseClasses} bg-yellow-500`;
      default:
        return `${baseClasses} bg-gray-500`;
    }
  };

  return (
    <>
      <Head>
        <title>Verificar Boleto - Rifas Los Andes</title>
      </Head>
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-xl shadow-lg">
          <h1 className="text-2xl font-bold text-center text-gray-800">Verificación de Boleto</h1>
          
          {loading && <p className="text-center text-gray-600 animate-pulse">Verificando...</p>}
          
          {error && (
            <div className="p-4 text-center text-red-800 bg-red-100 border border-red-400 rounded-lg">
              <p className="font-bold">Error de Verificación</p>
              <p>{error}</p>
            </div>
          )}

          {ticket && (
            <div className="space-y-4">
              <div className={`flex items-center justify-between p-4 border-2 ${ticket.status === TicketStatus.SOLD ? 'border-green-500' : 'border-yellow-500'} rounded-lg`}>
                <h2 className={`text-lg font-bold ${ticket.status === TicketStatus.SOLD ? 'text-green-600' : 'text-yellow-600'}`}>Boleto {ticket.status === TicketStatus.SOLD ? 'Válido' : 'Reservado'}</h2>
                <div className={getStatusChip(ticket.status)}>
                  {ticket.status.toUpperCase()}
                </div>
              </div>
              <div className="p-4 border rounded-lg bg-gray-50">
                <p className="text-5xl font-bold text-center text-indigo-600">#{ticket.number}</p>
              </div>
              <div className="p-4 space-y-3 border rounded-lg">
                <div>
                  <p className="text-xs text-gray-500">Rifa</p>
                  <p className="font-bold">{ticket.raffle.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Premio</p>
                  <p className="font-bold">{ticket.raffle.prize}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Comprador</p>
                  <p className="font-bold">{ticket.buyerName}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default VerifyTicketPage;
