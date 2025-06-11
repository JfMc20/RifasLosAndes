import React from 'react';

interface Transaction {
  _id: string;
  raffleId: string;
  raffleName: string;
  ticketNumbers: string[];
  buyer: {
    name: string;
    phone: string;
    email?: string;
  };
  amount: number;
  paymentMethod: string;
  createdAt: string;
  userId?: string;
  userName?: string;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
  loading?: boolean;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({ 
  transactions, 
  loading = false 
}) => {
  // Formato de fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Si está cargando, mostrar un placeholder
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-4">Transacciones recientes</h2>
        <div className="animate-pulse">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="flex justify-between py-3 border-b border-gray-200">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-16 mt-2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Si no hay transacciones
  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-4">Transacciones recientes</h2>
        <div className="text-center py-8 text-gray-500">
          No hay transacciones recientes para mostrar
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200">
        <h2 className="text-lg font-semibold">Transacciones recientes</h2>
      </div>
      <div className="divide-y divide-gray-200">
        {transactions.map((transaction) => (
          <div key={transaction._id} className="p-4 hover:bg-gray-50">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">{transaction.buyer.name}</p>
                <p className="text-sm text-gray-500">
                  {transaction.ticketNumbers.length} {transaction.ticketNumbers.length === 1 ? 'boleto' : 'boletos'}: {transaction.ticketNumbers.join(', ')}
                </p>
                <div className="flex items-center mt-1 text-xs text-gray-500 space-x-2">
                  <span>{formatDate(transaction.createdAt)}</span>
                  <span>•</span>
                  <span>{transaction.paymentMethod}</span>
                  {transaction.userName && (
                    <>
                      <span>•</span>
                      <span>Vendedor: {transaction.userName}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-primary">${transaction.amount.toLocaleString()}</p>
                <p className="text-xs text-gray-500">{transaction.raffleName}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentTransactions;
