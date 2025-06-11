import React, { useState, useEffect } from 'react';
import { UploadService } from '../../services/upload.service';

interface FileInfo {
  _id: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
  createdAt: string;
  isImage?: boolean;
}

interface MediaSelectorProps {
  onSelect: (file: FileInfo) => void;
  onCancel: () => void;
  type?: 'image' | 'document' | 'all';
  isOpen: boolean;
  title?: string;
}

const MediaSelector: React.FC<MediaSelectorProps> = ({
  onSelect,
  onCancel,
  type = 'all',
  isOpen,
  title = 'Seleccionar Archivo'
}) => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    if (isOpen) {
      // Forzar la carga de archivos cada vez que se abre el selector
      loadFiles();
    }
  }, [isOpen, type]);
  
  // Forzar recarga de archivos cuando cambie el tipo o cada vez que el componente se muestre
  const forceRefresh = () => {
    if (isOpen) {
      loadFiles();
    }
  };
  
  // Utilizar useEffect con un timer para refrescar la lista periódicamente mientras esté abierto
  useEffect(() => {
    if (isOpen) {
      // Refrescar inmediatamente
      loadFiles();
      
      // Refrescar cada 2 segundos mientras esté abierto
      const interval = setInterval(() => {
        loadFiles();
      }, 2000);
      
      return () => clearInterval(interval);
    }
  }, [isOpen]);
  
  const loadFiles = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('MediaSelector: Cargando archivos de tipo', type);
      const fileList = await UploadService.getUsableFileList(type);
      console.log('MediaSelector: Archivos recibidos', fileList);
      setFiles(fileList);
      setLoading(false);
    } catch (err) {
      console.error('Error al cargar archivos para selector:', err);
      setError('No se pudieron cargar los archivos. Por favor intenta nuevamente.');
      setLoading(false);
    }
  };
  
  const filteredFiles = files.filter(file => 
    file.originalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.filename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    false
  );
  
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-6 max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">{title}</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar por nombre de archivo..."
            className="w-full p-2 border border-gray-300 rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-red-500">{error}</div>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-gray-500">No se encontraron archivos{type !== 'all' ? ' de este tipo' : ''}.</div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredFiles.map(file => (
              <div
                key={file._id}
                onClick={() => onSelect(file)}
                className="border border-gray-200 rounded-md p-2 cursor-pointer hover:bg-blue-50 transition-colors"
              >
                <div className="aspect-w-1 aspect-h-1 bg-gray-100 rounded-md overflow-hidden mb-2 flex items-center justify-center">
                  {file.isImage ? (
                    <img
                      src={file.url}
                      alt={file.originalName}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        console.log('Error cargando imagen:', file.url);
                        // Intentar cargar directamente desde la URL del backend
                        const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/uploads/${file.filename}`;
                        console.log('Intentando URL alternativa:', backendUrl);
                        e.currentTarget.src = backendUrl;
                      }}
                    />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  )}
                </div>
                <div className="text-sm font-medium truncate" title={file.originalName}>
                  {file.originalName}
                </div>
                <div className="text-xs text-gray-500">{formatFileSize(file.size)}</div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-4 flex justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default MediaSelector;
