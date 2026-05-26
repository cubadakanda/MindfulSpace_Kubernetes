# Gunakan base image Node versi Alpine biar enteng dan cepat dibuild
FROM node:18-alpine

# Set working directory di dalam container
WORKDIR /app

# Copy package.json untuk install dependencies dulu (biar kena cache Docker)
COPY package.json ./

# Install dependensi untuk production
RUN npm install --only=production

# Copy seluruh source code project ke dalam container
COPY . .

# Ekspos port 3000 sesuai setting port express server kita
EXPOSE 3000

# Command untuk running aplikasinya
CMD ["npm", "start"]
