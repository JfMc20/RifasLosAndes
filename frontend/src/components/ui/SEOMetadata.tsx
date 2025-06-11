import Head from 'next/head';

interface SEOMetadataProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  ogUrl?: string;
  canonicalUrl?: string;
}

/**
 * Componente para manejar metadatos SEO en todas las páginas
 */
export const SEOMetadata = ({
  title,
  description,
  keywords = 'rifas, sorteos, premios, Chile, España, lotería',
  ogImage = '/images/og-image.jpg',
  ogUrl,
  canonicalUrl,
}: SEOMetadataProps) => {
  const siteTitle = `${title} | Rifas Los Andes`;
  const siteUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://rifalosandes.es';
  const fullOgUrl = ogUrl ? ogUrl : siteUrl;
  const fullCanonicalUrl = canonicalUrl ? canonicalUrl : fullOgUrl;
  
  return (
    <Head>
      {/* Metadatos básicos */}
      <title>{siteTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Metadatos Open Graph para redes sociales */}
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={fullOgUrl} />
      <meta property="og:image" content={`${siteUrl}${ogImage}`} />
      <meta property="og:site_name" content="Rifas Los Andes" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${siteUrl}${ogImage}`} />
      
      {/* URL Canónica para evitar contenido duplicado */}
      <link rel="canonical" href={fullCanonicalUrl} />
      
      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />

      {/* Otras etiquetas importantes */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="robots" content="index, follow" />
    </Head>
  );
};

export default SEOMetadata;
