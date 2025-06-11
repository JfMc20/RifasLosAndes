import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminLayout from '../../../components/admin/Layout';
import { ContentService } from '../../../services/content.service';
import { AuthService } from '../../../services/auth.service';
import { UploadService } from '../../../services/upload.service';
import { PaymentMethod } from '../../../types';

// Componente para el formulario de métodos de pago
const PaymentMethodForm: React.FC<{
  paymentMethod: Partial<PaymentMethod>;
  onSave: (method: Partial<PaymentMethod>) => void;
  onCancel: () => void;
}> = ({ paymentMethod, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<PaymentMethod>>(paymentMethod);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(paymentMethod.iconUrl || '');
  const [uploadError, setUploadError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamaño y tipo de archivo
    if (file.size > 2 * 1024 * 1024) { // 2MB
      setUploadError('El ícono no debe exceder 2MB');
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Formato de imagen no válido. Use JPG, PNG, SVG o WebP');
      return;
    }

    setIconFile(file);
    setUploadError('');

    // Crear vista previa
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Si hay un nuevo ícono, subirlo primero
      let iconUrl = formData.iconUrl;
      if (iconFile) {
        try {
          const uploadResult = await UploadService.uploadFile(iconFile);
          iconUrl = uploadResult?.url;
          if (!iconUrl) {
            throw new Error('No se recibió URL de imagen después de la carga');
          }
        } catch (uploadErr) {
          console.error('Error al subir imagen:', uploadErr);
          setUploadError('Error al subir la imagen. Por favor, intente de nuevo.');
          return;
        }
      }

      // Asegurarse de que iconUrl tenga un valor válido
      if (!iconUrl) {
        iconUrl = ''; // Establecer como string vacío si es undefined
      }

      // Crear objeto con los datos actualizados, eliminando campos que el backend no acepta si están vacíos
      const updatedData: Partial<PaymentMethod> = {
        name: formData.name,
        description: formData.description,
        imageUrl: iconUrl, // Usar iconUrl como imageUrl
        isActive: formData.isActive !== false // Por defecto activo si no se especifica
      };

      // Solo agregar estos campos si tienen valor
      if (formData.accountNumber && formData.accountNumber.trim() !== '') {
        updatedData.accountNumber = formData.accountNumber;
      }
      
      if (formData.accountOwner && formData.accountOwner.trim() !== '') {
        updatedData.accountOwner = formData.accountOwner;
      }

      onSave(updatedData);
      setUploadError('');
    } catch (error) {
      console.error('Error al guardar método de pago:', error);
      setUploadError('Error al guardar. Por favor, intente de nuevo.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6">
      <h3 className="text-lg font-medium mb-4">
        {paymentMethod._id ? 'Editar método de pago' : 'Agregar nuevo método de pago'}
      </h3>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre
          </label>
          <input
            type="text"
            name="name"
            id="name"
            required
            value={formData.name || ''}
            onChange={handleChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ícono
          </label>
          <div className="mt-1 flex items-center">
            {previewUrl && (
              <div className="mr-3">
                <img
                  src={previewUrl}
                  alt="Vista previa"
                  className="h-10 w-10 object-contain rounded-md"
                />
              </div>
            )}
            <label
              htmlFor="icon-upload"
              className="cursor-pointer px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              Cambiar ícono
              <input
                id="icon-upload"
                name="icon-upload"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleIconChange}
              />
            </label>
          </div>
          {uploadError && (
            <p className="mt-1 text-xs text-red-500">{uploadError}</p>
          )}
        </div>
        
        <div className="col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            name="description"
            id="description"
            required
            rows={3}
            value={formData.description || ''}
            onChange={handleChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          />
        </div>
        
        <div>
          <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-1">
            Número de cuenta
          </label>
          <input
            type="text"
            name="accountNumber"
            id="accountNumber"
            value={formData.accountNumber || ''}
            onChange={handleChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          />
        </div>
        
        <div>
          <label htmlFor="accountOwner" className="block text-sm font-medium text-gray-700 mb-1">
            Titular de la cuenta
          </label>
          <input
            type="text"
            name="accountOwner"
            id="accountOwner"
            value={formData.accountOwner || ''}
            onChange={handleChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          />
        </div>
      </div>
      
      <div className="mt-6 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none"
        >
          Guardar
        </button>
      </div>
    </form>
  );
};

const PaymentMethodsPage: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingMethod, setEditingMethod] = useState<Partial<PaymentMethod> | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [methodToDelete, setMethodToDelete] = useState<string | null>(null);

  // Verificar autenticación
  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      router.push('/admin/login');
      return;
    }

    const fetchPaymentMethods = async () => {
      try {
        setLoading(true);
        const data = await ContentService.getPaymentMethods();
        setPaymentMethods(data);
        setLoading(false);
      } catch (err: any) {
        console.error('Error al cargar métodos de pago:', err);
        setError(err.response?.data?.message || 'Error al cargar los métodos de pago');
        setLoading(false);
      }
    };

    fetchPaymentMethods();
  }, [router]);

  const handleSaveMethod = async (methodData: Partial<PaymentMethod>) => {
    try {
      // Asegurarse de que imageUrl sea un string válido
      if (!methodData.imageUrl) {
        methodData.imageUrl = '';
      }
      
      // IMPORTANTE: Solo incluir los campos que el backend acepta
      // Eliminamos accountNumber y accountOwner ya que el backend los está rechazando
      const validData: Partial<PaymentMethod> = {
        name: methodData.name || '',
        description: methodData.description || '',
        imageUrl: methodData.imageUrl,
        isActive: methodData.isActive !== false
      };
      
      // Añadir el ID si estamos actualizando
      if (methodData._id) {
        validData._id = methodData._id;
      }

      if (methodData._id) {
        // Actualizar método existente
        const updatedMethod = await ContentService.updatePaymentMethod(methodData._id, validData);
        setPaymentMethods(methods => 
          methods.map(m => m._id === updatedMethod._id ? updatedMethod : m)
        );
        setSuccess('Método de pago actualizado con éxito');
      } else {
        // Crear nuevo método
        const newMethod = await ContentService.createPaymentMethod(validData as Omit<PaymentMethod, '_id'>);
        setPaymentMethods([...paymentMethods, newMethod]);
        setSuccess('Método de pago creado con éxito');
      }
      setEditingMethod(null);
    } catch (error: any) {
      console.error('Error creating payment method:', error);
      setError(`Error al guardar método de pago: ${error.message || 'Verifica todos los campos'}`);
    } 
  };

  const handleDeleteMethod = async (methodId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este método de pago?')) {
      return;
    }
    
    try {
      await ContentService.deletePaymentMethod(methodId);
      setPaymentMethods(methods => methods.filter(method => method._id !== methodId));
    } catch (err: any) {
      console.error('Error al eliminar método de pago:', err);
      setError(err.response?.data?.message || 'Error al eliminar el método de pago');
    }
  };

  return (
    <>
      <Head>
        <title>Métodos de Pago - Admin Panel - Rifa Los Andes</title>
      </Head>
      
      <AdminLayout title="Gestión de Métodos de Pago">
        {/* Mensajes de alerta */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Éxito! </strong>
            <span className="block sm:inline">{success}</span>
          </div>
        )}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Métodos de Pago</h2>
          <button
            onClick={() => {
              setIsCreating(true);
              setEditingMethod({ 
                name: '', 
                description: '', 
                iconUrl: '',
                accountNumber: '',
                accountOwner: ''
              });
            }}
            disabled={isCreating || editingMethod !== null}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none disabled:opacity-50"
          >
            Agregar nuevo método de pago
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-xl text-gray-600">Cargando métodos de pago...</div>
          </div>
        ) : (
          <>
            {/* Formulario de edición o creación */}
            {editingMethod && (
              <PaymentMethodForm
                paymentMethod={editingMethod}
                onSave={handleSaveMethod}
                onCancel={() => {
                  setEditingMethod(null);
                  setIsCreating(false);
                }}
              />
            )}

            {/* Lista de métodos de pago */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              {paymentMethods.length === 0 ? (
                <div className="px-4 py-5 sm:p-6">
                  <p className="text-gray-500 text-center py-6">
                    No hay métodos de pago configurados. Haz clic en "Agregar nuevo método de pago" para crear el primero.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {paymentMethods.map((method) => (
                    <li key={method._id} className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {method.iconUrl && (
                            <img
                              className="h-12 w-12 rounded-md object-contain mr-4 bg-gray-100 p-1"
                              src={method.iconUrl}
                              alt={method.name}
                            />
                          )}
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              {method.name}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {method.description}
                            </p>
                            {(method.accountNumber || method.accountOwner) && (
                              <div className="mt-1 text-sm text-gray-500">
                                {method.accountNumber && (
                                  <span className="mr-3">
                                    <span className="font-medium">Cuenta:</span> {method.accountNumber}
                                  </span>
                                )}
                                {method.accountOwner && (
                                  <span>
                                    <span className="font-medium">Titular:</span> {method.accountOwner}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-4">
                          <button
                            onClick={() => setEditingMethod(method)}
                            className="text-indigo-600 hover:text-indigo-900 font-medium"
                            disabled={editingMethod !== null}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteMethod(method._id)}
                            className="text-red-600 hover:text-red-900 font-medium"
                            disabled={editingMethod !== null}
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-6">
              <button
                onClick={() => router.push('/admin/content')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
              >
                Volver a Gestión de Contenido
              </button>
            </div>
          </>
        )}
      </AdminLayout>
    </>
  );
};

export default PaymentMethodsPage;
