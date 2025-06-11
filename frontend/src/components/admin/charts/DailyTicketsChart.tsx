import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface DailyTicketData {
  date: string;
  sold: number;
  reserved: number;
}

interface DailyTicketsChartProps {
  dailyTicketData: DailyTicketData[];
  loading?: boolean;
}

export const DailyTicketsChart: React.FC<DailyTicketsChartProps> = ({ 
  dailyTicketData, 
  loading = false 
}) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Tendencia de Boletos Diarios',
        font: {
          size: 16,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Cantidad de Boletos',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Fecha',
        },
      },
    },
  };

  // Si está cargando o no hay datos, mostrar un placeholder
  if (loading || !dailyTicketData || dailyTicketData.length === 0) {
    return (
      <div className="h-64 bg-white p-4 rounded-lg shadow flex items-center justify-center">
        {loading ? (
          <p className="text-gray-500">Cargando datos diarios...</p>
        ) : (
          <p className="text-gray-500">No hay datos diarios disponibles</p>
        )}
      </div>
    );
  }

  // Formatear las fechas para mostrar solo día y mes
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  const data = {
    labels: dailyTicketData.map(item => formatDate(item.date)),
    datasets: [
      {
        label: 'Vendidos',
        data: dailyTicketData.map(item => item.sold),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.3,
      },
      {
        label: 'Reservados',
        data: dailyTicketData.map(item => item.reserved),
        borderColor: 'rgb(255, 206, 86)',
        backgroundColor: 'rgba(255, 206, 86, 0.5)',
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="h-64 bg-white p-4 rounded-lg shadow">
      <Line options={options} data={data} />
    </div>
  );
};

export default DailyTicketsChart;
