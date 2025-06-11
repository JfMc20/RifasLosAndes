import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import AdminLayout from '../../../components/admin/Layout';
import { AuthService } from '../../../services/auth.service';

const SettingsPage: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Verificar autenticación y permisos
  useEffect(() => {
    const checkAuth = async () => {
      if (!AuthService.isAuthenticated()) {
        router.push('/admin/login');
        return;
      }

      try {
        const currentUser = await AuthService.getCurrentUser();
        setIsAdmin(currentUser.role === 'admin');
        setLoading(false);
      } catch (err) {
        console.error('Error al verificar permisos:', err);
        router.push('/admin/login');
      }
    };

    checkAuth();
  }, [router]);

  // Lista de configuraciones disponibles
  const settingsOptions = [
    {
      id: 'whatsapp',
      title: 'Configuración de WhatsApp',
      description: 'Configura las notificaciones automáticas por WhatsApp para la venta de boletos.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
      adminOnly: true
    },
    {
      id: 'profile',
      title: 'Mi Perfil',
      description: 'Actualiza tu información personal y credenciales de acceso.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      adminOnly: false
    }
  ];

  return (
    <>
      <Head>
        <title>Configuración del Sistema - Admin Panel - Rifa Los Andes</title>
      </Head>
      
      <AdminLayout title="Configuración del Sistema">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-xl text-gray-600">Cargando...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {settingsOptions.map((option) => (
              (isAdmin || !option.adminOnly) && (
                <Link
                  key={option.id}
                  href={option.id === 'profile' ? '/admin/profile' : `/admin/settings/${option.id}`}
                  className="block"
                >
                  <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 p-3 rounded-md ${option.id === 'whatsapp' ? 'bg-green-100 text-green-600' : option.id === 'profile' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                          {option.icon}
                        </div>
                        <div className="ml-5">
                          <h3 className="text-lg font-medium text-gray-900">{option.title}</h3>
                          <p className="mt-1 text-sm text-gray-500">{option.description}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <span className="inline-flex items-center text-sm font-medium text-primary hover:text-primary-dark">
                          Configurar
                          <svg className="ml-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            ))}
          </div>
        )}
      </AdminLayout>
    </>
  );
};

export default SettingsPage;
