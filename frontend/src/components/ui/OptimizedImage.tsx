import React from 'react';
import Image, { ImageProps } from 'next/image';
import { optimizedImages } from '@/utils/imagePreloader';

interface OptimizedImageProps extends Omit<ImageProps, 'src'> {
  src: string;
  fallbackSrc?: string;
  useOptimized?: boolean;
  optimizedSize?: 'sm' | 'md' | 'lg';
  onLoadingStateChange?: (isLoading: boolean) => void;
}

/**
 * Componente de imagen optimizado que maneja errores, placeholders y optimizaciones automáticamente
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  fallbackSrc = '/images/placeholder.jpg',
  useOptimized = true,
  optimizedSize = 'md',
  alt,
  onLoadingStateChange,
  placeholder = 'blur',
  blurDataURL = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZWVlZWVlIi8+PC9zdmc+',
  quality = 85,
  ...rest
}) => {
  // Determinar la fuente optimizada si es aplicable
  const imageSrc = React.useMemo(() => {
    if (!useOptimized) return src;
    
    // Si la URL es externa, usarla directamente
    if (src.startsWith('http')) return src;
    
    // Si es una ruta local, intentar usar la versión optimizada
    try {
      // Extraer el nombre base de la imagen de la ruta
      const pathParts = src.split('/');
      const fileName = pathParts[pathParts.length - 1];
      
      // Si ya incluye -sm, -md o -lg, no modificar
      if (fileName.includes('-sm.') || fileName.includes('-md.') || fileName.includes('-lg.')) {
        return src;
      }
      
      // Verificar si la fuente ya es una imagen optimizada
      if (src.includes('/optimized/')) {
        return src;
      }
      
      // Intentar construir la ruta a la imagen optimizada
      return optimizedImages.getResponsiveImagePath(fileName, { preferredSize: optimizedSize });
    } catch (error) {
      console.warn('Error al generar ruta optimizada:', error);
      return src;
    }
  }, [src, useOptimized, optimizedSize]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.warn(`Error al cargar imagen: ${src}`);
    (e.target as HTMLImageElement).src = fallbackSrc;
    if (onLoadingStateChange) onLoadingStateChange(false);
  };

  const handleLoadComplete = () => {
    if (onLoadingStateChange) onLoadingStateChange(false);
  };
  
  return (
    <Image
      src={imageSrc}
      alt={alt || 'Imagen'}
      quality={quality}
      placeholder={placeholder}
      blurDataURL={blurDataURL}
      onError={handleError}
      onLoadingComplete={handleLoadComplete}
      {...rest}
    />
  );
};

export default OptimizedImage;
