import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

interface TicketStatusChartProps {
  soldTickets: number;
  reservedTickets: number;
  availableTickets: number;
  loading?: boolean;
}

export const TicketStatusChart: React.FC<TicketStatusChartProps> = ({
  soldTickets,
  reservedTickets,
  availableTickets,
  loading = false
}) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: true,
        text: 'Estado de Boletos',
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = soldTickets + reservedTickets + availableTickets;
            const percentage = Math.round((value * 100) / total);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
  };

  // Si está cargando o no hay datos, mostrar un placeholder
  if (loading || (soldTickets === 0 && reservedTickets === 0 && availableTickets === 0)) {
    return (
      <div className="h-64 bg-white p-4 rounded-lg shadow flex items-center justify-center">
        {loading ? (
          <p className="text-gray-500">Cargando datos de boletos...</p>
        ) : (
          <p className="text-gray-500">No hay datos de boletos disponibles</p>
        )}
      </div>
    );
  }

  const data = {
    labels: ['Vendidos', 'Reservados', 'Disponibles'],
    datasets: [
      {
        data: [soldTickets, reservedTickets, availableTickets],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderColor: [
          'rgb(75, 192, 192)',
          'rgb(255, 206, 86)',
          'rgb(153, 102, 255)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="h-64 bg-white p-4 rounded-lg shadow">
      <Doughnut options={options} data={data} />
    </div>
  );
};

export default TicketStatusChart;
