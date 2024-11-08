# Используем базовый образ nginx для раздачи статических файлов
FROM nginx:alpine

# Копируем все файлы в директорию для nginx
COPY . /usr/share/nginx/html

# Копируем конфигурацию nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Открываем порт 80 для доступа к контейнеру
EXPOSE 80

# Запуск nginx
CMD ["nginx", "-g", "daemon off;"]
