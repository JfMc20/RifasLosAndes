#!/bin/bash

# Script de inicialización para despliegue de Rifas Los Andes (rifalosandes.es)
echo "=== Inicializando despliegue para rifalosandes.es ==="

# 1. Crear directorios necesarios
mkdir -p ssl
mkdir -p frontend/public/.well-known
mkdir -p frontend/public/.well-known/acme-challenge
echo "✅ Creados directorios para certificados y .well-known"

# 2. Crear .env desde ejemplo si no existe
if [ ! -f .env ]; then
  cp .env.example .env
  echo "✅ Creado .env desde plantilla"
else
  echo "⚠️ Archivo .env ya existe"
fi

# 3. Generar certificados SSL temporales para desarrollo
if [ ! -f ssl/fullchain.pem ]; then
  openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout ssl/privkey.pem \
    -out ssl/fullchain.pem \
    -subj "/C=ES/ST=Madrid/L=Madrid/O=Rifas Los Andes/CN=rifalosandes.es"
  echo "✅ Generados certificados SSL temporales"
else
  echo "⚠️ Certificados SSL ya existen"
fi

# 4. Permisos para directorios de uploads
mkdir -p backend/uploads
chmod -R 755 backend/uploads
echo "✅ Configurados permisos para directorio de uploads"

# 5. Verificar configuración de dominio en archivos principales
echo "⚙️ Verificando configuraciones de dominio..."
grep -q "rifalosandes.es" nginx.conf && echo "✅ Dominio configurado en nginx.conf" || echo "❌ ¡ATENCIÓN! Dominio no configurado en nginx.conf"
grep -q "rifalosandes.es" .env.example && echo "✅ Dominio configurado en .env.example" || echo "❌ ¡ATENCIÓN! Dominio no configurado en .env.example"
grep -q "rifalosandes.es" frontend/next.config.js && echo "✅ Dominio configurado en next.config.js" || echo "❌ ¡ATENCIÓN! Dominio no configurado en next.config.js"

echo ""
echo "=== Preparación completada ==="
echo "Para iniciar el despliegue, ejecuta:"
echo "docker-compose up -d --build"
