import React, { useState } from 'react';
import { ContentService } from '../../services/content.service';
import { PrizeCarouselContent } from '@/types';

interface QuickInitPrizeCarouselProps {
  onComplete: (data: PrizeCarouselContent) => void;
}

const QuickInitPrizeCarousel: React.FC<QuickInitPrizeCarouselProps> = ({ onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInitialize = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Datos iniciales para el carrusel
      const initialData: PrizeCarouselContent = {
        _id: '',
        title: 'Conoce nuestro gran premio',
        description: 'Una oportunidad única de ganar este fabuloso premio participando en nuestra rifa solidaria.',
        images: [
          '/images/prize-1.png',
          '/images/prize-2.png',
          '/images/prize-3.png'
        ],
        createdAt: '',
        updatedAt: ''
      };
      
      // Guardar los datos
      const result = await ContentService.updatePrizeCarouselContent(initialData);
      
      // Notificar que se ha completado
      onComplete(result);
      
    } catch (err: any) {
      console.error('Error al inicializar el carrusel de premios:', err);
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 my-4">
      <h3 className="font-medium text-lg mb-2">Inicialización Rápida</h3>
      <p className="text-gray-600 mb-4">
        Para comenzar a usar el carrusel de premios, inicializa con datos de ejemplo.
        Esto creará un carrusel básico que podrás personalizar después.
      </p>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      
      <button
        onClick={handleInitialize}
        disabled={loading}
        className="w-full flex justify-center items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300"
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Inicializando...
          </>
        ) : (
          'Inicializar Carrusel con Datos de Ejemplo'
        )}
      </button>
    </div>
  );
};

export default QuickInitPrizeCarousel;
