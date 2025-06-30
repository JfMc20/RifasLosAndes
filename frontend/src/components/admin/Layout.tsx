import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { AuthService } from '../../services/auth.service';
import Breadcrumbs from './common/Breadcrumbs'; // Importar Breadcrumbs

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const currentPath = router.pathname;

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await AuthService.getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error('Error al cargar usuario:', error);
        // Si falla la carga del usuario (ej. token inválido), redirigir al login
        if (router.pathname !== '/admin/login') {
          AuthService.logout();
          router.push('/admin/login');
        }
      }
    };

    if (AuthService.isAuthenticated()) {
      loadUser();
    } else if (router.pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [router]);

  const handleLogout = () => {
    AuthService.logout();
    router.push('/admin/login');
  };

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: <IconDashboard /> },
    { path: '/admin/raffles', label: 'Rifas', icon: <IconRaffles /> },
    { path: '/admin/content', label: 'Contenido', icon: <IconContent /> },
    { path: '/admin/users', label: 'Usuarios', icon: <IconUsers />, adminOnly: true },
    { path: '/admin/settings', label: 'Configuración', icon: <IconSettings /> },
  ];

  // No renderizar el layout en la página de login
  if (currentPath === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-ui-background">
      {/* Sidebar para móviles y escritorio */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-ui-surface shadow-lg transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
        <div className="flex items-center justify-center h-20 border-b border-ui-border">
          <Link href="/admin/dashboard" className="text-2xl font-bold text-brand-accent">
            RifasAdmin
          </Link>
        </div>
        <nav className="py-6 px-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              (!item.adminOnly || (currentUser && currentUser.role === 'admin')) && (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
                      currentPath.startsWith(item.path)
                        ? 'bg-brand-accent text-brand-primary font-bold'
                        : 'text-ui-text-secondary hover:bg-ui-background hover:text-ui-text-primary'
                    }`}>
                    <span className="mr-3">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              )
            ))}
          </ul>
          <div className="mt-8 px-4">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-sm text-ui-text-secondary hover:text-brand-accent transition-colors duration-200">
              <IconExternalLink className="mr-2" />
              Ver sitio público
            </Link>
          </div>
        </nav>
      </aside>

      {/* Overlay para cerrar sidebar en móvil */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black opacity-50 md:hidden"
          onClick={() => setIsSidebarOpen(false)}></div>
      )}

      <div className="md:ml-64 flex flex-col flex-1">
        {/* Header */}
        <header className="flex justify-between items-center h-20 bg-ui-surface shadow-md px-6 z-30">
          {/* Botón para abrir sidebar en móvil */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-ui-text-primary md:hidden">
            <IconMenu />
          </button>
          
          <h1 className="text-xl font-semibold text-ui-text-primary hidden md:block">
            {title}
          </h1>

          {/* Menú de usuario */}
          <div className="flex items-center space-x-4">
            {currentUser && (
              <span className="text-sm text-ui-text-secondary hidden sm:inline">
                {currentUser.name || currentUser.username}
              </span>
            )}
            <Link href="/admin/profile" className="text-ui-text-secondary hover:text-brand-accent">
              <IconUser />
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-ui-text-light bg-brand-danger hover:bg-opacity-90 transition-colors">
              <IconLogout className="mr-2"/>
              Salir
            </button>
          </div>
        </header>

        {/* Contenido Principal */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <Breadcrumbs /> {/* Añadir Breadcrumbs aquí */}
            <h1 className="text-2xl font-bold text-ui-text-primary mb-6 md:hidden">
              {title}
            </h1>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

// --- Icon Components ---
// Usar componentes de iconos mejora la legibilidad y el mantenimiento.

const IconDashboard = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const IconRaffles = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
  </svg>
);

const IconContent = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
  </svg>
);

const IconUsers = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const IconSettings = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const IconExternalLink = ({ className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);

const IconMenu = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
  </svg>
);

const IconUser = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const IconLogout = ({ className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);

export default AdminLayout;
