import { ApiService } from './api';

// Constante para la URL base de los archivos (puerto del backend, no del frontend)
// URL base para acceder a los archivos directamente
export const FILES_BASE_URL = process.env.NEXT_PUBLIC_API_URL 
  ? process.env.NEXT_PUBLIC_API_URL
  : 'http://localhost:3001';

/**
 * FileService - Servicio global para gestionar archivos y URLs
 * 
 * Este servicio centraliza todas las operaciones relacionadas con archivos y URLs
 * asegurando consistencia en toda la aplicación para acceder a los archivos del backend.
 */
export class FileService {
  /**
   * Construye una URL completa para un archivo subido
   * @param relativePath Ruta relativa del archivo (puede incluir o no /uploads/)
   */
  static getFileUrl(relativePath: string): string {
    // Si no hay ruta, devolver cadena vacía
    if (!relativePath) return '';
    
    // Si la ruta ya es una URL completa, devolverla tal cual
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
      return relativePath;
    }
    
    // Preparar la ruta del archivo asegurando formato correcto
    let filePath = relativePath;
    
    // Eliminar cualquier '/' inicial para evitar rutas mal formadas
    filePath = filePath.replace(/^\/+/, '');
    
    // Si la ruta ya está en el formato '/api/uploads/...' simplemente devolvemos la URL base + ruta
    if (filePath.startsWith('api/uploads/')) {
      return `${FILES_BASE_URL.replace(/\/api$/, '')}/${filePath}`;
    }
    
    // Si la ruta ya está en el formato 'uploads/...' simplemente devolvemos la URL base + ruta
    if (filePath.startsWith('uploads/')) {
      // Si FILES_BASE_URL termina en /api, lo quitamos para acceder a los archivos estáticos
      return `${FILES_BASE_URL.replace(/\/api$/, '')}/${filePath}`;
    }
    
    // Si no contiene 'uploads/', añadirlo
    return `${FILES_BASE_URL.replace(/\/api$/, '')}/uploads/${filePath}`;
  }
  
  /**
   * Formatea una URL para mostrar en la UI (versión corta)
   * @param url URL completa del archivo
   */
  static formatUrlForDisplay(url: string): string {
    if (!url) return '';
    
    // Si es una URL completa, mostrar solo la parte final después de /uploads/
    if (url.includes('/uploads/')) {
      return url.split('/uploads/')[1] || url;
    }
    
    return url;
  }
  
  /**
   * Copia una URL al portapapeles
   * @param url URL a copiar
   */
  static async copyToClipboard(url: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      return false;
    }
  }
  
  /**
   * Determina si un archivo es una imagen basado en su MIME type o extensión
   * @param mimetype MIME type del archivo
   * @param filename Nombre del archivo (opcional, usado si no hay mimetype)
   */
  static isImage(mimetype?: string, filename?: string): boolean {
    // Verificar por MIME type primero
    if (mimetype && mimetype.startsWith('image/')) {
      return true;
    }
    
    // Si no hay MIME type, verificar por extensión del nombre
    if (filename) {
      const extension = filename.split('.').pop()?.toLowerCase();
      return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '');
    }
    
    return false;
  }
  
  /**
   * Obtiene la extensión de un archivo desde su nombre o URL
   * @param filenameOrUrl Nombre o URL del archivo
   */
  static getFileExtension(filenameOrUrl?: string): string {
    if (!filenameOrUrl) return '';
    
    // Obtener solo el nombre del archivo sin la ruta
    const filename = filenameOrUrl.split('/').pop() || '';
    
    // Obtener la extensión
    const extension = filename.split('.').pop() || '';
    return extension.toLowerCase();
  }
}
