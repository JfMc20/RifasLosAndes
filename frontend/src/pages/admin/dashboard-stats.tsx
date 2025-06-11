import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/admin/Layout';
import { AuthService } from '../../services/auth.service';
import { StatsService } from '../../services/stats.service';
import SalesChart from '../../components/admin/charts/SalesChart';
import TicketStatusChart from '../../components/admin/charts/TicketStatusChart';
import DailyTicketsChart from '../../components/admin/charts/DailyTicketsChart';
import RecentTransactions from '../../components/admin/RecentTransactions';
import UserSalesStats from '../../components/admin/UserSalesStats';

const DashboardStats: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState<any>(null);
  const [raffleId, setRaffleId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [exportLoading, setExportLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    // Verificar autenticación
    if (!AuthService.isAuthenticated()) {
      router.push('/admin/login');
      return;
    }

    const fetchStatsData = async () => {
      try {
        setLoading(true);
        const data = await StatsService.getDashboardStats();
        setStatsData(data);
        setLoading(false);
      } catch (err: any) {
        console.error('Error al cargar estadísticas:', err);
        setError(err.message || 'No se pudieron cargar las estadísticas');
        setLoading(false);
      }
    };

    fetchStatsData();
  }, [router]);

  const handleExportSales = async () => {
    try {
      setExportLoading(true);
      const blob = await StatsService.exportSales({
        raffleId: raffleId || undefined,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });
      
      // Crear un objeto URL para el blob
      const url = window.URL.createObjectURL(blob);
      
      // Crear un enlace temporal para la descarga
      const a = document.createElement('a');
      a.href = url;
      a.download = `ventas_${dateRange.startDate}_${dateRange.endDate}.csv`;
      document.body.appendChild(a);
      a.click();
      
      // Limpiar
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setExportLoading(false);
    } catch (err) {
      console.error('Error al exportar ventas:', err);
      setExportLoading(false);
      alert('No se pudieron exportar los datos de ventas');
    }
  };

  const handleExportTickets = async () => {
    if (!raffleId) {
      alert('Selecciona una rifa para exportar los boletos');
      return;
    }

    try {
      setExportLoading(true);
      const blob = await StatsService.exportTickets(raffleId);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `boletos_rifa_${raffleId}.csv`;
      document.body.appendChild(a);
      a.click();
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setExportLoading(false);
    } catch (err) {
      console.error('Error al exportar boletos:', err);
      setExportLoading(false);
      alert('No se pudieron exportar los datos de boletos');
    }
  };

  return (
    <>
      <Head>
        <title>Estadísticas | Rifa Los Andes</title>
      </Head>
      <AdminLayout title="Estadísticas del Sistema">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando estadísticas...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Reintentar
            </button>
          </div>
        ) : statsData && (
          <div className="space-y-8">
            {/* Resumen general */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 text-green-800">
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Ventas Totales</p>
                    <p className="text-2xl font-semibold text-gray-900">${statsData.totalSales?.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 text-green-800">
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Boletos Vendidos</p>
                    <p className="text-2xl font-semibold text-gray-900">{statsData.soldTickets}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-100 text-yellow-800">
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Ventas Hoy</p>
                    <p className="text-2xl font-semibold text-gray-900">${statsData.todaySales?.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 text-blue-800">
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Ventas del Mes</p>
                    <p className="text-2xl font-semibold text-gray-900">${statsData.monthSales?.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <SalesChart monthlySalesData={statsData.monthlySalesData || []} loading={loading} />
              </div>
              <div>
                <TicketStatusChart 
                  soldTickets={statsData.soldTickets}
                  reservedTickets={statsData.reservedTickets}
                  availableTickets={statsData.availableTickets}
                  loading={loading}
                />
              </div>
            </div>

            <div>
              <DailyTicketsChart dailyTicketData={statsData.dailyTicketData || []} loading={loading} />
            </div>
            
            {/* Exportar datos */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900">Exportar Datos</h3>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fecha Inicial</label>
                  <input 
                    type="date" 
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fecha Final</label>
                  <input 
                    type="date" 
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3 justify-end">
                <button
                  onClick={handleExportSales}
                  disabled={exportLoading}
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark flex items-center disabled:opacity-50"
                >
                  {exportLoading ? 'Exportando...' : 'Exportar Ventas'}
                  <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
                <button
                  onClick={handleExportTickets}
                  disabled={exportLoading || !raffleId}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center disabled:opacity-50"
                >
                  {exportLoading ? 'Exportando...' : 'Exportar Boletos'}
                  <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Transacciones recientes */}
              <div>
                <RecentTransactions transactions={statsData.recentTransactions || []} loading={loading} />
              </div>

              {/* Ventas por usuario */}
              <div>
                <UserSalesStats salesByUser={statsData.salesByUser} loading={loading} />
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </>
  );
};

export default DashboardStats;
