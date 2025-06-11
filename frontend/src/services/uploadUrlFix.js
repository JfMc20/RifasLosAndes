// Este script corrige las URLs de las imágenes subidas en el frontend
// Para ser ejecutado en la consola del navegador

// Encuentra todas las imágenes que apuntan a localhost:3000/uploads y cambia a localhost:3001/uploads
function fixUploadUrls() {
  const images = document.querySelectorAll('img[src*="localhost:3000/uploads"]');
  let count = 0;
  
  images.forEach(img => {
    const oldSrc = img.src;
    const newSrc = oldSrc.replace('localhost:3000/uploads', 'localhost:3001/uploads');
    img.src = newSrc;
    count++;
    console.log(`Corregida URL: ${oldSrc} → ${newSrc}`);
  });
  
  return `${count} URLs de imágenes corregidas`;
}

// Para solucionar permanentemente el problema, necesitamos modificar el método getFullUrl 
// en el archivo upload.service.ts para que siempre use el puerto 3001 para los archivos

/*
Modificación recomendada:

static getFullUrl(relativePath: string): string {
  if (!relativePath) return '';
  
  // Si la ruta ya es una URL completa, devolverla tal cual
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }
  
  // Usamos directamente el puerto 3001 (backend) para archivos
  const baseUrl = 'http://localhost:3001';
  
  // Preparar la ruta del archivo
  let filePath = relativePath;
  
  // Eliminar cualquier '/' inicial 
  filePath = filePath.replace(/^\/+/, '');
  
  // Si no contiene 'uploads/', añadirlo
  if (!filePath.startsWith('uploads/')) {
    filePath = `uploads/${filePath}`;
  }
  
  // Construir la URL completa
  return `${baseUrl}/${filePath}`;
}
*/

console.log('Script de corrección de URLs cargado. Ejecuta fixUploadUrls() para corregir las URLs en la página actual');
