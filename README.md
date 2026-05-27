# Nexora

Nexora — MERN веб-додаток електронної комерції з клієнтською частиною на React/Vite, серверною частиною на Node.js/Express та базою даних MongoDB.

Проєкт підготовлений до локального запуску для розробки та до production-like запуску через Docker Compose з Nginx.

## Технологічний стек

**Frontend**

- React 19
- Vite 8
- React Router
- Material UI
- SCSS
- Context API

**Backend**

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt

**Інфраструктура**

- Docker
- Docker Compose
- Nginx
- npm

## Структура проєкту

```text
fullstack-ecommerce-app/
├── client/              # React/Vite frontend source code
├── server/              # Node.js/Express backend
├── public/              # Public frontend assets
├── docker-compose.yml   # Docker Compose stack
├── package.json         # Frontend scripts and dependencies
└── vite.config.js       # Vite configuration
```

## Запуск проєкту через Docker

Для production-like запуску через Docker Desktop виконайте команду з кореня проєкту:

```bash
docker compose up -d --build
```

Після збірки та запуску контейнерів веб-додаток буде доступний за адресою:

```text
http://localhost
```

Backend API буде доступний за адресою:

```text
http://localhost:5000
```

MongoDB усередині Docker використовується backend-сервісом за адресою `database:27017`, а для локального доступу з хост-системи опублікована на порту `27018`.

Зупинити контейнери можна командою:

```bash
docker compose down
```

## Локальний запуск без Docker

Встановіть залежності frontend:

```bash
npm install
```

Встановіть залежності backend:

```bash
cd server
npm install
cd ..
```

Запустіть backend:

```bash
npm run server
```

Запустіть frontend:

```bash
npm run dev
```

За замовчуванням frontend працює на:

```text
http://localhost:3000
```

## Корисні команди

Перевірити production-збірку frontend:

```bash
npm run build
```

Переглянути активні Docker-контейнери:

```bash
docker compose ps
```

Перезапустити backend-контейнер:

```bash
docker compose restart backend
```

Переглянути логи backend:

```bash
docker compose logs -f backend
```
