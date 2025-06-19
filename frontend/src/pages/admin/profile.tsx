import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminLayout from '../../components/admin/Layout';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../types';

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState<User | null>(null);
  
  const [profileData, setProfileData] = useState({
    username: '',
    name: '',
    email: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Verificar autenticación y cargar datos
  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      router.push('/admin/login');
      return;
    }

    const loadUserProfile = async () => {
      try {
        setLoading(true);
        const userData = await AuthService.getCurrentUser();
        setUser(userData);
        setProfileData({
          username: userData.username,
          name: userData.name || '',
          email: userData.email
        });
        setLoading(false);
      } catch (err: any) {
        console.error('Error al cargar perfil:', err);
        setError('No se pudo cargar la información del perfil');
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [router]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateProfileForm = () => {
    if (!profileData.username || !profileData.email) {
      setError('El nombre de usuario y email son obligatorios');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileData.email)) {
      setError('Por favor ingresa un email válido');
      return false;
    }

    return true;
  };

  const validatePasswordForm = () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setError('Todos los campos de contraseña son obligatorios');
      return false;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Las contraseñas nuevas no coinciden');
      return false;
    }

    if (passwordData.newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return false;
    }

    return true;
  };

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateProfileForm() || !user) {
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      await UserService.updateProfile(profileData);
      
      // Actualizar datos del usuario en la sesión
      const updatedUser = await AuthService.getProfile();
      setUser(updatedUser);
      
      setSuccess('Perfil actualizado con éxito');
      setSaving(false);
    } catch (err: any) {
      console.error('Error al actualizar perfil:', err);
      setError(err.response?.data?.message || 'Error al actualizar el perfil');
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validatePasswordForm() || !user) {
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      await UserService.changePassword(
        user._id,
        passwordData.currentPassword,
        passwordData.newPassword
      );
      
      // Limpiar formulario de contraseña
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setSuccess('Contraseña actualizada con éxito');
      setSaving(false);
    } catch (err: any) {
      console.error('Error al cambiar contraseña:', err);
      setError(err.response?.data?.message || 'Error al cambiar la contraseña');
      setSaving(false);
    }
  };

  return (
    <>
      <Head>
        <title>Mi Perfil - Admin Panel - Rifa Los Andes</title>
      </Head>
      
      <AdminLayout title="Mi Perfil">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-xl text-gray-600">Cargando...</div>
          </div>
        ) : user ? (
          <div className="space-y-8">
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
                <p>{error}</p>
              </div>
            )}
            
            {success && (
              <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4" role="alert">
                <p>{success}</p>
              </div>
            )}
            
            {/* Información de perfil */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-5">Información del perfil</h2>
              <form onSubmit={handleUpdateProfile}>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre de usuario *
                    </label>
                    <input
                      type="text"
                      name="username"
                      id="username"
                      required
                      value={profileData.username}
                      onChange={handleProfileChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      required
                      value={profileData.email}
                      onChange={handleProfileChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                      Rol
                    </label>
                    <input
                      type="text"
                      id="role"
                      value={user.role === 'admin' ? 'Administrador' : 'Usuario'}
                      disabled
                      className="block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none disabled:opacity-50"
                  >
                    {saving ? 'Guardando...' : 'Actualizar perfil'}
                  </button>
                </div>
              </form>
            </div>
            
            {/* Cambio de contraseña */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-5">Cambiar contraseña</h2>
              <form onSubmit={handleChangePassword}>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Contraseña actual *
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      id="currentPassword"
                      required
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    />
                  </div>
                  
                  <div className="sm:col-span-2">
                    <div className="h-px bg-gray-200 my-6"></div>
                  </div>
                  
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Nueva contraseña *
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      id="newPassword"
                      required
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      minLength={8}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      La contraseña debe tener al menos 8 caracteres.
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmar nueva contraseña *
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      id="confirmPassword"
                      required
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      minLength={8}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none disabled:opacity-50"
                  >
                    {saving ? 'Cambiando...' : 'Cambiar contraseña'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
            <p>No se pudo cargar la información del perfil.</p>
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none"
            >
              Volver al Dashboard
            </button>
          </div>
        )}
      </AdminLayout>
    </>
  );
};

export default ProfilePage;
