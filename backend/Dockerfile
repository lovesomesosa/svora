# Используем официальный Node.js образ
FROM node:20-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --include=dev

# Копируем весь исходный код
COPY . .

# Открываем порт
EXPOSE 5000

# Запускаем в dev-режиме
CMD ["npm", "run", "dev"]