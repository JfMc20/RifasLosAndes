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
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-accent"></div>
          </div>
        )}

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{error}</div>}

        {!loading && !error && statsData && (
          <div className="space-y-8">
            {/* Métricas clave */}
            <div className="bg-ui-surface p-6 rounded-xl shadow-lg border border-ui-border">
              <h3 className="text-2xl font-bold text-ui-text-primary mb-4">Resumen General</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-ui-background rounded-lg border border-ui-border">
                  <p className="text-sm font-medium text-ui-text-secondary">Total Vendido</p>
                  <p className="text-3xl font-bold text-green-500">${statsData.totalSales?.toLocaleString()}</p>
                </div>
                <div className="p-6 bg-ui-background rounded-lg border border-ui-border">
                  <p className="text-sm font-medium text-ui-text-secondary">Boletos Vendidos</p>
                  <p className="text-3xl font-bold text-blue-500">{statsData.soldTickets?.toLocaleString()}</p>
                </div>
                <div className="p-6 bg-ui-background rounded-lg border border-ui-border">
                  <p className="text-sm font-medium text-ui-text-secondary">Ventas del Mes</p>
                  <p className="text-3xl font-bold text-brand-accent">${statsData.monthSales?.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-ui-surface p-6 rounded-xl shadow-lg border border-ui-border">
                <h3 className="text-xl font-bold text-ui-text-primary mb-4">Ventas Mensuales</h3>
                <SalesChart monthlySalesData={statsData.monthlySalesData || []} loading={loading} />
              </div>
              <div className="bg-ui-surface p-6 rounded-xl shadow-lg border border-ui-border">
                <h3 className="text-xl font-bold text-ui-text-primary mb-4">Estado de Boletos</h3>
                <TicketStatusChart 
                  soldTickets={statsData.soldTickets}
                  reservedTickets={statsData.reservedTickets}
                  availableTickets={statsData.availableTickets}
                  loading={loading}
                />
              </div>
            </div>

            <div className="bg-ui-surface p-6 rounded-xl shadow-lg border border-ui-border">
              <h3 className="text-xl font-bold text-ui-text-primary mb-4">Boletos Vendidos por Día</h3>
              <DailyTicketsChart dailyTicketData={statsData.dailyTicketData || []} loading={loading} />
            </div>
            
            {/* Exportar datos */}
            <div className="bg-ui-surface p-6 rounded-xl shadow-lg border border-ui-border">
              <h3 className="text-xl font-bold text-ui-text-primary mb-4">Exportar Datos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <label className="block text-sm font-medium text-ui-text-secondary mb-1">Fecha Inicial</label>
                  <input 
                    type="date" 
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                    className="mt-1 block w-full p-3 bg-ui-background border border-ui-border rounded-lg focus:ring-brand-accent focus:border-brand-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ui-text-secondary mb-1">Fecha Final</label>
                  <input 
                    type="date" 
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                    className="mt-1 block w-full p-3 bg-ui-background border border-ui-border rounded-lg focus:ring-brand-accent focus:border-brand-accent"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-4 justify-end">
                <button
                  onClick={handleExportSales}
                  disabled={exportLoading}
                  className="flex items-center justify-center px-5 py-3 bg-brand-primary text-white rounded-lg font-semibold hover:bg-opacity-90 transition-all duration-200 transform hover:scale-105 shadow-md disabled:opacity-50"
                >
                  {exportLoading ? 'Exportando...' : 'Exportar Ventas'}
                  <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                </button>
                <button
                  onClick={handleExportTickets}
                  disabled={exportLoading || !raffleId}
                  className="flex items-center justify-center px-5 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 shadow-md disabled:opacity-50"
                >
                  {exportLoading ? 'Exportando...' : 'Exportar Boletos'}
                  <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-ui-surface p-6 rounded-xl shadow-lg border border-ui-border">
                <h3 className="text-xl font-bold text-ui-text-primary mb-4">Transacciones Recientes</h3>
                <RecentTransactions transactions={statsData.recentTransactions || []} loading={loading} />
              </div>
              <div className="bg-ui-surface p-6 rounded-xl shadow-lg border border-ui-border">
                <h3 className="text-xl font-bold text-ui-text-primary mb-4">Ventas por Usuario</h3>
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
