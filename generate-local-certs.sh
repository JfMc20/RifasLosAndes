#!/bin/bash

# Crear directorio para certificados SSL
mkdir -p ssl

# Generar certificados autofirmados para desarrollo
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/privkey.pem \
  -out ssl/fullchain.pem \
  -subj "/C=CL/ST=State/L=City/O=Organization/CN=localhost"

echo "Certificados SSL generados para desarrollo local"
echo "Para producción, reemplaza estos certificados con los de Let's Encrypt"
