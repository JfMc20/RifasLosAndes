import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminLayout from '../../../components/admin/Layout';
import { ContentService } from '../../../services/content.service';
import { AuthService } from '../../../services/auth.service';
import { UploadService } from '../../../services/upload.service';
import { PaymentMethod } from '../../../types';
import Spinner from '../../../components/common/Spinner';
import ErrorAlert from '../../../components/common/ErrorAlert';

// Componente para el formulario de métodos de pago
const PaymentMethodForm: React.FC<{
  paymentMethod: Partial<PaymentMethod>;
  onSave: (method: Partial<PaymentMethod>) => void;
  onCancel: () => void;
  isSaving: boolean;
}> = ({ paymentMethod, onSave, onCancel, isSaving }) => {
  const [formData, setFormData] = useState<Partial<PaymentMethod>>(paymentMethod);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(paymentMethod.iconUrl || '');
  const [uploadError, setUploadError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
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
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let iconUrl = formData.iconUrl;
    if (iconFile) {
      try {
        const uploadResult = await UploadService.uploadFile(iconFile);
        iconUrl = uploadResult?.url;
        if (!iconUrl) throw new Error('No se recibió URL de imagen después de la carga');
      } catch (uploadErr) {
        console.error('Error al subir imagen:', uploadErr);
        setUploadError('Error al subir la imagen. Por favor, intente de nuevo.');
        return;
      }
    }
    onSave({ ...formData, iconUrl });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-ui-surface p-6 rounded-xl border border-ui-border mb-8 shadow-lg">
      <h3 className="text-xl font-bold text-ui-text-primary mb-6">
        {paymentMethod._id ? 'Editar método de pago' : 'Agregar nuevo método de pago'}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label htmlFor="name" className="block text-sm font-medium text-ui-text-secondary mb-1">Nombre</label>
          <input type="text" name="name" id="name" value={formData.name || ''} onChange={handleChange} required className="w-full px-4 py-2 bg-ui-surface-2 border border-ui-border rounded-lg focus:ring-brand-accent focus:border-brand-accent" />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-ui-text-secondary mb-1">Descripción</label>
          <textarea name="description" id="description" value={formData.description || ''} onChange={handleChange} rows={3} className="w-full px-4 py-2 bg-ui-surface-2 border border-ui-border rounded-lg focus:ring-brand-accent focus:border-brand-accent"></textarea>
        </div>
        <div>
          <label htmlFor="accountOwner" className="block text-sm font-medium text-ui-text-secondary mb-1">Titular de la Cuenta</label>
          <input type="text" name="accountOwner" id="accountOwner" value={formData.accountOwner || ''} onChange={handleChange} className="w-full px-4 py-2 bg-ui-surface-2 border border-ui-border rounded-lg focus:ring-brand-accent focus:border-brand-accent" />
        </div>
        <div>
          <label htmlFor="accountNumber" className="block text-sm font-medium text-ui-text-secondary mb-1">Número de Cuenta/Teléfono</label>
          <input type="text" name="accountNumber" id="accountNumber" value={formData.accountNumber || ''} onChange={handleChange} className="w-full px-4 py-2 bg-ui-surface-2 border border-ui-border rounded-lg focus:ring-brand-accent focus:border-brand-accent" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-ui-text-secondary mb-1">Ícono</label>
          <div className="flex items-center gap-4">
            {previewUrl && <img src={previewUrl} alt="Preview" className="h-16 w-16 rounded-lg object-contain bg-ui-surface-2 p-1 border border-ui-border" />}
            <input type="file" onChange={handleIconChange} className="block w-full text-sm text-ui-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-accent file:text-white hover:file:bg-brand-accent-dark" />
          </div>
          {uploadError && <p className="text-sm text-brand-danger mt-2">{uploadError}</p>}
        </div>
      </div>
      <div className="flex items-center justify-end gap-4 mt-8">
        <button type="button" onClick={onCancel} disabled={isSaving} className="px-5 py-3 bg-brand-secondary text-white rounded-lg font-bold hover:bg-brand-secondary-dark transition-colors shadow-md disabled:bg-gray-400">Cancelar</button>
        <button type="submit" disabled={isSaving} className="px-5 py-3 bg-brand-accent text-white rounded-lg font-bold hover:bg-brand-accent-dark transition-colors shadow-md disabled:bg-yellow-300">
          {isSaving ? 'Guardando...' : (paymentMethod._id ? 'Guardar Cambios' : 'Crear Método')}
        </button>
      </div>
    </form>
  );
};

const PaymentMethodsPage: React.FC = () => {
  const router = useRouter();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [editingMethod, setEditingMethod] = useState<Partial<PaymentMethod> | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (!user) router.push('/admin/login');
    else fetchPaymentMethods();
  }, [router]);

  const fetchPaymentMethods = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await ContentService.getPaymentMethods();
      setPaymentMethods(data);
    } catch (err) {
      setError('No se pudieron cargar los métodos de pago.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

    const handleSaveMethod = async (methodData: Partial<PaymentMethod>) => {
    setLoading(true);
    setError('');
    try {
      // Preparamos un objeto 'payload' limpio con los campos que el backend espera.
      const payload = {
        name: methodData.name || '',
        description: methodData.description || '',
        imageUrl: methodData.iconUrl || '', // Renombramos iconUrl a imageUrl y nos aseguramos de que sea un string.
        isActive: methodData.isActive !== false,
        // Omitimos intencionadamente los campos que la API rechaza.
      };

      if (editingMethod?._id) {
        await ContentService.updatePaymentMethod(editingMethod._id, payload);
      } else {
        await ContentService.createPaymentMethod(payload as Omit<PaymentMethod, '_id'>);
      }
      await fetchPaymentMethods();
      setEditingMethod(null);
      setIsCreating(false);
    } catch (err) {
      setError('No se pudo guardar el método de pago. Revise los datos e intente de nuevo.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMethod = async (methodId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este método de pago?')) return;
    setLoading(true);
    setError('');
    try {
      await ContentService.deletePaymentMethod(methodId);
      await fetchPaymentMethods();
    } catch (err) {
      setError('No se pudo eliminar el método de pago.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setIsCreating(true);
    setEditingMethod({ name: '', description: '', iconUrl: '', accountNumber: '', accountOwner: '', isActive: true });
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingMethod(null);
    setError('');
  };

  const isFormOpen = isCreating || !!editingMethod;

  return (
    <>
      <Head><title>Gestionar Métodos de Pago - Admin</title></Head>
      <AdminLayout title="Métodos de Pago">
        {loading && !isFormOpen && <Spinner />}
        {error && <ErrorAlert message={error} />}
        
        {!isFormOpen && (
          <div className="mb-6">
            <button onClick={handleAddNew} className="px-6 py-3 bg-brand-accent text-white rounded-lg font-bold hover:bg-brand-accent-dark transition-colors shadow-lg">
              Agregar Nuevo Método
            </button>
          </div>
        )}

        {isFormOpen && editingMethod && (
          <PaymentMethodForm
            paymentMethod={editingMethod}
            onSave={handleSaveMethod}
            onCancel={handleCancel}
            isSaving={loading}
          />
        )}

        <div className="bg-ui-surface shadow-lg rounded-xl border border-ui-border overflow-hidden">
          {paymentMethods.length === 0 && !loading ? (
            <p className="text-ui-text-secondary text-center py-12">No hay métodos de pago configurados.</p>
          ) : (
            <ul className="divide-y divide-ui-border">
              {paymentMethods.map((method) => (
                <li key={method._id} className="p-4 sm:p-6 hover:bg-ui-surface-2 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {method.iconUrl && <img className="h-12 w-12 rounded-md object-contain bg-ui-surface-2 p-1 border border-ui-border" src={method.iconUrl} alt={method.name} />}
                      <div>
                        <h3 className="text-lg font-bold text-ui-text-primary">{method.name}</h3>
                        <p className="text-sm text-ui-text-secondary mt-1">{method.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setEditingMethod(method)} disabled={isFormOpen} className="px-4 py-2 bg-brand-secondary text-white rounded-lg font-bold text-sm hover:bg-brand-secondary-dark transition-colors shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed">Editar</button>
                      <button onClick={() => handleDeleteMethod(method._id)} disabled={isFormOpen} className="px-4 py-2 bg-brand-danger text-white rounded-lg font-bold text-sm hover:bg-red-700 transition-colors shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed">Eliminar</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </AdminLayout>
    </>
  );
};

export default PaymentMethodsPage;