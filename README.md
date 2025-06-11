# Rifas Los Andes

Plataforma de gestión de rifas en línea con panel de administración y pasarela de pago integrada.

## Características

- Gestión de rifas y boletos
- Panel de administración
- Integración con pasarelas de pago
- Sistema de notificaciones
- Interfaz responsive

## Requisitos

- Docker y Docker Compose
- Node.js 16+ y npm 8+
- MongoDB

## Instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/tuusuario/rifas-los-andes.git
   cd rifas-los-andes
   ```

2. Copia los archivos de ejemplo de configuración:
   ```bash
   cp .env.example .env
   ```

3. Instala dependencias del backend y frontend:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

## Configuración

Edita el archivo `.env` con tus configuraciones:

```env
# Configuración del dominio
DOMAIN=https://rifalosandes.es
DOMAIN_NAME=rifalosandes.es

# Número de WhatsApp
WHATSAPP_NUMBER=5491155555555

# Clave JWT (genera una aleatoria para producción)
JWT_SECRET=tu_clave_secreta_segura
```

## Despliegue con Docker

1. Prepara el entorno:
   ```bash
   ./init-deploy.sh
   ```

2. Inicia los contenedores:
   ```bash
   docker-compose up -d --build
   ```

3. Verifica los logs:
   ```bash
   docker-compose logs -f
   ```

## Estructura del Proyecto

- `/backend` - API REST en NestJS
- `/frontend` - Aplicación Next.js
- `docker-compose.yml` - Configuración de Docker
- `nginx.conf` - Configuración del servidor web

## Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto basado en `.env.example`.

## Contribución

1. Haz un fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Haz commit de tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Haz push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.
