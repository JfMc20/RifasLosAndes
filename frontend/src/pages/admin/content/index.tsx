import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminLayout from '../../../components/admin/Layout';
import { ContentService } from '../../../services/content.service';
import { AuthService } from '../../../services/auth.service';
import { UploadService } from '../../../services/upload.service';
import { HeroContent, FAQ, PaymentMethod, PrizeCarouselContent, InfoTicker } from '../../../types';
import MediaSelector from '../../../components/admin/MediaSelector';

const ContentManagementPage: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('hero');
  const [heroContent, setHeroContent] = useState<HeroContent | null>(null);
  const [prizeCarouselContent, setPrizeCarouselContent] = useState<PrizeCarouselContent | null>(null);
  const [infoTicker, setInfoTicker] = useState<InfoTicker | null>(null);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recentFiles, setRecentFiles] = useState<any[]>([]);
  const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false);
  const [selectedMediaType, setSelectedMediaType] = useState<'image' | 'document' | 'all'>('image');
  const [selectedMediaCallbackType, setSelectedMediaCallbackType] = useState<string>('');

  // Verificar autenticación
  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      router.push('/admin/login');
      return;
    }

    const fetchContent = async () => {
      try {
        setLoading(true);
        setError('');

        // Cargar contenido de hero
        const hero = await ContentService.getHeroContent();
        setHeroContent(hero);
        
        // Cargar contenido del carrusel de premios
        try {
          const carousel = await ContentService.getPrizeCarouselContent();
          setPrizeCarouselContent(carousel);
        } catch (carouselErr) {
          console.error('Error al cargar carrusel de premios:', carouselErr);
          // No interrumpimos la carga principal si falla esta sección
        }
        
        // Cargar contenido del ticker informativo
        try {
          const ticker = await ContentService.getInfoTicker();
          setInfoTicker(ticker);
        } catch (tickerErr) {
          console.error('Error al cargar ticker informativo:', tickerErr);
          // No interrumpimos la carga principal si falla esta sección
        }

        // Cargar FAQs
        const faqsData = await ContentService.getFAQs();
        setFaqs(faqsData);

        // Cargar métodos de pago
        const paymentMethodsData = await ContentService.getPaymentMethods();
        setPaymentMethods(paymentMethodsData);
        
        // Cargar archivos recientes
        try {
          const files = await UploadService.getUsableFileList();
          // Mostrar solo los más recientes
          setRecentFiles(files.slice(0, 8));
        } catch (fileErr) {
          console.error('Error al cargar archivos recientes:', fileErr);
          // No mostramos error aquí para no interrumpir la carga principal
        }

        setLoading(false);
      } catch (err: any) {
        console.error('Error al cargar contenido:', err);
        setError(err.response?.data?.message || 'Error al cargar contenido');
        setLoading(false);
      }
    };

    fetchContent();
  }, [router]);

  // Redirigir a la página específica de edición según la pestaña seleccionada
  const handleEditContent = () => {
    switch (activeTab) {
      case 'hero':
        router.push('/admin/content/hero');
        break;
      case 'prize-carousel':
        router.push('/admin/content/prize-carousel');
        break;
      case 'info-ticker':
        router.push('/admin/content/info-ticker');
        break;  
      case 'faqs':
        router.push('/admin/content/faqs');
        break;
      case 'payment':
        router.push('/admin/content/payment');
        break;
      case 'media':
        router.push('/admin/uploads');
        break;
    }
  };
  
  const handleOpenMediaSelector = (type: 'image' | 'document' | 'all', callbackType: string) => {
    setSelectedMediaType(type);
    setSelectedMediaCallbackType(callbackType);
    setIsMediaSelectorOpen(true);
  };
  
  const handleMediaSelected = (file: any) => {
    setIsMediaSelectorOpen(false);
    // Aquí podríamos hacer algo con el archivo seleccionado según el contexto
    // Por ejemplo, copiar la URL al portapapeles
    navigator.clipboard.writeText(file.url)
      .then(() => {
        alert(`URL del archivo copiada al portapapeles: ${file.url}`);
      })
      .catch(err => {
        console.error('Error al copiar URL:', err);
        alert(`URL del archivo: ${file.url} (copia manual requerida)`); 
      });
  };
  
  const copyFileUrl = (url: string) => {
    navigator.clipboard.writeText(url)
      .then(() => {
        alert('URL copiada al portapapeles');
      })
      .catch(err => {
        console.error('Error al copiar URL:', err);
        alert(`URL: ${url} (copia manual requerida)`);
      });
  };

  return (
    <>
      <Head>
        <title>Gestión de Contenido - Admin Panel - Rifa Los Andes</title>
      </Head>
      
      <AdminLayout title="Gestión de Contenido">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-xl text-gray-600">Cargando contenido...</div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
            <p>{error}</p>
          </div>
        ) : (
          <>
            {/* Tabs para seleccionar tipo de contenido */}
            <div className="mb-6 border-b border-gray-200">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('hero')}
                  className={`${activeTab === 'hero' ? 'bg-white shadow' : 'hover:text-gray-700 hover:bg-gray-50'} px-3 py-2 font-medium text-sm rounded-md text-gray-900`}
                >
                  Hero Principal
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('prize-carousel')} 
                  className={`${activeTab === 'prize-carousel' ? 'bg-white shadow' : 'hover:text-gray-700 hover:bg-gray-50'} px-3 py-2 font-medium text-sm rounded-md text-gray-900`}
                >
                  Carrusel de Premios
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('info-ticker')} 
                  className={`${activeTab === 'info-ticker' ? 'bg-white shadow' : 'hover:text-gray-700 hover:bg-gray-50'} px-3 py-2 font-medium text-sm rounded-md text-gray-900`}
                >
                  Ticker Informativo
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('faqs')}
                  className={`${activeTab === 'faqs' ? 'bg-white shadow' : 'hover:text-gray-700 hover:bg-gray-50'} px-3 py-2 font-medium text-sm rounded-md text-gray-900`}
                >
                  Preguntas Frecuentes
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('payment')}
                  className={`${activeTab === 'payment' ? 'bg-white shadow' : 'hover:text-gray-700 hover:bg-gray-50'} px-3 py-2 font-medium text-sm rounded-md text-gray-900`}
                >
                  Métodos de Pago
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('media')}
                  className={`${activeTab === 'media' ? 'bg-white shadow' : 'hover:text-gray-700 hover:bg-gray-50'} px-3 py-2 font-medium text-sm rounded-md text-gray-900`}
                >
                  Archivos Multimedia
                </button>
              </nav>
            </div>

            {/* Contenido según la pestaña seleccionada */}
            <div className="bg-white shadow rounded-lg p-6">
              {/* Hero Content */}
              {activeTab === 'hero' && heroContent && (
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-lg font-medium text-gray-900">Contenido de la Sección Principal</h3>
                    <button
                      onClick={handleEditContent}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-brand-accent hover:bg-brand-accent-dark focus:outline-none"
                    >
                      Editar Contenido
                    </button>
                  </div>
                  
                  <div className="border-t border-gray-200 py-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Título:</p>
                        <p className="mt-1 text-lg text-gray-900">{heroContent.title}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Subtítulo:</p>
                        <p className="mt-1 text-lg text-gray-900">{heroContent.subtitle}</p>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <p className="text-sm font-medium text-gray-500">Descripción:</p>
                      <p className="mt-1 text-gray-900">{heroContent.description}</p>
                    </div>
                    
                    <div className="mt-6">
                      <p className="text-sm font-medium text-gray-500">Texto del botón:</p>
                      <p className="mt-1 text-gray-900">{heroContent.buttonText}</p>
                    </div>
                    
                    <div className="mt-6">
                      <p className="text-sm font-medium text-gray-500">URL de la imagen:</p>
                      <p className="mt-1 text-gray-900">{heroContent.imageUrl || 'No establecida'}</p>
                      {heroContent.imageUrl && (
                        <div className="mt-2 max-w-xs">
                          <img
                            src={heroContent.imageUrl}
                            alt="Hero"
                            className="w-full h-auto rounded-lg shadow"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Ticker Informativo */}
              {activeTab === 'info-ticker' && (
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-lg font-medium text-gray-900">Ticker Informativo</h3>
                    <button
                      onClick={handleEditContent}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-brand-accent hover:bg-brand-accent-dark focus:outline-none"
                    >
                      Editar Ticker Informativo
                    </button>
                  </div>
                  
                  {infoTicker ? (
                    <div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Precio del Boleto:</p>
                          <p className="mt-1 text-lg text-gray-900">{infoTicker.ticketPrice}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Fecha del Sorteo:</p>
                          <p className="mt-1 text-lg text-gray-900">{infoTicker.drawDate}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Canal de Anuncio:</p>
                          <p className="mt-1 text-lg text-gray-900">{infoTicker.announcementChannel}</p>
                        </div>
                        {infoTicker.additionalInfo && (
                          <div>
                            <p className="text-sm font-medium text-gray-500">Información Adicional:</p>
                            <p className="mt-1 text-lg text-gray-900">{infoTicker.additionalInfo}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-6 bg-yellow-50 p-4 rounded-md border border-yellow-200">
                        <h4 className="text-sm font-medium text-yellow-800 mb-2">Vista Previa:</h4>
                        <div className="bg-yellow-500 py-2 px-4 text-black rounded-md whitespace-nowrap overflow-hidden">
                          💰 Precio: {infoTicker.ticketPrice} · 📅 Fecha de sorteo: {infoTicker.drawDate} · 📱 Anuncio por: {infoTicker.announcementChannel} {infoTicker.additionalInfo ? `· ℹ️ ${infoTicker.additionalInfo}` : ''}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-500 mb-4">No se ha configurado el ticker informativo</p>
                      <button
                        onClick={() => router.push('/admin/content/info-ticker')}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                      >
                        Configurar Ticker Informativo
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Carrusel de Premios */}
              {activeTab === 'prize-carousel' && (
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-lg font-medium text-gray-900">Carrusel de Premio</h3>
                    <button
                      onClick={handleEditContent}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-brand-accent hover:bg-brand-accent-dark focus:outline-none"
                    >
                      Editar Carrusel de Premio
                    </button>
                  </div>
                  
                  {prizeCarouselContent ? (
                    <div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Título:</p>
                          <p className="mt-1 text-lg text-gray-900">{prizeCarouselContent.title}</p>
                          
                          <p className="text-sm font-medium text-gray-500">Descripción:</p>
                          <p className="mt-1 text-gray-900">{prizeCarouselContent.description}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-gray-500">Imágenes del Carrusel ({prizeCarouselContent.images?.length || 0})</p>
                          <div className="grid grid-cols-3 gap-2">
                            {prizeCarouselContent.images && prizeCarouselContent.images.map((imageUrl, index) => (
                              <div key={index} className="mb-2">
                                <img 
                                  src={imageUrl} 
                                  alt={`Imagen ${index + 1}`} 
                                  className="w-full h-24 object-cover border rounded-lg"
                                  onError={(e) => {
                                    console.error('Error loading image:', imageUrl);
                                    (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-500 mb-4">No se ha configurado el carrusel de premios</p>
                      <button
                        onClick={() => router.push('/admin/content/setup-prize-carousel')}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                      >
                        Inicializar Carrusel de Premio
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* FAQs */}
              {activeTab === 'faqs' && (
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-lg font-medium text-gray-900">Preguntas Frecuentes</h3>
                    <button
                      onClick={handleEditContent}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-brand-accent hover:bg-brand-accent-dark focus:outline-none"
                    >
                      Administrar FAQs
                    </button>
                  </div>
                  
                  {faqs.length === 0 ? (
                    <p className="text-gray-500 italic">No hay preguntas frecuentes configuradas.</p>
                  ) : (
                    <div className="space-y-4">
                      {faqs.map((faq, index) => (
                        <div key={faq._id} className="border-b border-gray-200 pb-4">
                          <p className="text-lg font-medium text-gray-900">{index + 1}. {faq.question}</p>
                          <p className="mt-2 text-gray-600">{faq.answer}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Métodos de pago */}
              {activeTab === 'payment' && (
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-lg font-medium text-gray-900">Métodos de Pago</h3>
                    <button
                      onClick={handleEditContent}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-brand-accent hover:bg-brand-accent-dark focus:outline-none"
                    >
                      Administrar Métodos de Pago
                    </button>
                  </div>
                  
                  {paymentMethods.length === 0 ? (
                    <p className="text-gray-500 italic">No hay métodos de pago configurados.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {paymentMethods.map((method) => (
                        <div key={method._id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center mb-3">
                            {method.iconUrl && (
                              <img
                                src={method.iconUrl}
                                alt={method.name}
                                className="w-8 h-8 mr-3"
                              />
                            )}
                            <h4 className="text-lg font-medium text-gray-900">{method.name}</h4>
                          </div>
                          <p className="text-gray-600">{method.description}</p>
                          {method.accountNumber && (
                            <p className="mt-2 text-sm text-gray-500">
                              <span className="font-medium">Cuenta:</span> {method.accountNumber}
                            </p>
                          )}
                          {method.accountOwner && (
                            <p className="mt-1 text-sm text-gray-500">
                              <span className="font-medium">Titular:</span> {method.accountOwner}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Archivos Multimedia */}
              {activeTab === 'media' && (
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-lg font-medium text-gray-900">Archivos Multimedia</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleOpenMediaSelector('all', 'general')}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                      >
                        Seleccionar Archivo
                      </button>
                      <button
                        onClick={handleEditContent}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-brand-accent hover:bg-brand-accent-dark focus:outline-none"
                      >
                        Gestionar Archivos
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                    <div className="px-4 py-5 sm:px-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Archivos Recientes</h3>
                      <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        Estos son los últimos archivos subidos al sistema.
                      </p>
                    </div>
                    
                    {recentFiles.length === 0 ? (
                      <div className="px-4 py-5 sm:p-6 text-center text-gray-500">
                        <p>No hay archivos disponibles.</p>
                        <p className="mt-2">
                          <button 
                            className="text-brand-accent hover:text-brand-accent-dark"
                            onClick={() => router.push('/admin/uploads')}
                          >
                            Subir archivos
                          </button>
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
                        {recentFiles.map((file) => (
                          <div key={file._id} className="border rounded-md p-2 relative group">
                            <div className="aspect-w-16 aspect-h-9 bg-gray-100 flex items-center justify-center overflow-hidden rounded mb-2">
                              {file.isImage ? (
                                <img 
                                  src={file.url} 
                                  alt={file.originalName} 
                                  className="object-cover w-full h-full"
                                />
                              ) : (
                                <div className="flex flex-col items-center justify-center text-gray-400">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  <span className="text-xs mt-1">{file.mimetype?.split('/')[1]}</span>
                                </div>
                              )}
                            </div>
                            <p className="text-sm truncate" title={file.originalName}>{file.originalName}</p>
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                              <button
                                onClick={() => copyFileUrl(file.url)}
                                className="bg-white text-gray-800 px-2 py-1 rounded text-xs font-medium hover:bg-gray-100"
                              >
                                Copiar URL
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-blue-700">
                          Los archivos subidos pueden ser utilizados en la sección Hero, Métodos de Pago y otras áreas del sitio. 
                          Para usar un archivo, copia su URL y pégala en el campo correspondiente al editar el contenido.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Selector de Archivos Modal */}
            <MediaSelector
              isOpen={isMediaSelectorOpen}
              onSelect={handleMediaSelected}
              onCancel={() => setIsMediaSelectorOpen(false)}
              type={selectedMediaType}
              title={`Seleccionar ${selectedMediaType === 'image' ? 'Imagen' : selectedMediaType === 'document' ? 'Documento' : 'Archivo'}`}
            />
          </>
        )}
      </AdminLayout>
    </>
  );
};

export default ContentManagementPage;
