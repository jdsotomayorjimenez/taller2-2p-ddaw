# 1. Imagen base: Node.js 24 (LTS) sobre Alpine Linux (liviana)
FROM node:24-alpine

# 2. Carpeta de trabajo dentro del contenedor
WORKDIR /app

# 3. Copiar primero solo package.json para aprovechar la caché de capas
COPY package*.json ./

# 4. Instalar dependencias de producción
RUN npm install --omit=dev

# 5. Copiar el resto del código
COPY . .

# 6. Documentar el puerto que usa la app
EXPOSE 3000

# 7. Comando que se ejecuta al iniciar el contenedor
CMD ["node", "index.js"]
