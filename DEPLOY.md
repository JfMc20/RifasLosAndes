# Guía de Despliegue - Rifas Los Andes (rifalosandes.es)

## Requisitos previos

- Docker y Docker Compose instalados en el servidor
- Dominio personalizado adquirido y con acceso a su configuración DNS
- Certificados SSL para tu dominio (recomendado: Let's Encrypt)

## Pasos para el despliegue

### 1. Configuración de variables de entorno

1. Copia el archivo de ejemplo a un archivo real:
   ```
   cp .env.example .env
   ```

2. Edita el archivo `.env` y configura tus variables:
   - `DOMAIN`: URL completa de tu sitio (https://rifalosandes.es)
   - `DOMAIN_NAME`: Nombre del dominio sin protocolo (rifalosandes.es)
   - `WHATSAPP_NUMBER`: Tu número de WhatsApp para contacto
   - `JWT_SECRET`: Genera una clave segura para los tokens JWT

### 2. Configuración de Nginx

1. El archivo `nginx.conf` ya está configurado para usar rifalosandes.es.

### 3. Certificados SSL

#### Para producción:
1. Obtén certificados SSL para tu dominio (recomendado: Let's Encrypt)
2. Coloca los certificados en una carpeta `ssl/` en la raíz del proyecto:
   - `ssl/fullchain.pem`: Certificado completo
   - `ssl/privkey.pem`: Clave privada

#### Para desarrollo (certificados autofirmados):
```bash
# En Linux/Mac:
bash generate-local-certs.sh

# En Windows (con Git Bash):
sh generate-local-certs.sh
```

### 4. Iniciar la aplicación

```bash
# Construir e iniciar todos los servicios
docker-compose up -d --build

# Ver logs
docker-compose logs -f
```

### 5. Configuración DNS

Configura tu dominio para apuntar a la IP de tu servidor:
- Tipo A: `rifalosandes.es` → IP_DE_TU_SERVIDOR
- Tipo A: `www.rifalosandes.es` → IP_DE_TU_SERVIDOR

### 6. Verificación

Una vez configurado todo, verifica que:
1. Tu sitio sea accesible en https://rifalosandes.es
2. La API funcione correctamente en https://rifalosandes.es/api
3. Las imágenes subidas sean accesibles en https://rifalosandes.es/uploads
4. Los motores de búsqueda pueden indexar el sitio correctamente (verifica robots.txt y sitemap.xml)
5. La configuración de seguridad SSL está correctamente implementada

## Mantenimiento

### Actualizaciones

Para actualizar la aplicación con cambios nuevos:

```bash
# Detener los servicios
docker-compose down

# Obtener los últimos cambios (si usas Git)
git pull

# Reconstruir e iniciar
docker-compose up -d --build
```

### Respaldo de la base de datos

Para hacer un respaldo de la base de datos:

```bash
docker exec rifas-mongodb mongodump --out /dump
docker cp rifas-mongodb:/dump ./backups/$(date +%Y-%m-%d)
```

### Logs

Para ver los logs de los servicios:

```bash
# Todos los servicios
docker-compose logs -f

# Servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx
```
