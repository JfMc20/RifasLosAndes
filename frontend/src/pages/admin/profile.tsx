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
        <title>Mi Perfil - Rifas Los Andes</title>
      </Head>
      <AdminLayout title="Mi Perfil">
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-brand-accent"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-3 rounded-lg mb-6" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-700 px-4 py-3 rounded-lg mb-6" role="alert">
            <strong className="font-bold">Éxito: </strong>
            <span className="block sm:inline">{success}</span>
          </div>
        )}

        {!loading && user && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Card: Información del perfil */}
            <div className="bg-ui-surface p-8 rounded-xl shadow-lg border border-ui-border">
              <h2 className="text-2xl font-bold text-ui-text-primary mb-6">Información del Perfil</h2>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-ui-text-secondary mb-1">Nombre de usuario *</label>
                    <input
                      type="text"
                      name="username"
                      id="username"
                      required
                      value={profileData.username}
                      onChange={handleProfileChange}
                      className="mt-1 block w-full p-3 bg-ui-background border border-ui-border rounded-lg focus:ring-brand-accent focus:border-brand-accent"
                    />
                  </div>
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-ui-text-secondary mb-1">Nombre completo</label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      className="mt-1 block w-full p-3 bg-ui-background border border-ui-border rounded-lg focus:ring-brand-accent focus:border-brand-accent"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-ui-text-secondary mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    value={profileData.email}
                    onChange={handleProfileChange}
                    className="mt-1 block w-full p-3 bg-ui-background border border-ui-border rounded-lg focus:ring-brand-accent focus:border-brand-accent"
                  />
                </div>
                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center justify-center px-6 py-3 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-primary-dark transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </form>
            </div>
            
            {/* Card: Cambio de contraseña */}
            <div className="bg-ui-surface p-8 rounded-xl shadow-lg border border-ui-border">
              <h2 className="text-2xl font-bold text-ui-text-primary mb-6">Cambiar Contraseña</h2>
              <form onSubmit={handleChangePassword} className="space-y-6">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-ui-text-secondary mb-1">Contraseña actual *</label>
                  <input
                    type="password"
                    name="currentPassword"
                    id="currentPassword"
                    required
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="mt-1 block w-full p-3 bg-ui-background border border-ui-border rounded-lg focus:ring-brand-accent focus:border-brand-accent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-ui-text-secondary mb-1">Nueva contraseña *</label>
                    <input
                      type="password"
                      name="newPassword"
                      id="newPassword"
                      required
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      minLength={8}
                      className="mt-1 block w-full p-3 bg-ui-background border border-ui-border rounded-lg focus:ring-brand-accent focus:border-brand-accent"
                    />
                    <p className="mt-2 text-xs text-ui-text-secondary">Mínimo 8 caracteres.</p>
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-ui-text-secondary mb-1">Confirmar nueva contraseña *</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      id="confirmPassword"
                      required
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      minLength={8}
                      className="mt-1 block w-full p-3 bg-ui-background border border-ui-border rounded-lg focus:ring-brand-accent focus:border-brand-accent"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center justify-center px-6 py-3 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-primary-dark transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Cambiando...' : 'Cambiar Contraseña'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {!loading && !user && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md" role="alert">
            <p className="font-bold">Atención</p>
            <p>No se pudo cargar la información del perfil. Por favor, intenta de nuevo más tarde.</p>
          </div>
        )}
      </AdminLayout>
    </>
  );
};

export default ProfilePage;
