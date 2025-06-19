import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminLayout from '../../../components/admin/Layout';
import { ContentService } from '../../../services/content.service';
import { AuthService } from '../../../services/auth.service';
import { UploadService } from '../../../services/upload.service';
import { PrizeCarouselContent } from '../../../types';
import MediaSelector from '../../../components/admin/MediaSelector';
import QuickInitPrizeCarousel from '../../../components/admin/QuickInitPrizeCarousel';

const PrizeCarouselPage: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  // Inicializar con valores predeterminados para evitar advertencias de componentes no controlados
  const [carouselContent, setCarouselContent] = useState<PrizeCarouselContent>({
    _id: '',
    title: '',
    description: '',
    images: ['', '', ''], // Inicializar con 3 imágenes vacías
    createdAt: '',
    updatedAt: ''
  });
  
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(-1);
  const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false);

  // Verificar autenticación
  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      router.push('/admin/login');
      return;
    }

    const fetchCarouselContent = async () => {
      try {
        setLoading(true);
        const content = await ContentService.getPrizeCarouselContent();
        
        // Asegurarse de que siempre tengamos 3 slots para imágenes
        const images = content.images || [];
        while (images.length < 3) {
          images.push('');
        }
        
        setCarouselContent({ ...content, images });
        setLoading(false);
      } catch (err: any) {
        console.error('Error al cargar contenido del carrusel:', err);
        // Si no existe contenido del carrusel, dejamos el estado por defecto
        if (err.response?.status === 404) {
          setLoading(false);
          return;
        }
        setError(err.response?.data?.message || 'Error al cargar el contenido del carrusel');
        setLoading(false);
      }
    };

    fetchCarouselContent();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCarouselContent(prev => ({
      ...prev,
      [name]: value || '' // Asegurar que el valor nunca sea undefined
    }));
  };

  const openMediaSelector = (index: number) => {
    setCurrentImageIndex(index);
    setIsMediaSelectorOpen(true);
  };
  
  // Nueva función para manejar la carga directa de archivos
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    
    // Validar el archivo
    if (file.size > 5 * 1024 * 1024) { // 5MB
      alert('La imagen no debe exceder 5MB');
      return;
    }
    
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      alert('Formato de imagen no válido. Use JPG, PNG, WebP o GIF');
      return;
    }
    
    try {
      // Mostrar indicador de carga
      const tmpImages = [...carouselContent.images];
      tmpImages[index] = 'loading...';
      setCarouselContent(prev => ({ ...prev, images: tmpImages }));
      
      // Subir archivo
      const result = await UploadService.uploadFile(file);
      
      // Actualizar la URL en el estado
      if (result && result.url) {
        const updatedImages = [...carouselContent.images];
        updatedImages[index] = result.url;
        setCarouselContent(prev => ({
          ...prev,
          images: updatedImages
        }));
      }
    } catch (err) {
      console.error('Error al subir imagen:', err);
      alert('Error al subir la imagen. Intente nuevamente.');
      // Restaurar el valor anterior en caso de error
      const originalImages = [...carouselContent.images];
      originalImages[index] = ''; // O restaurar el valor anterior si lo guardamos
      setCarouselContent(prev => ({ ...prev, images: originalImages }));
    }
  };

  const handleSelectImage = (imageUrl: string) => {
    if (currentImageIndex >= 0 && currentImageIndex < carouselContent.images.length) {
      const updatedImages = [...carouselContent.images];
      updatedImages[currentImageIndex] = imageUrl;
      
      setCarouselContent(prev => ({
        ...prev,
        images: updatedImages
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError('');
      
      // Filtrar imágenes vacías
      const filteredImages = carouselContent.images.filter(img => img.trim() !== '');
      
      // Validar que al menos haya una imagen
      if (filteredImages.length === 0) {
        setError('Debe incluir al menos una imagen para el carrusel');
        setSaving(false);
        return;
      }
      
      // Preparar datos para enviar
      const dataToUpdate = {
        ...carouselContent,
        images: filteredImages
      };
      
      // Actualizar contenido del carrusel
      await ContentService.updatePrizeCarouselContent(dataToUpdate);
      
      // Mostrar mensaje de éxito y redireccionar
      alert('Contenido del carrusel actualizado correctamente');
      router.push('/admin/content');
    } catch (err: any) {
      console.error('Error al guardar contenido del carrusel:', err);
      setError(err.response?.data?.message || 'Error al guardar los cambios');
      setSaving(false);
    }
  };

  return (
    <>
      <Head>
        <title>Administrar Carrusel de Premio - Rifas Los Andes</title>
      </Head>
      
      <AdminLayout title="Carrusel de Premios">
        <div className="py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Carrusel de Fotos del Premio</h1>
            <p className="mt-1 text-sm text-gray-500">
              Administre las imágenes y la información del carrusel que muestra el premio.
            </p>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              <span className="ml-3">Cargando...</span>
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
                  <p className="text-sm text-red-700">{error}</p>
                  {error.includes('No se encontró') && (
                    <div className="mt-3">
                      <p className="text-sm text-red-700 mb-2">No se ha configurado el carrusel de premios todavía.</p>
                      <QuickInitPrizeCarousel 
                        onComplete={(data) => {
                          setCarouselContent(data);
                          setError('');
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div>
              {error && (
                <div className="rounded-md bg-red-50 p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">{error}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    {/* Título del carrusel */}
                    <div className="grid gap-6">
                      <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Título</label>
                        <input
                          type="text"
                          name="title"
                          id="title"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          value={carouselContent.title}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    
                    {/* Descripción del carrusel */}
                    <div className="mb-6">
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Descripción
                      </label>
                      <div className="mt-1">
                        <textarea
                          id="description"
                          name="description"
                          rows={3}
                          value={carouselContent.description}
                          onChange={handleInputChange}
                          className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="Breve descripción sobre el premio que se muestra en el carrusel"
                          required
                        />
                      </div>
                    </div>
                    
                    {/* Sección de imágenes del carrusel */}
                    <div className="mb-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Imágenes del Carrusel</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Seleccione o suba hasta 3 imágenes para mostrar en el carrusel. Recomendamos usar imágenes de dimensiones similares.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {carouselContent.images.map((imageUrl, index) => (
                          <div key={index} className="border border-gray-300 rounded-lg p-4 flex flex-col items-center">
                            <div className="text-sm font-medium mb-2">Imagen {index + 1}</div>
                            <div className="w-full h-40 mb-3 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                              {imageUrl ? (
                                <img
                                  src={imageUrl}
                                  alt={`Imagen del premio ${index + 1}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    console.error('Error loading image:', imageUrl);
                                    (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                                  }}
                                />
                              ) : (
                                <svg
                                  className="h-10 w-10 text-gray-400"
                                  stroke="currentColor"
                                  fill="none"
                                  viewBox="0 0 48 48"
                                  aria-hidden="true"
                                >
                                  <path
                                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              )}
                            </div>
                            <div className="flex flex-col space-y-2">
                              <button
                                type="button"
                                onClick={() => openMediaSelector(index)}
                                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors w-full"
                              >
                                {imageUrl ? 'Seleccionar otra imagen' : 'Seleccionar imagen existente'}
                              </button>
                              
                              <div className="relative w-full">
                                <label className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors w-full flex items-center justify-center cursor-pointer">
                                  <span>{imageUrl ? 'Subir otra imagen' : 'Subir imagen nueva'}</span>
                                  <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={(e) => handleFileUpload(e, index)}
                                    className="absolute inset-0 opacity-0 cursor-pointer" 
                                  />
                                </label>
                              </div>
                            </div>
                          </div>
                        ))}
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
              
              {/* Selector de Archivos Modal */}
              <MediaSelector
                isOpen={isMediaSelectorOpen}
                onSelect={(file) => {
                  handleSelectImage(file.url);
                  setIsMediaSelectorOpen(false);
                }}
                onCancel={() => setIsMediaSelectorOpen(false)}
                type="image"
                title="Seleccionar Imagen para el Carrusel"
              />
            </div>
          )}
        </div>
      </AdminLayout>
    </>
  );
};

export default PrizeCarouselPage;
