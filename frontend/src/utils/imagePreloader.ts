/**
 * Utilidad para precargar imágenes estratégicamente
 * Esto mejora significativamente la experiencia de usuario al tener las imágenes
 * importantes ya en caché cuando se necesitan mostrar
 */

/**
 * Precarga una imagen y devuelve una promesa que se resuelve cuando la imagen se ha cargado
 */
export const preloadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
};

/**
 * Precarga un conjunto de imágenes y devuelve una promesa que se resuelve
 * cuando todas las imágenes se han cargado
 */
export const preloadImages = async (
  sources: string[],
  options: {
    parallel?: boolean;
    onProgress?: (loaded: number, total: number) => void;
  } = {}
): Promise<HTMLImageElement[]> => {
  const { parallel = true, onProgress } = options;
  const total = sources.length;
  let loaded = 0;
  
  if (parallel) {
    // Carga todas las imágenes en paralelo
    const promises = sources.map(
      (src) =>
        new Promise<HTMLImageElement>((resolve) => {
          preloadImage(src)
            .then((img) => {
              loaded++;
              if (onProgress) onProgress(loaded, total);
              resolve(img);
            })
            .catch(() => {
              loaded++;
              if (onProgress) onProgress(loaded, total);
              // Resolver con null en caso de error para no romper Promise.all
              resolve(null as unknown as HTMLImageElement);
            });
        })
    );
    return Promise.all(promises);
  } else {
    // Carga las imágenes secuencialmente
    const images: HTMLImageElement[] = [];
    for (const src of sources) {
      try {
        const img = await preloadImage(src);
        images.push(img);
      } catch (error) {
        // Ignorar errores y continuar con la siguiente imagen
      }
      loaded++;
      if (onProgress) onProgress(loaded, total);
    }
    return images;
  }
};

/**
 * Precarga las imágenes principales del sitio de forma inteligente basado en
 * la velocidad de conexión del usuario y la prioridad
 */
export const preloadSiteImages = async (): Promise<void> => {
  // Detectar velocidad de conexión si está disponible
  const isSlowConnection = 
    typeof navigator !== 'undefined' && 'connection' in navigator
    ? (navigator as any).connection?.effectiveType === '2g' ||
      (navigator as any).connection?.saveData
    : false;

  // Imágenes críticas que deberían cargarse primero
  const criticalImages = [
    '/images/optimized/hero-1-md.webp',
    '/images/optimized/LOGO-sm.webp'
  ];
  
  // Imágenes que se cargan después de las críticas
  const secondaryImages = [
    '/images/optimized/prize-1-md.webp',
    '/images/optimized/prize-2-md.webp',
    '/images/optimized/personados-md.webp'
  ];

  try {
    // Precargar primero las imágenes críticas
    await preloadImages(criticalImages);

    // Si la conexión no es lenta, precargar el resto en paralelo
    if (!isSlowConnection) {
      // No esperamos a que termine, dejamos que se cargue en segundo plano
      preloadImages(secondaryImages);
    }
  } catch (error) {
    // Fallos silenciosos, no queremos romper la aplicación si la precarga falla
    console.warn('Error al precargar imágenes:', error);
  }
};

// Objeto especial que expone información sobre las imágenes optimizadas disponibles
export const optimizedImages = {
  // Selecciona la mejor versión de una imagen según el tamaño de pantalla
  getResponsiveImagePath: (
    baseName: string,
    options: { preferredSize?: 'sm' | 'md' | 'lg'; format?: 'webp' | 'avif' } = {}
  ): string => {
    const { preferredSize = 'md', format = 'webp' } = options;
    
    // Detectar si el navegador soporta AVIF
    let supportsAvif = false;
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      try {
        supportsAvif = document.createElement('canvas').toDataURL('image/avif').indexOf('data:image/avif') === 0;
      } catch (e) {
        // En algunos entornos (ej. JSDOM sin soporte canvas completo), esto puede fallar.
        supportsAvif = false;
      }
    }
    
    // Usar AVIF si el navegador lo soporta y se solicita, webp como fallback
    const actualFormat = (format === 'avif' && supportsAvif) ? 'avif' : 'webp';
    
    // Quitar la extensión si existe
    const nameWithoutExt = baseName.replace(/\.[^/.]+$/, "");

    return `/images/optimized/${nameWithoutExt}-${preferredSize}.${actualFormat}`;
  },
  
  // Obtener el placeholder para una imagen
  getPlaceholder: (baseName: string): string => {
    // Quitar la extensión si existe
    const nameWithoutExt = baseName.replace(/\.[^/.]+$/, "");
    return `/images/optimized/${nameWithoutExt}-placeholder.webp`;
  }
};
