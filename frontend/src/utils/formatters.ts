/**
 * Utilidades para formateo de datos
 */

/**
 * Formatea un tamaño de archivo en bytes a una representación legible (KB, MB, etc)
 * @param bytes Tamaño en bytes
 * @param decimals Número de decimales a mostrar
 */
export function formatFileSize(bytes?: number, decimals: number = 2): string {
  if (bytes === undefined || bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

/**
 * Formatea una fecha ISO a un formato legible en español
 * @param dateString Fecha en formato ISO
 */
export function formatDate(dateString?: string): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return dateString;
  }
}

/**
 * Trunca un texto si excede cierta longitud
 * @param text Texto a truncar
 * @param maxLength Longitud máxima
 */
export function truncateText(text: string, maxLength: number = 20): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + '...';
}
