import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface BreadcrumbItem {
  href: string;
  label: string;
}

const translations: { [key: string]: string } = {
  admin: 'Admin',
  dashboard: 'Dashboard',
  raffles: 'Rifas',
  users: 'Usuarios',
  content: 'Contenido',
  settings: 'Configuración',
  create: 'Crear',
  edit: 'Editar',
  tickets: 'Boletos',
  uploads: 'Archivos',
  profile: 'Perfil',
  // Se pueden añadir más traducciones según sea necesario
};

const Breadcrumbs: React.FC = () => {
  const router = useRouter();
  const pathSegments = router.pathname.split('/').filter(segment => segment);

  if (pathSegments.length === 0 || (pathSegments.length === 1 && pathSegments[0] === 'admin')) {
    // No mostrar breadcrumbs en la raíz de admin o si solo es /admin
    // Opcionalmente, se podría mostrar un breadcrumb "Admin" o "Dashboard" aquí.
    // Por ahora, para evitar redundancia con el título de la página en Dashboard, no mostramos nada.
    return null;
  }

  const breadcrumbs: BreadcrumbItem[] = pathSegments.reduce((acc: BreadcrumbItem[], segment, index) => {
    const href = `/${pathSegments.slice(0, index + 1).join('/')}`;

    // Intentar traducir el segmento, o usar el ID/palabra capitalizada
    let label = translations[segment.toLowerCase()] || segment;

    // Si es un ID (típicamente un string largo alfanumérico o numérico), podríamos querer acortarlo o manejarlo diferente.
    // Por ahora, si no está en translations, se asume que es un ID o un nombre específico y se muestra tal cual.
    // Para mejorar: se podría intentar cargar el nombre del recurso (ej. nombre de la rifa) si es un ID.
    if (segment.length > 20 && !translations[segment.toLowerCase()]) { // Heurística simple para IDs
        // Podríamos mostrar "Detalle" o el ID acortado.
        // label = `ID: ${segment.substring(0, 8)}...`;
    } else {
        label = label.charAt(0).toUpperCase() + label.slice(1);
    }


    // Evitar duplicar "Admin" si es el primer segmento útil después de "admin"
    if (index === 0 && segment.toLowerCase() === 'admin' && pathSegments.length > 1) {
        // Si "admin" es el único segmento útil (ej. /admin), ya se manejó arriba.
        // Si hay más segmentos, "Admin" será el primer breadcrumb.
        // No se añade aquí, se manejará en el primer render útil.
        return acc;
    }

    // El primer breadcrumb siempre es "Admin" si estamos en una subruta de admin
    if (acc.length === 0 && pathSegments[0].toLowerCase() === 'admin') {
        acc.push({ href: '/admin/dashboard', label: 'Admin' }); // O '/admin' si es preferible
    }

    // Si el path es solo /admin/alguna-cosa, y ya pusimos "Admin", ahora ponemos "AlgunaCosa"
    // Evitar añadir "Admin" de nuevo si es el primer segmento
    if (index === 0 && segment.toLowerCase() === 'admin') {
        return acc; // Ya se añadió "Admin" o se omitirá si es la única parte
    }


    acc.push({ href, label });
    return acc;
  }, [] as BreadcrumbItem[]);

  // Si después del procesamiento solo tenemos "Admin" y estamos en /admin/dashboard, no mostrarlo.
  // O si solo tenemos "Admin" y estamos en /admin.
  if (breadcrumbs.length === 1 && breadcrumbs[0].label === 'Admin' && (router.pathname === '/admin/dashboard' || router.pathname === '/admin')) {
    return null;
  }


  return (
    <nav aria-label="Breadcrumb" className="mb-6 text-sm text-ui-text-secondary">
      <ol className="list-none p-0 inline-flex space-x-2">
        {breadcrumbs.map((breadcrumb, index) => (
          <li key={breadcrumb.href} className="flex items-center">
            {index < breadcrumbs.length - 1 ? (
              <Link href={breadcrumb.href} className="hover:text-brand-accent hover:underline">
                {breadcrumb.label}
              </Link>
            ) : (
              <span className="text-ui-text-primary font-medium" aria-current="page">
                {breadcrumb.label}
              </span>
            )}
            {index < breadcrumbs.length - 1 && (
            // Chevron right icon
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-ui-text-tertiary" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
