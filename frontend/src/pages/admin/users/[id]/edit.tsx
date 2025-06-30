import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminLayout from '../../../../components/admin/Layout';
import { UserService } from '../../../../services/user.service';
import { AuthService } from '../../../../services/auth.service';
import { User } from '../../../../types';

const EditUserPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    role: 'user' as 'user' | 'admin' | 'seller',
    password: '',
    confirmPassword: '',
    changePassword: false,
  });
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Verificar autenticación y cargar datos
  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      router.push('/admin/login');
      return;
    }

    const fetchData = async () => {
      try {
        // Obtener el usuario actual
        const current = await AuthService.getCurrentUser();
        setCurrentUser(current);

        // Verificar si es admin
        if (current.role !== 'admin') {
          router.push('/admin/dashboard');
          return;
        }

        if (!id || typeof id !== 'string') return;

        // Obtener datos del usuario a editar
        const userData = await UserService.getUser(id);
        setUser(userData);
        setFormData({
          username: userData.username,
          name: userData.name || '',
          email: userData.email,
          role: userData.role,
          password: '',
          confirmPassword: '',
          changePassword: false,
        });

        setLoading(false);
      } catch (err: any) {
        console.error('Error al cargar usuario:', err);
        setError(err.response?.data?.message || 'Error al cargar los datos del usuario');
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateForm = () => {
    if (!formData.username || !formData.email || !formData.role) {
      setError('Por favor completa todos los campos obligatorios.');
      return false;
    }

    if (formData.changePassword) {
      if (!formData.password) {
        setError('Por favor ingresa la nueva contraseña.');
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Las contraseñas no coinciden.');
        return false;
      }

      if (formData.password.length < 8) {
        setError('La contraseña debe tener al menos 8 caracteres.');
        return false;
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Por favor ingresa un email válido.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm() || !user?._id) {
      return;
    }

    try {
      setSaving(true);
      setError('');

      // Preparar datos para actualizar
      const { confirmPassword, changePassword, password, ...updateData } = formData;
      
      // Si se va a cambiar la contraseña, incluirla en los datos
      if (changePassword && password) {
        Object.assign(updateData, { password });
      }

      await UserService.updateUser(user._id, updateData);
      
      // Si el usuario está editando su propio perfil y cambió el rol, cerrar sesión
      if (currentUser && user._id === currentUser._id && updateData.role !== currentUser.role) {
        alert('Tu rol ha sido modificado. Por favor inicia sesión nuevamente.');
        await AuthService.logout();
        router.push('/admin/login');
        return;
      }
      
      router.push('/admin/users');
    } catch (err: any) {
      console.error('Error al actualizar usuario:', err);
      setError(err.response?.data?.message || 'Error al actualizar el usuario');
      setSaving(false);
    }
  };

  return (
    <>
      <Head>
        <title>Editar Usuario - Admin Panel - Rifa Los Andes</title>
      </Head>
      
      <AdminLayout title="Editar Usuario">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-xl text-gray-600">Cargando...</div>
          </div>
        ) : user ? (
          <div className="bg-white shadow rounded-lg p-8">
            {error && (
              <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert">
                <p className="font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                <div className="mb-2">
                  <label htmlFor="username" className="block text-sm font-semibold text-gray-800 mb-2">
                    Nombre de usuario *
                  </label>
                  <input
                    type="text"
                    name="username"
                    id="username"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className="block w-full rounded-md border border-gray-300 bg-gray-50 py-3 px-4 shadow-sm focus:border-brand-accent focus:ring focus:ring-brand-accent focus:ring-opacity-20"
                    placeholder="nombreusuario"
                  />
                </div>
                
                <div className="mb-2">
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-800 mb-2">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full rounded-md border border-gray-300 bg-gray-50 py-3 px-4 shadow-sm focus:border-brand-accent focus:ring focus:ring-brand-accent focus:ring-opacity-20"
                    placeholder="Nombre y apellido"
                  />
                </div>
                
                <div className="mb-2">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full rounded-md border border-gray-300 bg-gray-50 py-3 px-4 shadow-sm focus:border-brand-accent focus:ring focus:ring-brand-accent focus:ring-opacity-20"
                    placeholder="ejemplo@correo.com"
                  />
                </div>
                
                <div className="mb-2">
                  <label htmlFor="role" className="block text-sm font-semibold text-gray-800 mb-2">
                    Rol *
                  </label>
                  <select
                    name="role"
                    id="role"
                    required
                    value={formData.role}
                    onChange={handleChange}
                    className="block w-full rounded-md border border-gray-300 bg-gray-50 py-3 px-4 shadow-sm focus:border-brand-accent focus:ring focus:ring-brand-accent focus:ring-opacity-20"
                    // Deshabilitar cambio de rol si es el usuario actual y es el único admin
                    disabled={
                      currentUser && 
                      user._id === currentUser._id && 
                      formData.role === 'admin'
                    }
                  >
                    <option value="user">Usuario</option>
                    <option value="admin">Administrador</option>
                    <option value="seller">Vendedor</option>
                  </select>
                  {currentUser && user._id === currentUser._id && formData.role === 'admin' && (
                    <p className="mt-2 text-xs text-gray-500">
                      No puedes cambiar tu propio rol de administrador.
                    </p>
                  )}
                </div>
                
                <div className="col-span-2 bg-gray-50 p-4 rounded-md border border-gray-200 mb-4">
                  <div className="flex items-center">
                    <input
                      id="changePassword"
                      name="changePassword"
                      type="checkbox"
                      checked={formData.changePassword}
                      onChange={handleChange}
                                            className="h-5 w-5 text-brand-accent focus:ring-brand-accent border-gray-300 rounded"
                    />
                    <label htmlFor="changePassword" className="ml-3 block text-sm font-medium text-gray-900">
                      Cambiar contraseña
                    </label>
                  </div>
                </div>
                
                {formData.changePassword && (
                  <>
                    <div className="mb-2">
                      <label htmlFor="password" className="block text-sm font-semibold text-gray-800 mb-2">
                        Nueva contraseña *
                      </label>
                      <input
                        type="password"
                        name="password"
                        id="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="block w-full rounded-md border border-gray-300 bg-gray-50 py-3 px-4 shadow-sm focus:border-brand-accent focus:ring focus:ring-brand-accent focus:ring-opacity-20"
                        minLength={8}
                        required={formData.changePassword}
                        placeholder="********"
                      />
                      <p className="mt-2 text-xs text-gray-500">
                        La contraseña debe tener al menos 8 caracteres.
                      </p>
                    </div>
                    
                    <div className="mb-2">
                      <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-800 mb-2">
                        Confirmar contraseña *
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        id="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="block w-full rounded-md border border-gray-300 bg-gray-50 py-3 px-4 shadow-sm focus:border-brand-accent focus:ring focus:ring-brand-accent focus:ring-opacity-20"
                        minLength={8}
                        required={formData.changePassword}
                        placeholder="********"
                      />
                    </div>
                  </>
                )}
              </div>
              
              <div className="mt-8 flex items-center justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => router.push('/admin/users')}
                  className="px-5 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                                    className="px-5 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-accent hover:bg-brand-accent-dark focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2 transition-all disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
            <p>No se encontró el usuario solicitado.</p>
            <button
              onClick={() => router.push('/admin/users')}
                            className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-brand-accent hover:bg-brand-accent-dark focus:outline-none"
            >
              Volver a Usuarios
            </button>
          </div>
        )}
      </AdminLayout>
    </>
  );
};

export default EditUserPage;
