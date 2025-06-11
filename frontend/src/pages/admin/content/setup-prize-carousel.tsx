import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminLayout from '../../../components/admin/Layout';
import { AuthService } from '../../../services/auth.service';
import { ContentService } from '../../../services/content.service';
import { PrizeCarouselContent } from '@/types';

const SetupPrizeCarouselPage: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('Inicializando el carrusel de premios...');
  const [error, setError] = useState('');

  useEffect(() => {
    // Verificar autenticación
    if (!AuthService.isAuthenticated()) {
      router.push('/admin/login');
      return;
    }

    const initializeCarousel = async () => {
      try {
        setLoading(true);
        
        // Crear datos iniciales para el carrusel de premios
        const initialData: Omit<PrizeCarouselContent, '_id'> = {
          title: 'Conoce nuestro gran premio',
          description: 'Una oportunidad única de ganar este fabuloso premio participando en nuestra rifa solidaria.',
          images: [
            '/images/prize-1.png',
            '/images/prize-2.png',
            '/images/prize-3.png'
          ]
        };

        // Intentar guardar los datos
        await ContentService.updatePrizeCarouselContent(initialData as PrizeCarouselContent);
        
        setMessage('¡Carrusel de premios inicializado correctamente! Redirigiendo...');
        
        // Esperar 2 segundos y luego redirigir
        setTimeout(() => {
          router.push('/admin/content/prize-carousel');
        }, 2000);
      } catch (err: any) {
        console.error('Error al inicializar el carrusel de premios:', err);
        setError(err.message || 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    initializeCarousel();
  }, [router]);

  return (
    <>
      <Head>
        <title>Inicializar Carrusel de Premios | Rifas Los Andes Admin</title>
      </Head>
      
      <AdminLayout title="Inicializar Carrusel de Premios">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Inicializar Carrusel de Premios</h1>
          
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              <span className="ml-3">{message}</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">
                    {message}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </>
  );
};

export default SetupPrizeCarouselPage;
