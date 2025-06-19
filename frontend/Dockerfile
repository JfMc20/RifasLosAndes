FROM node:18-alpine AS builder

WORKDIR /app

# Copia los archivos de definición de paquetes
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el código fuente
COPY . .

# Construye la aplicación con salida standalone
RUN npm run build

# Etapa de producción
FROM node:18-alpine AS runner

WORKDIR /app

# Configura para producción
ENV NODE_ENV production

# Copia el servidor standalone y sus dependencias
COPY --from=builder /app/.next/standalone ./

# Copia archivos públicos y estáticos necesarios
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

# Cambia al usuario node para mejorar la seguridad
USER node

# Expone el puerto usado por la aplicación
EXPOSE 3000

# Comando para iniciar la aplicación en modo standalone
CMD ["node", "server.js"]
