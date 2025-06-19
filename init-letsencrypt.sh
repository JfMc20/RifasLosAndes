#!/bin/bash

# Detener cualquier contenedor en ejecución
docker-compose down

# Crear directorios necesarios
mkdir -p certbot/conf certbot/www

# Obtener certificados con certbot
docker run -it --rm \
  -v $(pwd)/certbot/conf:/etc/letsencrypt \
  -v $(pwd)/certbot/www:/var/www/certbot \
  -v $(pwd)/certbot/logs:/var/log/letsencrypt \
  certbot/certbot certonly \
  --webroot -w /var/www/certbot \
  -d rifalosandes.es -d www.rifalosandes.es -d api.rifalosandes.es \
  --email admin@rifalosandes.es \
  --agree-tos \
  --non-interactive \
  --force-renewal

# Crear directorio para los certificados
mkdir -p ssl

# Copiar certificados al directorio ssl
cp certbot/conf/live/rifalosandes.es/fullchain.pem ssl/
cp certbot/conf/live/rifalosandes.es/privkey.pem ssl/

# Dar permisos adecuados
chmod -R 755 ssl

# Iniciar los contenedores
docker-compose up -d --build

# Crear un trabajo de renovación automática
echo "0 0,12 * * * root $(pwd)/renew-cert.sh" | sudo tee -a /etc/crontab > /dev/null

echo "Configuración de Let's Encrypt completada!"
