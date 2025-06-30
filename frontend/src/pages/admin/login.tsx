import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { AuthService } from '../../services/auth.service';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Por favor ingrese su usuario y contraseña');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await AuthService.login(username, password);
      router.push('/admin/dashboard');
    } catch (err: any) {
      console.error('Error during login:', err);
      setError(err.response?.data?.message || 'Usuario o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Login - Admin Panel - Rifa Los Andes</title>
      </Head>
      <div className="min-h-screen bg-brand-primary flex flex-col justify-center items-center p-4">
        <div className="max-w-md w-full bg-ui-surface rounded-2xl shadow-2xl p-8 space-y-8">
          <div className="text-center">
            <svg className="mx-auto h-12 w-auto text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-ui-text-primary">
              Panel de Administración
            </h2>
            <p className="mt-2 text-center text-sm text-ui-text-secondary">
              Bienvenido a Rifa Los Andes
            </p>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-ui-text-secondary">Usuario</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 block w-full p-3 bg-ui-background border border-ui-border rounded-lg focus:ring-brand-accent focus:border-brand-accent"
                  placeholder="tu-usuario"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-ui-text-secondary">Contraseña</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full p-3 bg-ui-background border border-ui-border rounded-lg focus:ring-brand-accent focus:border-brand-accent"
                  placeholder="tu-contraseña"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-brand-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent transition-all duration-200 transform hover:scale-105 shadow-md disabled:opacity-50"
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
