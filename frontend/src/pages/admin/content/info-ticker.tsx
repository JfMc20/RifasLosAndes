import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminLayout from '../../../components/admin/Layout';
import { ContentService } from '../../../services/content.service';
import { AuthService } from '../../../services/auth.service';
import { InfoTicker } from '../../../types';

const InfoTickerPage: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  // Inicializar con valores predeterminados para evitar advertencias de componentes no controlados
  const [infoTicker, setInfoTicker] = useState<InfoTicker>({
    _id: '',
    ticketPrice: '',
    drawDate: '',
    announcementChannel: '',
    additionalInfo: '',
    createdAt: '',
    updatedAt: ''
  });
  
  // Esta bandera nos indica que el infoTicker ya ha sido inicializado (para evitar problemas de componentes no controlados)
  const [isInitialized, setIsInitialized] = useState(false);

  // Verificar autenticación
  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      router.push('/admin/login');
      return;
    }

    const fetchInfoTicker = async () => {
      try {
        setLoading(true);
        const content = await ContentService.getInfoTicker();
        setInfoTicker(content);
        setIsInitialized(true);
        setLoading(false);
      } catch (err: any) {
        console.error('Error al cargar contenido del ticker:', err);
        // Si no existe contenido del ticker, dejamos el estado por defecto
        if (err.response?.status === 404) {
          setIsInitialized(true); // Marcamos como inicializado aunque esté vacío
          setLoading(false);
          return;
        }
        setError(err.response?.data?.message || 'Error al cargar el contenido del ticker');
        setIsInitialized(true); // Marcamos como inicializado aunque haya error
        setLoading(false);
      }
    };

    fetchInfoTicker();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInfoTicker(prev => ({
      ...prev,
      [name]: value || '' // Asegurar que el valor nunca sea undefined
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError('');
      
      // Validar campos requeridos
      if (!infoTicker.ticketPrice || !infoTicker.drawDate || !infoTicker.announcementChannel) {
        setError('Los campos de precio, fecha de sorteo y canal de anuncio son obligatorios');
        setSaving(false);
        return;
      }
      
      // Crear objeto limpio con solo los datos necesarios
      const cleanData = {
        ticketPrice: infoTicker.ticketPrice,
        drawDate: infoTicker.drawDate,
        announcementChannel: infoTicker.announcementChannel,
        additionalInfo: infoTicker.additionalInfo || ''
      };
      
      console.log('Datos a enviar:', cleanData);
      
      // Actualizar contenido del ticker
      if (infoTicker._id) {
        await ContentService.updateInfoTicker({
          _id: infoTicker._id,
          ...cleanData
        });
        alert('Contenido del ticker actualizado correctamente');
      } else {
        await ContentService.createInfoTicker(cleanData);
        alert('Contenido del ticker creado correctamente');
      }
      
      // Redireccionar a la página de contenido
      router.push('/admin/content');
    } catch (err: any) {
      console.error('Error al guardar contenido del ticker:', err);
      setError(err.message || 'Error al guardar el contenido del ticker');
      setSaving(false);
    }
  };

  return (
    <>
      <Head>
        <title>Administrar Ticker Informativo - Rifas Los Andes</title>
      </Head>
      
      <AdminLayout title="Ticker Informativo">
        <div className="py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Ticker Informativo</h1>
          </div>
          
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {!isInitialized || loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-6">
                  {/* Sección Principal */}
                  <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                      Información del Ticker
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="ticketPrice" className="block text-sm font-medium text-gray-700 mb-1">
                          Precio del Boleto <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          name="ticketPrice"
                          id="ticketPrice"
                          value={infoTicker.ticketPrice}
                          onChange={handleInputChange}
                          required
                          placeholder="Ej: $30"
                          className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="drawDate" className="block text-sm font-medium text-gray-700 mb-1">
                          Fecha del Sorteo <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          name="drawDate"
                          id="drawDate"
                          value={infoTicker.drawDate}
                          onChange={handleInputChange}
                          required
                          placeholder="Ej: 30 de Junio 2025"
                          className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <label htmlFor="announcementChannel" className="block text-sm font-medium text-gray-700 mb-1">
                        Canal de Anuncio <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        name="announcementChannel"
                        id="announcementChannel"
                        value={infoTicker.announcementChannel}
                        onChange={handleInputChange}
                        required
                        placeholder="Ej: Facebook Live @RifasLosAndes"
                        className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    
                    <div className="mt-4">
                      <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700 mb-1">
                        Información Adicional <span className="text-gray-400 text-xs">(opcional)</span>
                      </label>
                      <textarea
                        name="additionalInfo"
                        id="additionalInfo"
                        rows={3}
                        value={infoTicker.additionalInfo || ''}
                        onChange={handleInputChange}
                        placeholder="Información adicional que desee mostrar en el ticker"
                        className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>

                    <div className="mt-6 bg-yellow-50 p-4 rounded-md border border-yellow-200">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3 flex-grow">
                          <h3 className="text-sm font-medium text-yellow-800">Vista Previa</h3>
                          <div className="mt-2 text-sm text-yellow-700">
                            <div className="bg-yellow-500 py-2 px-4 text-black rounded-md overflow-hidden max-h-24 overflow-y-auto">
                              <p className="whitespace-normal break-words">
                                💰 Precio: {infoTicker.ticketPrice || '[precio]'} · 
                                📅 Fecha de sorteo: {infoTicker.drawDate || '[fecha]'} · 
                                📱 Anuncio por: {infoTicker.announcementChannel || '[canal]'} 
                                {infoTicker.additionalInfo ? `· ℹ️ ${infoTicker.additionalInfo}` : ''}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => router.push('/admin/content')}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none disabled:opacity-50"
                  >
                    {saving ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </AdminLayout>
    </>
  );
};

export default InfoTickerPage;
