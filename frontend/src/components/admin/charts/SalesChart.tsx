import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface MonthlySalesData {
  month: string;
  sales: number;
  tickets: number;
}

interface SalesChartProps {
  monthlySalesData: MonthlySalesData[];
  loading?: boolean;
}

export const SalesChart: React.FC<SalesChartProps> = ({ monthlySalesData, loading = false }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Ventas Mensuales',
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label === 'Ventas') {
              return label + ': $' + context.parsed.y.toLocaleString();
            }
            return label + ': ' + context.parsed.y.toLocaleString();
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return '$' + value.toLocaleString();
          }
        }
      }
    }
  };

  // Si está cargando o no hay datos, mostrar un placeholder
  if (loading || !monthlySalesData || monthlySalesData.length === 0) {
    return (
      <div className="h-64 bg-white p-4 rounded-lg shadow flex items-center justify-center">
        {loading ? (
          <p className="text-gray-500">Cargando datos de ventas...</p>
        ) : (
          <p className="text-gray-500">No hay datos de ventas disponibles</p>
        )}
      </div>
    );
  }

  const data = {
    labels: monthlySalesData.map(item => item.month),
    datasets: [
      {
        label: 'Ventas',
        data: monthlySalesData.map(item => item.sales),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 1,
      },
      {
        label: 'Boletos vendidos',
        data: monthlySalesData.map(item => item.tickets),
        backgroundColor: 'rgba(53, 162, 235, 0.6)',
        borderColor: 'rgb(53, 162, 235)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="h-64 bg-white p-4 rounded-lg shadow">
      <Bar options={options} data={data} />
    </div>
  );
};

export default SalesChart;
