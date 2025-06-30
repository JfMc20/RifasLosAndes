FROM node:18-alpine AS builder

WORKDIR /app

# Copia los archivos de definición de paquetes
COPY package*.json ./

# Instala las dependencias (sharp debe estar en package.json)
RUN npm install

# Copia el código fuente
COPY . .

# Construye la aplicación con salida standalone
RUN npm run build

# Etapa de producción
FROM node:18-alpine AS runner

WORKDIR /app

# Instala vips, la dependencia de sistema requerida por sharp en Alpine
RUN apk add --no-cache vips-dev

# Configura para producción
ENV NODE_ENV production

# Copia el servidor standalone y sus dependencias
COPY --from=builder /app/.next/standalone ./

# Copia package.json para poder instalar sharp
COPY --from=builder /app/package*.json ./

# Instala las dependencias de producción para asegurar que sharp esté disponible
RUN npm ci --omit=dev

# Copia archivos públicos y estáticos necesarios
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

# Cambia la propiedad de los archivos al usuario node para que pueda escribir en el cache
RUN chown -R node:node /app

# Cambia al usuario node para mejorar la seguridad
USER node

# Expone el puerto usado por la aplicación
EXPOSE 3000

# Comando para iniciar la aplicación en modo standalone
CMD ["node", "server.js"]
