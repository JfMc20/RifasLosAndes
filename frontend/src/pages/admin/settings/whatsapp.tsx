import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminLayout from '../../../components/admin/Layout';
import { SettingsService } from '../../../services/settings.service';
import { AuthService } from '../../../services/auth.service';

const WhatsAppSettingsPage: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [testPhoneNumber, setTestPhoneNumber] = useState('');
  
  const [formData, setFormData] = useState({
    enabled: false,
    apiKey: '',
    phoneNumberId: '',
    fromPhoneNumber: '',
    notificationTemplate: ''
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
          return;
        }
        
        // Cargar configuración
        loadSettings();
      } catch (err) {
        console.error('Error al verificar permisos:', err);
        router.push('/admin/login');
      }
    };

    checkAuth();
  }, [router]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError('');
      
      const settings = await SettingsService.getSettings();
      if (settings && settings.whatsapp) {
        setFormData({
          enabled: settings.whatsapp.enabled || false,
          apiKey: settings.whatsapp.apiKey || '',
          phoneNumberId: settings.whatsapp.phoneNumberId || '',
          fromPhoneNumber: settings.whatsapp.fromPhoneNumber || '',
          notificationTemplate: settings.whatsapp.notificationTemplate || ''
        });
      }
      
      setLoading(false);
    } catch (err: any) {
      console.error('Error al cargar configuración:', err);
      setError(err.response?.data?.message || 'Error al cargar la configuración');
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      await SettingsService.updateWhatsAppSettings(formData);
      
      setSuccess('Configuración de WhatsApp actualizada con éxito');
      setSaving(false);
    } catch (err: any) {
      console.error('Error al guardar configuración:', err);
      setError(err.response?.data?.message || 'Error al guardar la configuración');
      setSaving(false);
    }
  };

  const handleTestMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!testPhoneNumber) {
      setError('Ingresa un número de teléfono para la prueba');
      return;
    }
    
    try {
      setTesting(true);
      setError('');
      setSuccess('');
      
      const result = await SettingsService.sendTestWhatsAppMessage(testPhoneNumber);
      
      if (result.success) {
        setSuccess(`Mensaje de prueba enviado con éxito a ${testPhoneNumber}`);
      } else {
        setError(`Error al enviar mensaje de prueba: ${result.message}`);
      }
      
      setTesting(false);
    } catch (err: any) {
      console.error('Error al enviar mensaje de prueba:', err);
      setError(err.response?.data?.message || 'Error al enviar mensaje de prueba');
      setTesting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Configuración de WhatsApp - Admin Panel - Rifa Los Andes</title>
      </Head>
      
      <AdminLayout title="Configuración de WhatsApp">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-xl text-gray-600">Cargando...</div>
          </div>
        ) : (
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
            
            {/* Configuración de WhatsApp */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-5">Configuración de WhatsApp Business API</h2>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <div className="flex items-center">
                    <input
                      id="enabled"
                      name="enabled"
                      type="checkbox"
                      checked={formData.enabled}
                      onChange={handleChange}
                      className="h-5 w-5 text-brand-accent focus:ring-brand-accent border-gray-300 rounded"
                    />
                    <label htmlFor="enabled" className="ml-3 font-medium text-gray-700">
                      Habilitar notificaciones por WhatsApp
                    </label>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Al habilitar esta opción, se enviarán notificaciones automáticas por WhatsApp cuando se completen ventas de boletos.
                  </p>
                </div>

                <div className={formData.enabled ? "space-y-6" : "space-y-6 opacity-50"}>
                  <div>
                    <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
                      API Key de WhatsApp Business
                    </label>
                    <input
                      type="password"
                      name="apiKey"
                      id="apiKey"
                      value={formData.apiKey}
                      onChange={handleChange}
                      disabled={!formData.enabled}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent"
                      placeholder="Tu API Key de WhatsApp"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Puedes obtener tu API Key en el panel de desarrolladores de Meta.
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="phoneNumberId" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number ID
                    </label>
                    <input
                      type="text"
                      name="phoneNumberId"
                      id="phoneNumberId"
                      value={formData.phoneNumberId}
                      onChange={handleChange}
                      disabled={!formData.enabled}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent"
                      placeholder="ID del número de teléfono (de WhatsApp Business)"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="fromPhoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Número de teléfono remitente
                    </label>
                    <input
                      type="text"
                      name="fromPhoneNumber"
                      id="fromPhoneNumber"
                      value={formData.fromPhoneNumber}
                      onChange={handleChange}
                      disabled={!formData.enabled}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent"
                      placeholder="+56912345678"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      El número de teléfono desde el cual se enviarán los mensajes, con código de país.
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="notificationTemplate" className="block text-sm font-medium text-gray-700 mb-1">
                      Plantilla de mensaje
                    </label>
                    <textarea
                      name="notificationTemplate"
                      id="notificationTemplate"
                      rows={5}
                      value={formData.notificationTemplate}
                      onChange={handleChange}
                      disabled={!formData.enabled}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent"
                      placeholder="Hola {{nombre}}, gracias por tu compra del boleto #{{numero}} para la rifa {{rifa}}. ¡Mucha suerte!"
                    ></textarea>
                    <p className="mt-1 text-xs text-gray-500">
                      Utiliza las variables {'{'}{'{'}nombre{'}'}{'},'} {'{'}{'{'}numero{'}'}{'},'} {'{'}{'{'}rifa{'}'}{'},'} {'{'}{'{'}fecha{'}'}{'}'}  para personalizar el mensaje.
                    </p>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving || !formData.enabled}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-accent hover:bg-brand-accent-dark focus:outline-none disabled:opacity-50"
                  >
                    {saving ? 'Guardando...' : 'Guardar configuración'}
                  </button>
                </div>
              </form>
            </div>
            
            {/* Prueba de envío de mensaje */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-5">Enviar mensaje de prueba</h2>
              
              <form onSubmit={handleTestMessage}>
                <div>
                  <label htmlFor="testPhoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Número de teléfono de prueba
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      id="testPhoneNumber"
                      value={testPhoneNumber}
                      onChange={(e) => setTestPhoneNumber(e.target.value)}
                      disabled={!formData.enabled}
                      className="block w-full rounded-l-md border-r-0 border-gray-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent"
                      placeholder="+56912345678"
                    />
                    <button
                      type="submit"
                      disabled={testing || !formData.enabled || !testPhoneNumber}
                      className="px-4 py-2 border border-transparent rounded-r-md shadow-sm text-sm font-medium text-white bg-brand-accent hover:bg-brand-accent-dark focus:outline-none disabled:opacity-50"
                    >
                      {testing ? 'Enviando...' : 'Enviar prueba'}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Ingresa un número con el formato internacional, por ejemplo: +56912345678
                  </p>
                </div>
              </form>
            </div>

            {/* Documentación */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Documentación</h2>
              
              <div className="prose max-w-none">
                <h3>Configuración de la API de WhatsApp Business</h3>
                <p>Para configurar la integración con WhatsApp Business API, necesitarás:</p>
                
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Crear una cuenta en <a href="https://developers.facebook.com/" target="_blank" rel="noopener noreferrer" className="text-brand-accent hover:underline">Meta for Developers</a></li>
                  <li>Configurar una aplicación con acceso a WhatsApp Business API</li>
                  <li>Obtener tu API Key y Phone Number ID</li>
                  <li>Crear y aprobar plantillas de mensajes</li>
                </ol>
                
                <p className="mt-4">Para más información, consulta la <a href="https://developers.facebook.com/docs/whatsapp" target="_blank" rel="noopener noreferrer" className="text-brand-accent hover:underline">documentación oficial de WhatsApp Business API</a>.</p>
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </>
  );
};

export default WhatsAppSettingsPage;
