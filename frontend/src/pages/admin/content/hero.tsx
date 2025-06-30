import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminLayout from '../../../components/admin/Layout';
import { ContentService } from '../../../services/content.service';
import { AuthService } from '../../../services/auth.service';
import { UploadService } from '../../../services/upload.service';
import { HeroContent } from '../../../types';
import MediaSelector from '../../../components/admin/MediaSelector';

const HeroContentPage: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploadError, setUploadError] = useState('');
  // Ensure all form fields have default values to prevent uncontrolled to controlled warnings
  const [heroContent, setHeroContent] = useState<HeroContent>({
    _id: '',
    title: '',
    subtitle: '',
    description: '',
    buttonText: '', // Initialize with empty string, not undefined
    imageUrl: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false);

  // Verificar autenticación
  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      router.push('/admin/login');
      return;
    }

    const fetchHeroContent = async () => {
      try {
        setLoading(true);
        const content = await ContentService.getHeroContent();
        setHeroContent(content);
        if (content.imageUrl) {
          setPreviewUrl(content.imageUrl);
        }
        setLoading(false);
      } catch (err: any) {
        console.error('Error al cargar contenido del hero:', err);
        setError(err.response?.data?.message || 'Error al cargar el contenido');
        setLoading(false);
      }
    };

    fetchHeroContent();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Always maintain defined values for all fields
    setHeroContent(prev => ({
      ...prev,
      [name]: value || '' // Ensure value is never undefined
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamaño y tipo de archivo
    if (file.size > 5 * 1024 * 1024) { // 5MB
      setUploadError('La imagen no debe exceder 5MB');
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Formato de imagen no válido. Use JPG, PNG, WebP o GIF');
      return;
    }

    setImageFile(file);
    setUploadError('');

    // Crear vista previa
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async (): Promise<string> => {
    if (!imageFile) return heroContent.imageUrl || ''; // Mantener la URL existente si no hay nueva imagen

    try {
      // El método uploadFile ya crea internamente el FormData
      const result = await UploadService.uploadFile(imageFile);
      
      // Usar la URL devuelta en la respuesta
      if (result && result.url) {
        return result.url;
      } else {
        console.error('La respuesta de carga de archivos no contiene la URL esperada:', result);
        throw new Error('Formato de respuesta inválido al subir la imagen');
      }
    } catch (err) {
      console.error('Error al subir imagen:', err);
      throw new Error('No se pudo subir la imagen');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError('');
      
      // Si hay una nueva imagen, subirla primero
      let imageUrl = heroContent.imageUrl;
      if (imageFile) {
        imageUrl = await uploadImage();
      }
      
      // Preparar datos para enviar al API - solo incluir propiedades válidas
      // Asegurarse de que todos los campos requeridos tienen valores válidos
      const heroData = {
        title: heroContent.title || '',
        subtitle: heroContent.subtitle || '',
        description: heroContent.description || '', // El campo description es requerido
        imageUrl: imageUrl || '', // El campo imageUrl es requerido
        buttonText: heroContent.buttonText || ''
      };
      
      // Si hay un ID existente, hacer un update, sino crear nuevo
      if (heroContent._id) {
        heroData['_id'] = heroContent._id;
      }
      
      // Log de datos que se envían para debugging
      console.log('Enviando datos al backend (limpiados):', JSON.stringify(heroData));
      
      // Actualizar el contenido del hero
      await ContentService.updateHeroContent(heroData);
      
      setSaving(false);
      router.push('/admin/content');
    } catch (err: any) {
      console.error('Error al guardar contenido:', err);
      // Mejora del manejo de errores para mostrar mensaje adecuado
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (typeof err.message === 'string') {
        setError(err.message);
      } else {
        setError('Error al guardar el contenido. Por favor, intente de nuevo.');
      }
      setSaving(false);
    }
  };

  return (
    <>
      <Head>
        <title>Editar Sección Principal - Admin Panel - Rifa Los Andes</title>
      </Head>
      
      <AdminLayout title="Editar Sección Principal">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-xl text-gray-600">Cargando contenido...</div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg p-6">
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
                  <p>{error}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="col-span-2">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Título
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    required
                    value={heroContent.title}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent"
                  />
                </div>
                
                <div className="col-span-2">
                  <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700 mb-1">
                    Subtítulo
                  </label>
                  <input
                    type="text"
                    name="subtitle"
                    id="subtitle"
                    value={heroContent.subtitle}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent"
                  />
                </div>
                
                <div className="col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    rows={4}
                    value={heroContent.description}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent"
                  />
                </div>
                
                <div>
                  <label htmlFor="buttonText" className="block text-sm font-medium text-gray-700 mb-1">
                    Texto del botón
                  </label>
                  <input
                    type="text"
                    name="buttonText"
                    id="buttonText"
                    value={heroContent.buttonText}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent"
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Imagen de la sección principal
                  </label>
                  
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-2 text-center">
                      <div className="flex flex-col items-center">
                        {previewUrl ? (
                          <div className="mb-4">
                            <img
                              src={previewUrl}
                              alt="Vista previa"
                              className="max-h-48 rounded-md"
                            />
                          </div>
                        ) : (
                          <svg
                            className="mx-auto h-12 w-12 text-gray-400"
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
                        
                        <div className="flex text-sm text-gray-600 space-x-3">
                          <label
                            htmlFor="image-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-brand-accent hover:text-brand-accent-dark focus-within:outline-none"
                          >
                            <span>Subir imagen</span>
                            <input
                              id="image-upload"
                              name="image-upload"
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={handleImageChange}
                            />
                          </label>
                          <button
                            type="button"
                            className="font-medium text-blue-600 hover:text-blue-700"
                            onClick={() => setIsMediaSelectorOpen(true)}
                          >
                            Seleccionar existente
                          </button>
                        </div>
                        
                        <p className="text-xs text-gray-500">PNG, JPG, WebP o GIF hasta 5MB</p>
                        
                        {uploadError && (
                          <p className="text-xs text-red-500">{uploadError}</p>
                        )}
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
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-accent hover:bg-brand-accent-dark focus:outline-none disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
            
            {/* Selector de Archivos Modal */}
            <MediaSelector
              isOpen={isMediaSelectorOpen}
              onSelect={(file) => {
                setPreviewUrl(file.url);
                setHeroContent(prev => ({
                  ...prev,
                  imageUrl: file.url
                }));
                setIsMediaSelectorOpen(false);
              }}
              onCancel={() => setIsMediaSelectorOpen(false)}
              type="image"
              title="Seleccionar Imagen"
            />
          </div>
        )}
      </AdminLayout>
    </>
  );
};

export default HeroContentPage;
