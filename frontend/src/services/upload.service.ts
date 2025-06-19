import { ApiService } from './api';
import { FILES_BASE_URL, FileService } from './file.service';

export { FILES_BASE_URL, FileService };

export interface UploadResponse {
  success: boolean;
  filename: string;
  originalname: string;
  url: string;
  size: number;
  mimetype: string;
}

export interface FileInfo {
  _id: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
  createdAt: string;
  isImage?: boolean;
}

export interface FilesResponse {
  success: boolean;
  files: FileInfo[];
}

export class UploadService {
  /**
   * Obtiene una lista de archivos utilizables para el selector de medios
   * @param type Tipo de archivo a filtrar (image, document, all)
   * @returns Lista de archivos utilizables
   */
  static async getUsableFileList(type: 'image' | 'document' | 'all' = 'all'): Promise<FileInfo[]> {
    try {
      // Forzar recarga completa de archivos desde el servidor con timestamp para evitar cache
      const timestamp = new Date().getTime();
      console.log(`Obteniendo lista de archivos, tipo: ${type}`);
      
      // Intentamos obtener la lista de archivos subidos del servidor
      const response = await ApiService.get<FilesResponse>(`upload?_nocache=${timestamp}`);
      console.log('Respuesta del servidor para archivos:', response.data);
      
      // Verificar si la respuesta tiene el formato esperado
      if (!response.data?.files || !Array.isArray(response.data?.files)) {
        console.error('Error: La respuesta no contiene una lista de archivos válida', response.data);
        return [];
      }
      
      // Transformar los datos al formato que espera MediaSelector
      const fileList = response.data.files.map(file => {
        // Asegurar que tenemos una URL válida para el archivo
        let fileUrl = file.url;
        
        // Si no hay URL o es relativa, construirla correctamente
        if (!fileUrl) {
          fileUrl = FileService.getFileUrl(`/uploads/${file.filename}`);
        } else if (!fileUrl.startsWith('http')) {
          fileUrl = FileService.getFileUrl(fileUrl);
        }
        
        // Detectar si es una imagen basado en el tipo MIME o extensión
        const isImage = 
          file.mimetype?.startsWith('image/') || 
          file.filename?.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) !== null || 
          false;
        
        // Construir el objeto con todas las propiedades normalizadas
        return {
          _id: file._id || file.filename || (file.url?.split('/').pop()) || 'unknown',
          filename: file.filename || '',
          originalName: file.originalName || (file as any).originalname || file.filename || 'Sin nombre',
          mimetype: file.mimetype || 'application/octet-stream',
          size: file.size || 0,
          url: fileUrl,
          createdAt: file.createdAt || new Date().toISOString(),
          isImage: isImage
        };
      });
      
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
   * Sube un archivo al servidor
   * @param file El archivo a subir
   * @returns Información del archivo subido
   */
  static async uploadFile(file: File): Promise<UploadResponse> {
    try {
      // Preparar el FormData
      const formData = new FormData();
      formData.append('file', file);
      
      // Usar ApiService con soporte para FormData
      const response = await ApiService.postFormData<UploadResponse>('upload', formData);
      
      // Asegurar que la URL sea correcta
      if (response.data && response.data.url && !response.data.url.startsWith('http')) {
        response.data.url = FileService.getFileUrl(response.data.url);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error al subir archivo:', error);
      
      // En modo demo, retornar respuesta simulada incluso en errores
      if (typeof window !== 'undefined' && localStorage.getItem('DEMO_MODE') === 'true') {
        console.log('Ejecutando en modo demo: Simulando carga de archivo');
        return {
          success: true,
          filename: `mock-upload-${Date.now()}.jpg`,
          originalname: file.name || 'archivo.jpg',
          url: FileService.getFileUrl('/uploads/mock-file.jpg'),
          size: file.size || 1024,
          mimetype: file.type || 'image/jpeg'
        };
      }
      
      throw error;
    }
  }

  /**
   * Elimina un archivo del servidor
   * @param filename Nombre del archivo a eliminar
   * @returns Respuesta del servidor
   */
  static async deleteFile(filename: string): Promise<{success: boolean; message: string}> {
    try {
      // Usar ApiService para la solicitud DELETE
      const response = await ApiService.delete<{success: boolean; message: string}>(`upload/${filename}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar archivo:', error);
      
      // En modo demo, retornar respuesta de éxito simulada
      if (typeof window !== 'undefined' && localStorage.getItem('DEMO_MODE') === 'true') {
        return {
          success: true,
          message: `Archivo ${filename} eliminado correctamente (simulado)`
        };
      }
      
      throw error;
    }
  }

  /**
   * Construye una URL completa para un archivo
   * @param relativePath Ruta relativa del archivo
   * @returns URL completa
   */
  static getFullUrl(relativePath: string): string {
    return FileService.getFileUrl(relativePath);
  }

  /**
   * Obtiene todos los archivos del servidor
   * @returns Lista de archivos
   */
  static async getAllFiles(): Promise<FilesResponse> {
    try {
      // En modo demo, retornar archivos simulados
      if (typeof window !== 'undefined' && localStorage.getItem('DEMO_MODE') === 'true') {
        console.log('Ejecutando en modo demo: Retornando archivos simulados');
        
        const mockFiles: FileInfo[] = [
          {
            _id: 'mock-image-1',
            filename: 'demo-image-1.jpg',
            originalName: 'imagen-demo-1.jpg',
            mimetype: 'image/jpeg',
            size: 1048576, // 1MB
            url: '/uploads/demo-image-1.jpg',
            createdAt: new Date('2024-12-01').toISOString(),
            isImage: true
          },
          {
            _id: 'mock-doc-1',
            filename: 'demo-document.pdf',
            originalName: 'documento-demo.pdf',
            mimetype: 'application/pdf',
            size: 250000,
            url: '/docs/terms.pdf',
            createdAt: new Date('2024-11-15').toISOString(),
            isImage: false
          }
        ];
        
        // Corregir las URLs en los archivos de ejemplo
        mockFiles.forEach(file => {
          if (file.url) {
            file.url = FileService.getFileUrl(file.url);
          }
        });
        
        // Simular retardo de red
        await new Promise(resolve => setTimeout(resolve, 500));
        return { success: true, files: mockFiles };
      }
      
      const response = await ApiService.get<FilesResponse>('upload');
      
      // Asegurar URLs correctas
      if (response.data && response.data.files) {
        response.data.files.forEach(file => {
          if (file.url && !file.url.startsWith('http')) {
            file.url = FileService.getFileUrl(file.url);
          }
          
          // Validamos si es una imagen basado en MIME type o extensión
          if (file.mimetype || file.filename) {
            file.isImage = file.mimetype?.startsWith('image/') || 
              (file.filename?.match(/\\.(jpg|jpeg|png|gif|webp|svg)$/i) !== null);
          }
        });
      }
      
      return response.data;
    } catch (error) {
      console.error('Error al obtener archivos:', error);
      
      // En modo demo, retornar datos simulados incluso en errores
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
   * @returns Información de los archivos subidos
   */
  static async uploadMultiple(files: File[]): Promise<UploadResponse[]> {
    try {
      const formData = new FormData();
      
      // Usar el campo 'files' que es lo que espera el backend
      files.forEach((file) => {
        formData.append('files', file);
      });
      
      // Verificar si estamos en modo demo
      if (typeof window !== 'undefined' && localStorage.getItem('DEMO_MODE') === 'true') {
        console.log('Ejecutando en modo demo: Simulando carga de múltiples archivos');
        
        // Generar respuestas simuladas para los archivos
        const mockResponses: UploadResponse[] = files.map((file, index) => ({
          success: true,
          filename: `mock-upload-${Date.now()}-${index}.${file.name.split('.').pop()}`,
          originalname: file.name,
          url: FileService.getFileUrl(`/uploads/${file.name}`),
          size: file.size,
          mimetype: file.type
        }));
        
        // Simular retardo de red
        await new Promise(resolve => setTimeout(resolve, 1000));
        return mockResponses;
      }
      
      // Llamada API normal para modo no-demo
      const response = await ApiService.postFormData<{success: boolean, files: UploadResponse[]}>('upload/multiple', formData);
      
      // Asegurar URLs correctas en la respuesta
      if (response.data && response.data.files) {
        response.data.files.forEach(file => {
          if (file.url && !file.url.startsWith('http')) {
            file.url = FileService.getFileUrl(file.url);
          }
        });
      }
      
      return response.data.files || [];
    } catch (error) {
      console.error('Error al subir múltiples archivos:', error);
      
      // En modo demo, retornar respuesta de éxito simulada incluso en errores
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
