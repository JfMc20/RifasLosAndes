FROM node:18-alpine

WORKDIR /app

# Copia los archivos de definición de paquetes
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el código fuente
COPY . .

# Construye la aplicación
RUN npm run build

# Crea y configura el directorio de uploads
RUN mkdir -p uploads && chown -R node:node uploads

# Cambia al usuario node para mejorar la seguridad
USER node

# Expone el puerto usado por la aplicación
EXPOSE 3001

# Comando para iniciar la aplicación
CMD ["npm", "run", "start:prod"]
