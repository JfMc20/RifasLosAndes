import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminLayout from '../../../components/admin/Layout';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../types';
import ActionButtons from '../../../components/admin/common/ActionButtons';
import { formatDate } from '../../../utils/formatters';
import { NotificationService } from '../../../services/notification.service';
import ConfirmationModal from '../../../components/admin/common/ConfirmationModal'; // Importar ConfirmationModal

const UsersPage: React.FC = () => {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false); // Para el modal
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Estado para el modal de confirmación
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<{ title: string; message: string; onConfirm: () => void; confirmText?: string; confirmButtonColor?: string; userName?: string; }>({ // Añadido userName opcional
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Verificar autenticación
  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      router.push('/admin/login');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        // Obtener perfil del usuario actual
        const userProfile = AuthService.getCurrentUser();
        if (userProfile && '_id' in userProfile) {
          setCurrentUser(userProfile as User);
        } else {
          // If the user profile doesn't match the expected structure, try to get it from API
          try {
            const apiUserProfile = await AuthService.getProfile();
            setCurrentUser(apiUserProfile);
          } catch (error) {
            console.error('Error getting user profile:', error);
            setError('Error al obtener el perfil de usuario');
            setLoading(false);
            return;
          }
        }

        // Verificar si es admin
        const currentUserProfile = AuthService.getCurrentUser();
        if (!currentUserProfile || currentUserProfile.role !== 'admin') {
          setError('No tienes permisos para ver esta página');
          setLoading(false);
          return;
        }

        // Obtener todos los usuarios
        const usersData = await UserService.getAllUsers();
        // Ensure we have an array of users
        if (Array.isArray(usersData)) {
          setUsers(usersData);
        } else {
          // If we don't get an array (like in demo mode), set an empty array
          console.warn('Expected array of users but got:', usersData);
          setUsers([]);
        }
        setLoading(false);
      } catch (err: any) {
        console.error('Error al cargar usuarios:', err);
        setError(err.response?.data?.message || 'Error al cargar los usuarios');
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleDeleteUser = async (userId: string) => {
    // Evitar que un usuario se elimine a sí mismo
    if (currentUser && userId === currentUser._id) {
      NotificationService.warning('No puedes eliminar tu propio usuario.');
      return;
    }

    const userToDelete = users.find(u => u._id === userId);

    setModalContent({
      title: 'Confirmar Eliminación de Usuario',
      message: `¿Estás seguro de que quieres eliminar al usuario "${userToDelete?.name || userToDelete?.username}"? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar Usuario',
      confirmButtonColor: 'bg-brand-danger hover:bg-brand-danger-dark',
      onConfirm: async () => {
        setIsModalOpen(false);
        setIsProcessing(true);
        try {
          await UserService.deleteUser(userId);
          setUsers(users.filter(user => user._id !== userId));
          NotificationService.success('Usuario eliminado correctamente.');
        } catch (err: any) {
          console.error('Error al eliminar usuario:', err);
          NotificationService.error(err.response?.data?.message || 'Error al eliminar el usuario.');
        } finally {
          setIsProcessing(false);
        }
      },
    });
    setIsModalOpen(true);
  };

  // Formato de fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <>
      <Head>
        <title>Gestión de Usuarios - Admin Panel - Rifa Los Andes</title>
      </Head>
      
      <AdminLayout title="Gestión de Usuarios">
        <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Usuarios</h2>
            <p className="text-sm text-gray-500 mt-1">Administra los usuarios del sistema</p>
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => router.push('/admin/users/create')}
              className="inline-flex items-center px-5 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Crear usuario
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow p-8">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
              <div className="text-lg text-gray-600 font-medium">Cargando usuarios...</div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg overflow-hidden shadow border border-gray-100">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Rol
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Creado
                  </th>
                  <th scope="col" className="relative px-6 py-4">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      No hay usuarios registrados.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-gray-100 rounded-full">
                            <span className="font-medium text-gray-600">{user.name ? user.name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}</span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900">
                              {user.name || user.username}
                            </div>
                            <div className="text-xs text-gray-500">{user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        {user.role === 'admin' ? (
                          <span className="px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Administrador
                          </span>
                        ) : user.role === 'seller' ? (
                          <span className="px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8z" />
                            </svg>
                            Vendedor
                          </span>
                        ) : (
                          <span className="px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                            Usuario
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {user.createdAt ? formatDate(user.createdAt) : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <ActionButtons 
                            actions={[
                              {
                                label: "Editar",
                                color: "primary",
                                onClick: () => router.push(`/admin/users/${user._id}/edit`)
                              },
                              ...(currentUser && user._id !== currentUser._id ? [
                                {
                                  label: "Eliminar",
                                  color: "danger",
                                  onClick: () => handleDeleteUser(user._id)
                                }
                              ] : [])
                            ]}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        <ConfirmationModal
          isOpen={isModalOpen}
          title={modalContent.title}
          message={modalContent.message}
          onConfirm={modalContent.onConfirm}
          onCancel={() => setIsModalOpen(false)}
          confirmText={modalContent.confirmText}
          confirmButtonColor={modalContent.confirmButtonColor}
          isConfirming={isProcessing}
        />
      </AdminLayout>
    </>
  );
};

export default UsersPage;
