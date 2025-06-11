import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import type { DropResult } from 'react-beautiful-dnd';
import AdminLayout from '../../../components/admin/Layout';
import { ContentService } from '../../../services/content.service';
import { AuthService } from '../../../services/auth.service';
import { FAQ } from '../../../types';

// Componente para el formulario de FAQs
const FAQForm: React.FC<{
  faq: Partial<FAQ>;
  onSave: (faq: Partial<FAQ>) => void;
  onCancel: () => void;
}> = ({ faq, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<FAQ>>(faq);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6">
      <h3 className="text-lg font-medium mb-4">
        {faq._id ? 'Editar pregunta frecuente' : 'Agregar nueva pregunta frecuente'}
      </h3>
      
      <div className="mb-4">
        <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-1">
          Pregunta
        </label>
        <input
          type="text"
          name="question"
          id="question"
          required
          value={formData.question || ''}
          onChange={handleChange}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-1">
          Respuesta
        </label>
        <textarea
          name="answer"
          id="answer"
          required
          rows={4}
          value={formData.answer || ''}
          onChange={handleChange}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
        />
      </div>
      
      <div className="flex justify-end space-x-3">
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

const FAQsManagementPage: React.FC = () => {
  const router = useRouter();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingFaq, setEditingFaq] = useState<Partial<FAQ> | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  // Verificar autenticación
  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      router.push('/admin/login');
      return;
    }

    const fetchFAQs = async () => {
      try {
        setLoading(true);
        const faqsData = await ContentService.getFAQs();
        setFaqs(faqsData);
        setLoading(false);
      } catch (err: any) {
        console.error('Error al cargar FAQs:', err);
        setError(err.response?.data?.message || 'Error al cargar las preguntas frecuentes');
        setLoading(false);
      }
    };

    fetchFAQs();
  }, [router]);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source } = result;

    // Si no hay destino o es el mismo lugar, no hacemos nada
    if (!destination || (destination.index === source.index)) return;

    try {
      // Reordenar localmente
      const reorderedFaqs = Array.from(faqs);
      const [movedItem] = reorderedFaqs.splice(source.index, 1);
      reorderedFaqs.splice(destination.index, 0, movedItem);
      
      setFaqs(reorderedFaqs);
      
      // Crear un array con los IDs en el nuevo orden
      const orderedIds = reorderedFaqs.map(faq => faq._id);
      
      // Actualizar orden en el backend
      await ContentService.reorderFAQs(orderedIds);
      console.log('FAQs reordenadas con éxito');
    } catch (err) {
      console.error('Error al reordenar FAQs:', err);
      // Volver a cargar los FAQs en caso de error
      const faqsData = await ContentService.getFAQs();
      setFaqs(faqsData);
    }
  };

  const handleSaveFaq = async (faqData: Partial<FAQ>) => {
    try {
      setSaving(true);
      
      if (faqData._id) {
        // Actualizar FAQ existente
        const updatedFaq = await ContentService.updateFAQ(faqData._id, faqData);
        setFaqs(faqs.map(faq => faq._id === faqData._id ? updatedFaq : faq));
      } else {
        // Crear nueva FAQ
        // Asegurarnos de que los campos requeridos estén presentes
        if (!faqData.question || !faqData.answer) {
          throw new Error('La pregunta y respuesta son obligatorias');
        }
        
        const newFaqData = {
          question: faqData.question,
          answer: faqData.answer,
          order: faqs.length, // Asignar al final de la lista
          isActive: true // Por defecto activado
        };
        
        const newFaq = await ContentService.createFAQ(newFaqData);
        setFaqs([...faqs, newFaq]);
      }
      
      setEditingFaq(null);
      setIsCreating(false);
      setSaving(false);
    } catch (err: any) {
      console.error('Error al guardar FAQ:', err);
      setError(err.response?.data?.message || 'Error al guardar la pregunta frecuente');
      setSaving(false);
    }
  };

  const handleDeleteFaq = async (faqId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta pregunta frecuente?')) {
      return;
    }
    
    try {
      await ContentService.deleteFAQ(faqId);
      setFaqs(faqs.filter(faq => faq._id !== faqId));
    } catch (err: any) {
      console.error('Error al eliminar FAQ:', err);
      setError(err.response?.data?.message || 'Error al eliminar la pregunta frecuente');
    }
  };

  return (
    <>
      <Head>
        <title>Gestión de FAQs - Admin Panel - Rifa Los Andes</title>
      </Head>
      
      <AdminLayout title="Gestión de Preguntas Frecuentes">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Preguntas Frecuentes</h2>
          <button
            onClick={() => {
              setIsCreating(true);
              setEditingFaq({ question: '', answer: '' });
            }}
            disabled={isCreating || editingFaq !== null}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none disabled:opacity-50"
          >
            Agregar nueva FAQ
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-xl text-gray-600">Cargando preguntas frecuentes...</div>
          </div>
        ) : (
          <>
            {/* Formulario de edición o creación */}
            {editingFaq && (
              <FAQForm
                faq={editingFaq}
                onSave={handleSaveFaq}
                onCancel={() => {
                  setEditingFaq(null);
                  setIsCreating(false);
                }}
              />
            )}

            {/* Lista de FAQs con capacidad de arrastrar y soltar */}
            <div className="bg-white shadow overflow-hidden rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                {faqs.length === 0 ? (
                  <p className="text-gray-500 text-center py-6">
                    No hay preguntas frecuentes configuradas. Haz clic en "Agregar nueva FAQ" para crear la primera.
                  </p>
                ) : (
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="faqs">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="space-y-4"
                        >
                          {faqs.map((faq, index) => (
                            <Draggable key={faq._id} draggableId={faq._id} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-3">
                                      <div
                                        {...provided.dragHandleProps}
                                        className="cursor-move mt-1"
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                                        </svg>
                                      </div>
                                      <div>
                                        <h3 className="text-lg font-medium text-gray-900">
                                          {faq.question}
                                        </h3>
                                        <p className="mt-2 text-gray-600">
                                          {faq.answer}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={() => setEditingFaq(faq)}
                                        className="text-indigo-600 hover:text-indigo-900"
                                        disabled={editingFaq !== null}
                                      >
                                        Editar
                                      </button>
                                      <button
                                        onClick={() => handleDeleteFaq(faq._id)}
                                        className="text-red-600 hover:text-red-900"
                                        disabled={editingFaq !== null}
                                      >
                                        Eliminar
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                )}
              </div>
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

export default FAQsManagementPage;
