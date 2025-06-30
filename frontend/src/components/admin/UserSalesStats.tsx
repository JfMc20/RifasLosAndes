import React from 'react';

interface UserSalesProps {
  salesByUser: {
    [userId: string]: {
      username: string;
      name?: string;
      count: number;
      total: number;
    }
  } | null;
  loading?: boolean;
}

export const UserSalesStats: React.FC<UserSalesProps> = ({ 
  salesByUser, 
  loading = false 
}) => {
  // Si está cargando, mostrar un placeholder
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-4">Ventas por usuario</h2>
        <div className="animate-pulse">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex justify-between py-3 border-b border-gray-200">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Si no hay datos de ventas por usuario
  if (!salesByUser || Object.keys(salesByUser).length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-4">Ventas por usuario</h2>
        <div className="text-center py-8 text-gray-500">
          No hay datos de ventas por usuario disponibles
        </div>
      </div>
    );
  }

  // Convertir el objeto en un array y ordenar por total de ventas (monto)
  const salesArray = Object.entries(salesByUser).map(([userId, data]) => ({
    userId,
    ...data
  })).sort((a, b) => b.total - a.total);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200">
        <h2 className="text-lg font-semibold">Ventas por usuario</h2>
      </div>
      <div className="overflow-hidden overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Boletos vendidos
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total vendido
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {salesArray.map((user) => (
              <tr key={user.userId} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {user.name || user.username}
                  </div>
                  {user.name && (
                    <div className="text-xs text-gray-500">
                      {user.username}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                  {user.count}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-brand-accent">
                  ${user.total.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Total
              </td>
              <td className="px-6 py-3 text-center text-xs font-medium text-gray-900">
                {salesArray.reduce((sum, user) => sum + user.count, 0)}
              </td>
              <td className="px-6 py-3 text-right text-xs font-medium text-brand-accent">
                ${salesArray.reduce((sum, user) => sum + user.total, 0).toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default UserSalesStats;
