import React from 'react';
import SEOMetadata from '../components/ui/SEOMetadata';

const SecurityPolicy = () => {
  return (
    <>
      <SEOMetadata
        title="Política de Seguridad"
        description="Política de seguridad de Rifas Los Andes - Información sobre cómo reportar vulnerabilidades y nuestro compromiso con la seguridad."
        keywords="seguridad, vulnerabilidades, rifalosandes, política de seguridad"
      />
      
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Política de Seguridad</h1>
        
        <div className="prose max-w-none">
          <h2 className="text-xl font-semibold mb-4">Nuestro Compromiso</h2>
          <p className="mb-6">
            En Rifas Los Andes, tomamos la seguridad de nuestros usuarios y datos muy seriamente. Estamos comprometidos a mantener la integridad, confidencialidad y disponibilidad de nuestros sistemas y de la información de nuestros clientes.
          </p>
          
          <h2 className="text-xl font-semibold mb-4">Reportar una Vulnerabilidad</h2>
          <p className="mb-6">
            Si has descubierto una vulnerabilidad de seguridad en nuestra plataforma, te agradecemos que nos lo informes de manera responsable. Por favor, envía los detalles a <strong>security@rifalosandes.es</strong>. Investigaremos todos los informes legítimos y haremos todo lo posible para corregir rápidamente cualquier problema.
          </p>
          
          <h3 className="text-lg font-semibold mb-3">Al reportar una vulnerabilidad, incluye:</h3>
          <ul className="list-disc pl-6 mb-6">
            <li>La ubicación y naturaleza de la vulnerabilidad</li>
            <li>Pasos para reproducir el problema</li>
            <li>Posible impacto de la vulnerabilidad</li>
            <li>Sugerencias para mitigar o solucionar la vulnerabilidad (opcional)</li>
          </ul>
          
          <h2 className="text-xl font-semibold mb-4">Programa de Divulgación Responsable</h2>
          <p className="mb-6">
            Seguimos un programa de divulgación responsable y solicitamos que:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li>No accedas a datos de otros usuarios sin permiso</li>
            <li>No realices ataques que puedan degradar nuestros servicios (DoS)</li>
            <li>No reveles la vulnerabilidad públicamente antes de que tengamos un tiempo razonable para solucionarla</li>
            <li>Actúes de buena fe, considerando nuestra privacidad, seguridad y datos de los usuarios</li>
          </ul>
          
          <h2 className="text-xl font-semibold mb-4">Archivo Security.txt</h2>
          <p className="mb-6">
            Seguimos el estándar RFC 9116 y mantenemos un archivo security.txt en la ruta <a href="/.well-known/security.txt" className="text-blue-600 hover:underline">/.well-known/security.txt</a> con información actualizada sobre cómo reportar problemas de seguridad.
          </p>
          
          <h2 className="text-xl font-semibold mb-4">Nuestra Respuesta</h2>
          <p className="mb-4">
            Tras recibir un informe de seguridad, nuestro equipo:
          </p>
          <ol className="list-decimal pl-6 mb-6">
            <li>Confirmará la recepción del informe en un plazo de 48 horas</li>
            <li>Proporcionará un calendario estimado para la resolución</li>
            <li>Notificará cuando la vulnerabilidad haya sido corregida</li>
            <li>Reconocerá tu contribución (con tu consentimiento)</li>
          </ol>
          
          <p className="mt-8 text-sm text-gray-600">
            Última actualización: 11 de junio de 2025
          </p>
        </div>
      </div>
    </>
  );
};

export default SecurityPolicy;
