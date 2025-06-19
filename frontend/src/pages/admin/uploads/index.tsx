import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminLayout from '../../../components/admin/Layout';
import { UploadService, FileService, FILES_BASE_URL } from '../../../services/upload.service';
import { AuthService } from '../../../services/auth.service';
import { formatFileSize, formatDate } from '../../../utils/formatters';
import ActionButtons from '../../../components/admin/common/ActionButtons';

interface UploadedFile {
  _id: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
  createdAt: string;
  isImage: boolean;
}

const UploadsPage: React.FC = () => {
  const router = useRouter();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Verificar autenticación
  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      router.push('/admin/login');
      return;
    }

    loadFiles();
  }, [router]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await UploadService.getAllFiles();
      
      if (response.success) {
        // Aseguramos que cada archivo tenga la propiedad isImage definida
        const transformedFiles = response.files.map(file => ({
          ...file,
          isImage: FileService.isImage(file.mimetype, file.filename)
        })) as UploadedFile[];
        
        setFiles(transformedFiles);
      } else {
        setError('Error al cargar archivos');
      }
    } catch (err) {
      console.error('Error cargando archivos:', err);
      setError('Error al cargar archivos');
    } finally {
      setLoading(false);
    };
  };

  // Filtrar archivos según búsqueda
  const filteredFiles = files.filter(file => {
    if (!searchQuery) return true;
    
    const search = searchQuery.toLowerCase();
    const filename = file.filename?.toLowerCase() || '';
    const originalName = file.originalName?.toLowerCase() || '';
    const type = file.mimetype?.toLowerCase() || '';
    
    return filename.includes(search) || 
           originalName.includes(search) || 
           type.includes(search);
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      
      setUploading(true);
      setUploadError('');
      
      const selectedFiles = Array.from(e.target.files);
      let totalSize = 0;
      
      // Calculate total size and check the limit
      for (let i = 0; i < selectedFiles.length; i++) {
        totalSize += selectedFiles[i].size;
      }
      
      if (totalSize > 10 * 1024 * 1024) {
        setUploadError('El tamaño total de los archivos no debe exceder 10MB');
        setUploading(false);
        return;
      }

      // Enviar archivos directamente al servidor usando el método uploadMultiple
      await UploadService.uploadMultiple(selectedFiles);
      
      // Recargar lista de archivos
      await loadFiles();
      
      // Limpiar input de archivos
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      setUploading(false);
    } catch (err: any) {
      console.error('Error al subir archivos:', err);
      setUploadError(err.response?.data?.message || 'Error al subir los archivos');
      setUploading(false);
    }
  };

  const handleDeleteFiles = async () => {
    if (selectedFiles.length === 0) return;
    
    if (confirm(`¿Estás seguro de que quieres eliminar ${selectedFiles.length} archivo(s)?`)) {
      try {
        setLoading(true);
        
        // Buscar los filenames correspondientes a los IDs seleccionados
        const filesToDelete = files.filter(file => selectedFiles.includes(file._id));
        
        for (const file of filesToDelete) {
          await UploadService.deleteFile(file.filename);
        }
        
        setSelectedFiles([]);
        await loadFiles();
      } catch (err) {
        console.error('Error al eliminar archivos:', err);
        setError('Error al eliminar archivos');
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleFileSelection = (fileId: string) => {
    if (selectedFiles.includes(fileId)) {
      setSelectedFiles(selectedFiles.filter(id => id !== fileId));
    } else {
      setSelectedFiles([...selectedFiles, fileId]);
    }
  };

  const selectAllFiles = () => {
    if (selectedFiles.length === filteredFiles.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(filteredFiles.map(file => file._id));
    }
  };

  const copyFileUrl = async (url: string) => {
    try {
      await FileService.copyToClipboard(url);
      alert('URL copiada al portapapeles');
    } catch (err) {
      console.error('Error al copiar URL:', err);
      alert('No se pudo copiar la URL');
    }
  };

  return (
    <AdminLayout title="Gestión de Archivos">
      <Head>
        <title>Gestión de Archivos | Admin</title>
      </Head>
      
      <div className="px-4 py-5 sm:px-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Archivos</h1>
      </div>
      
      <div className="px-4 sm:px-6 pb-5">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Archivos</h2>
        <p className="text-sm text-gray-600 mb-4">{files.length} archivos • {formatFileSize(files.reduce((acc, file) => acc + (file.size || 0), 0))} en total</p>
        
        {uploadError && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
            <p>{uploadError}</p>
          </div>
        )}
        
        <div className="mb-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                disabled={uploading}
              />
              <label
                htmlFor="file-upload"
                className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${uploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary-dark'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary`}
              >
                {uploading ? 'Subiendo...' : 'Subir archivos'}
              </label>
            </div>
            
            {selectedFiles.length > 0 && (
              <button
                onClick={handleDeleteFiles}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Eliminar seleccionados ({selectedFiles.length})
              </button>
            )}
          </div>
        </div>
        
        <div className="mb-4">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Buscar archivos</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <input
              type="text"
              name="search"
              id="search"
              className="focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="Buscar por nombre o tipo de archivo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
            <p>{error}</p>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <input
                            type="checkbox"
                            checked={selectedFiles.length > 0 && selectedFiles.length === filteredFiles.length}
                            onChange={selectAllFiles}
                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                          />
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Vista previa
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nombre
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tipo
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tamaño
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Subido
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredFiles.map((file) => (
                        <tr 
                          key={file._id}
                          className={selectedFiles.includes(file._id) ? "bg-blue-50" : ""}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedFiles.includes(file._id)}
                              onChange={() => toggleFileSelection(file._id)}
                              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {file.isImage ? (
                              <div 
                                className="h-12 w-12 rounded-md bg-gray-100 flex items-center justify-center cursor-pointer"
                                onClick={() => setShowPreview(file.url)}
                              >
                                <img
                                  src={file.url}
                                  alt={file.originalName}
                                  className="h-full w-full object-contain rounded-md"
                                />
                              </div>
                            ) : (
                              <div className="h-12 w-12 rounded-md bg-gray-100 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {file.originalName}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {file.mimetype}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {formatFileSize(file.size)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {formatDate(file.createdAt)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <ActionButtons
                              actions={[
                                {
                                  label: "Ver",
                                  onClick: () => window.open(file.url, '_blank'),
                                  color: "blue"
                                },
                                {
                                  label: "Copiar URL",
                                  onClick: () => copyFileUrl(file.url),
                                  color: "indigo"
                                },
                                {
                                  label: "Eliminar",
                                  onClick: () => {
                                    if (confirm('¿Estás seguro de que quieres eliminar este archivo?')) {
                                      UploadService.deleteFile(file.filename) // Usar filename para eliminar el archivo
                                        .then(() => loadFiles())
                                        .catch(err => {
                                          console.error('Error al eliminar archivo:', err);
                                          setError('Error al eliminar archivo');
                                        });
                                    }
                                  },
                                  color: "red"
                                }
                              ]}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Modal para ver la imagen en tamaño completo */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75" onClick={() => setShowPreview(null)}>
          <div className="max-w-3xl max-h-screen p-4 relative">
            <button 
              className="absolute top-0 right-0 m-4 text-white bg-black bg-opacity-50 rounded-full p-2"
              onClick={() => setShowPreview(null)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img 
              src={showPreview} 
              className="max-h-screen max-w-full object-contain" 
              alt="Vista previa"
            />
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default UploadsPage;