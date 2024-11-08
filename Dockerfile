# Используем базовый образ nginx для сервера статических файлов
FROM nginx:alpine

# Копируем все содержимое в директорию nginx для статических файлов
COPY . /usr/share/nginx/html

# Открываем порт 80
EXPOSE 80

# Запускаем nginx
CMD ["nginx", "-g", "daemon off;"]
