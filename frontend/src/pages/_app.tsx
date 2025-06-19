import '@/styles/globals.css';
import '@/styles/animations.css';
import type { AppProps } from 'next/app';
import { Inter } from 'next/font/google';
import Head from 'next/head';
import { useEffect } from 'react';
import { preloadSiteImages } from '@/utils/imagePreloader';

const inter = Inter({ subsets: ['latin'] });

export default function App({ Component, pageProps }: AppProps) {
  // Efecto para evitar el scrolling horizontal
  useEffect(() => {
    // Función para eliminar desplazamiento horizontal
    const preventHorizontalScroll = () => {
      document.body.style.overflowX = 'hidden';
      document.documentElement.style.overflowX = 'hidden';
      document.documentElement.style.margin = '0';
      document.documentElement.style.padding = '0';
      document.documentElement.style.width = '100%';
      document.documentElement.style.maxWidth = '100vw';
    };

    preventHorizontalScroll();
    
    // Aplicar también cuando cambie el tamaño de la ventana
    window.addEventListener('resize', preventHorizontalScroll);
    
    return () => {
      window.removeEventListener('resize', preventHorizontalScroll);
    };
  }, []);

  // Efecto para precargar imágenes críticas
  useEffect(() => {
    // Solamente ejecutar en el cliente
    if (typeof window !== 'undefined') {
      // Iniciar la precarga de imágenes después de que los componentes principales se hayan renderizado
      const timer = setTimeout(() => {
        preloadSiteImages().catch(err => {
          // Ignorar errores silenciosamente para no interrumpir la experiencia del usuario
          console.warn('Error al precargar imágenes:', err);
        });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <>
      <Head>
        <title>Rifa Los Andes - Toyota Corolla 2020 SE</title>
        <meta name="description" content="Participa en la gran Rifa Los Andes y gana un Toyota Corolla 2020 SE. Números limitados disponibles." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${inter.className} overflow-x-hidden w-full max-w-full`}>
        <Component {...pageProps} />
      </main>
    </>
  );
}
