import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminLayout from '../../../components/admin/Layout';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../types';

const CreateUserPage: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user' as 'user' | 'admin' | 'seller' // Por defecto, rol 'user'
  });

  // Verificar autenticación y permisos
  useEffect(() => {
    const checkAuth = async () => {
      if (!AuthService.isAuthenticated()) {
        router.push('/admin/login');
        return;
      }

      try {
        const currentUser = await AuthService.getCurrentUser();
        if (currentUser.role !== 'admin') {
          router.push('/admin/dashboard');
        }
      } catch (err) {
        console.error('Error al verificar permisos:', err);
        router.push('/admin/login');
      }
    };

    checkAuth();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.username || !formData.email || !formData.password) {
      setError('Por favor completa todos los campos obligatorios.');
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Por favor ingresa un email válido.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      // El backend espera exactamente estos campos para el registro
      await UserService.createUser({
        username: formData.username,
        password: formData.password,
        fullName: formData.fullName,
        email: formData.email
      });
      router.push('/admin/users');
    } catch (err: any) {
      console.error('Error al crear usuario:', err);
      setError(err.response?.data?.message || 'Error al crear el usuario');
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Crear Usuario - Admin Panel - Rifa Los Andes</title>
      </Head>
      
      <AdminLayout title="Crear Usuario">
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
                <label htmlFor="fullName" className="block text-sm font-semibold text-gray-800 mb-2">
                  Nombre completo
                </label>
                <input
                  type="text"
                  name="fullName"
                  id="fullName"
                  value={formData.fullName}
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
                >
                  <option value="user">Usuario</option>
                  <option value="admin">Administrador</option>
                  <option value="seller">Vendedor</option>
                </select>
              </div>
              
              <div className="mb-2">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-800 mb-2">
                  Contraseña *
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full rounded-md border border-gray-300 bg-gray-50 py-3 px-4 shadow-sm focus:border-brand-accent focus:ring focus:ring-brand-accent focus:ring-opacity-20"
                  minLength={8}
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
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="block w-full rounded-md border border-gray-300 bg-gray-50 py-3 px-4 shadow-sm focus:border-brand-accent focus:ring focus:ring-brand-accent focus:ring-opacity-20"
                  minLength={8}
                  placeholder="********"
                />
              </div>
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
                disabled={loading}
                                className="px-5 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-accent hover:bg-brand-accent-dark focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2 transition-all disabled:opacity-50"
              >
                {loading ? 'Creando...' : 'Crear usuario'}
              </button>
            </div>
          </form>
        </div>
      </AdminLayout>
    </>
  );
};

export default CreateUserPage;
