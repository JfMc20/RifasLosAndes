import { ApiService } from './api';
import axios from 'axios';
import { FILES_BASE_URL, FileService } from './file.service';
import { uploadMultipleFiles } from './uploadMultiple';

// Re-exportamos la constante FILES_BASE_URL y FileService para fácil acceso desde importaciones de UploadService
export { FILES_BASE_URL, FileService };

// Constante interna para mostrar mensajes de debug
const DEBUG_MODE = false;

interface UploadResponse {
  success: boolean;
  filename: string;
  originalname: string;
  url: string;
  size: number;
  mimetype: string;
}

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

export class UploadService {
  // Add the uploadMultipleFiles method from the separate file
  static uploadMultipleFiles = uploadMultipleFiles;
  
  /**
   * Obtiene la lista completa de archivos del servidor
   * @returns Respuesta con la lista de archivos
   */
  static async getAllFiles() {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const token = localStorage.getItem('authToken');
      
      // En modo demo, retornar datos de prueba
      if (typeof window !== 'undefined' && localStorage.getItem('DEMO_MODE') === 'true') {
        const mockFiles = [
          {
            filename: 'mock-image-1.jpg',
            originalname: 'Imagen de ejemplo 1.jpg',
            url: FileService.getFileUrl('/uploads/mock-image-1.jpg'),
            mimetype: 'image/jpeg',
            size: 12345,
            createdAt: new Date().toISOString()
          },
          {
            filename: 'mock-doc-1.pdf',
            originalname: 'Documento de ejemplo.pdf',
            url: FileService.getFileUrl('/uploads/mock-doc-1.pdf'),
            mimetype: 'application/pdf',
            size: 54321,
            createdAt: new Date().toISOString()
          }
        ];
        
        return {
          success: true,
          files: mockFiles
        };
      }
      
      const response = await axios.get<{success: boolean, files: any[]}>(`${API_BASE_URL}/upload`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      // Ensure all files have correct URLs
      if (response.data && response.data.files) {
        response.data.files.forEach(file => {
          if (file.url) {
            file.url = FileService.getFileUrl(file.url);
          } else if (file.filename) {
            file.url = FileService.getFileUrl(`/uploads/${file.filename}`);
          }
        });
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching files:', error);
      return {
        success: false,
        files: []
      };
    }
  };
  /**
   * Obtiene una lista de archivos utilizables para el selector de medios
   * @param type Tipo de archivo a filtrar (image, document, all)
   * @returns Lista de archivos utilizables
   */
  static async getUsableFileList(type: 'image' | 'document' | 'all' = 'all'): Promise<FileInfo[]> {
    try {
      // Utilizar el método getAllFiles que ya tenemos implementado
      // Forzar recarga completa de archivos desde el servidor
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const token = localStorage.getItem('authToken');
      
      // Evitamos usar caché del navegador añadiendo un timestamp a la URL
      const timestamp = new Date().getTime();
      const response = await axios.get<{success: boolean, files: any[]}>(`${API_BASE_URL}/upload?_nocache=${timestamp}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      if (!response.data?.success || !response.data?.files || !Array.isArray(response.data?.files)) {
        console.error('Error al obtener archivos para el selector:', response.data);
        return [];
      }
      
      const result = response.data;
      
      // Transformar los datos al formato que espera MediaSelector
      const fileList = result.files.map(file => {
        // Asegurar que tenemos una URL válida para el archivo
        let fileUrl = file.url;
        if (!fileUrl) {
          // Construir la URL correctamente si no existe
          fileUrl = FileService.getFileUrl(`/uploads/${file.filename}`);
        } else if (!fileUrl.startsWith('http')) {
          // Si la URL no es absoluta, usar FileService para construirla
          fileUrl = FileService.getFileUrl(fileUrl);
        }
        
        console.log(`Archivo: ${file.filename}, URL generada: ${fileUrl}`);

        return {
          _id: file.filename || file._id || (file.url?.split('/').pop()) || 'unknown',
          filename: file.filename || '',
          originalName: file.originalname || file.originalName || file.filename || 'Sin nombre',
          mimetype: file.mimetype || 'application/octet-stream',
          size: file.size || 0,
          url: fileUrl,
          createdAt: file.createdAt || new Date().toISOString(),
          isImage: file.mimetype?.startsWith('image/') || (fileUrl?.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) !== null) || false
        };
      });
      
      console.log('Archivos disponibles para selector:', fileList);
      
      // Filtrar por tipo si es necesario
      if (type === 'image') {
        return fileList.filter(f => f.isImage);
      } else if (type === 'document') {
        return fileList.filter(f => !f.isImage);
      }
      
      return fileList;
    } catch (error) {
      console.error('Error al obtener la lista de archivos:', error);
      return [];
    }
  }
  
  /**
   * Sube una imagen al servidor
   * @param file El archivo a subir
   * @returns Información del archivo subido
   */
  static async uploadFile(file: File | FormData): Promise<UploadResponse> {
    try {
      // Preparar el FormData (si no lo es ya)
      let formData: FormData;
      
      if (file instanceof FormData) {
        formData = file;
      } else {
        formData = new FormData();
        formData.append('file', file);
      }

      // Necesitamos una configuración especial para axios para enviar FormData
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const token = localStorage.getItem('authToken');
      
      if (DEBUG_MODE) {
        console.log('Uploading file to:', `${API_BASE_URL}/upload`);
        console.log('File size:', file instanceof File ? file.size : undefined, 'bytes, Type:', file instanceof File ? file.type : undefined);
      }
      
      // En modo demo, simular carga exitosa
      if (typeof window !== 'undefined' && localStorage.getItem('DEMO_MODE') === 'true') {
        console.log('Running in demo mode: Simulating file upload');
        
        // Simular retraso de red
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockResponse = {
          success: true,
          filename: `mock-upload-${Date.now()}.jpg`,
          originalname: 'mock-file.jpg',
          url: '/mock-uploads/mock-file.jpg',
          size: 1024,
          mimetype: 'image/jpeg'
        };
        
        // Asegurarse de que la URL sea correcta incluso en modo demo
        mockResponse.url = FileService.getFileUrl(mockResponse.url);
        
        return mockResponse;
      }
      
      const response = await axios.post<UploadResponse>(`${API_BASE_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      if (DEBUG_MODE) {
        console.log('Upload response:', response.data);
        console.log('Original image URL from response:', response.data.url);
      }
      
      // Asegurar que la URL en la respuesta siempre apunte al backend
      if (response.data && response.data.url) {
        response.data.url = FileService.getFileUrl(response.data.url);
        
        if (DEBUG_MODE) {
          console.log('Corrected image URL:', response.data.url);
        }
      }

      return response.data;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  /**
   * Elimina un archivo del servidor (panel admin)
   */
  static async deleteFile(filename: string): Promise<{ success: boolean; message: string }> {
    try {
      // Check if we are in demo mode
      if (typeof window !== 'undefined' && localStorage.getItem('DEMO_MODE') === 'true') {
        console.log(`Running in demo mode: Simulating file deletion for ${filename}`);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        return { success: true, message: 'Archivo eliminado correctamente en modo demo' };
      }
      
      const response = await ApiService.delete<{ success: boolean; message: string }>(`upload/${filename}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting file:', error);
      // In demo mode, return mock success response even for errors
      if (typeof window !== 'undefined' && localStorage.getItem('DEMO_MODE') === 'true') {
        return { success: true, message: 'Archivo eliminado correctamente en modo demo' };
      }
      throw error;
    }
  }
  
  /**
   * Construye una URL completa para un archivo subido
   * @param relativePath Ruta relativa del archivo (ej: /uploads/file.jpg)
   * @returns URL completa que apunta siempre al backend (puerto 3001)
   */
  static getFullUrl(relativePath: string): string {
    // Utilizamos el FileService centralizado para generar URLs consistentes
    // que siempre apunten al backend (puerto 3001)
    return FileService.getFileUrl(relativePath);
  }

  /**
   * Obtiene una lista de todos los archivos subidos
   */
  static async getAllFiles(): Promise<{ success: boolean; files: FileInfo[] }> {
    try {
      // Check if we are in demo mode
      if (typeof window !== 'undefined' && localStorage.getItem('DEMO_MODE') === 'true') {
        console.log('Running in demo mode: Returning mock files');
        
        // Create mock files for demo
        const mockFiles: FileInfo[] = [
          {
            _id: 'mock-file-1',
            filename: 'hero-banner.jpg',
            originalName: 'hero-banner.jpg',
            mimetype: 'image/jpeg',
            size: 1024000, // ~1MB
            url: '/uploads/hero-banner.jpg',
            createdAt: new Date().toISOString(),
            isImage: true
          },
          {
            _id: 'mock-file-2',
            filename: 'logo.svg',
            originalName: 'company-logo.svg',
            mimetype: 'image/svg+xml',
            size: 25000, // ~25KB
            url: '/uploads/logo.svg',
            createdAt: new Date('2025-01-15').toISOString(),
            isImage: true
          },
          {
            _id: 'mock-file-3',
            filename: 'terms.pdf',
            originalName: 'terms-and-conditions.pdf',
            mimetype: 'application/pdf',
            size: 250000,
            url: '/docs/terms.pdf',
            createdAt: new Date('2025-01-08').toISOString(),
            isImage: false
          }
        ];
        
        // Corregir las URLs en los archivos de ejemplo
        mockFiles.forEach(file => {
          if (file.url) {
            file.url = FileService.getFileUrl(file.url);
          }
        });
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        return { success: true, files: mockFiles };
      }
      
      const response = await ApiService.get<{ success: boolean; files: FileInfo[] }>('upload');
      
      // Corregir todas las URLs para asegurar que apunten al backend
      if (response.data && response.data.files) {
        response.data.files.forEach(file => {
          if (file.url) {
            file.url = FileService.getFileUrl(file.url);
          }
          
          // También validamos si es una imagen basado en MIME type o extensión
          if (file.mimetype || file.filename) {
            file.isImage = FileService.isImage(file.mimetype, file.filename);
          }
        });
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching files:', error);
      
      // In demo mode, return mock data even for errors
      if (typeof window !== 'undefined' && localStorage.getItem('DEMO_MODE') === 'true') {
        return { 
          success: true, 
          files: [
            {
              _id: 'mock-error-file',
              filename: 'demo-image.jpg',
              originalName: 'demo-image.jpg',
              mimetype: 'image/jpeg',
              size: 1024000,
              url: FileService.getFileUrl('/uploads/demo-image.jpg'),
              createdAt: new Date().toISOString(),
              isImage: true
            }
          ] 
        };
      }
      throw error;
    }
  }

  /**
   * Sube múltiples archivos al servidor
   * @param files Lista de archivos a subir
   */
  static async uploadMultiple(files: File[]): Promise<UploadResponse[]> {
    try {
      const formData = new FormData();
      
      // Append each file to the formData
      files.forEach((file, index) => {
        formData.append(`file${index}`, file);
      });
      
      // Check if we are in demo mode
      if (typeof window !== 'undefined' && localStorage.getItem('DEMO_MODE') === 'true') {
        console.log('Running in demo mode: Simulating file upload');
        
        // Generate mock responses for the files
        const mockResponses: UploadResponse[] = files.map((file, index) => ({
          success: true,
          filename: `mock-upload-${Date.now()}-${index}.${file.name.split('.').pop()}`,
          originalname: file.name,
          url: FileService.getFileUrl(`/uploads/${file.name}`),
          size: file.size,
          mimetype: file.type
        }));
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        return mockResponses;
      }
      
      // Normal API call for non-demo mode
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const token = localStorage.getItem('authToken');
      
      const response = await axios.post<{success: boolean, files: UploadResponse[]}>
        (`${API_BASE_URL}/upload/multiple`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      // Asegurar URLs correctas en la respuesta
      if (response.data && response.data.files) {
        response.data.files.forEach(file => {
          if (file.url) {
            file.url = FileService.getFileUrl(file.url);
          }
        });
      }

      return response.data.files || [];
    } catch (error) {
      console.error('Error uploading multiple files:', error);
      // In demo mode, return mock success response even for errors
      if (typeof window !== 'undefined' && localStorage.getItem('DEMO_MODE') === 'true') {
        return [
          {
            success: true,
            filename: `mock-upload-${Date.now()}.jpg`,
            originalname: 'mock-file.jpg',
            url: FileService.getFileUrl('/uploads/mock-file.jpg'),
            size: 1024,
            mimetype: 'image/jpeg'
          }
        ];
      }
      throw error;
    }
  }
}