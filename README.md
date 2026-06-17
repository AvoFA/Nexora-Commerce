# <p align="center"><img src="public/assets/logo/nexora-full.svg" alt="Nexora Logo" width="300"></p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB">
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker">
  <img src="https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white" alt="Nginx">
</p>

<p align="center">
  Fullstack MERN веб-додаток електронної комерції з адміністративною панеллю, JWT-автентифікацією та Docker-based інфраструктурою.
</p>

---

<p align="center">
  <a href="#-огляд-проєкту">Огляд</a> •
  <a href="#-галерея-проєкту">Скриншоти</a> •
  <a href="#-основний-функціонал">Функціонал</a> •
  <a href="#-технологічний-стек">Технології</a> •
  <a href="#-структура-проєкту">Структура</a> •
  <a href="#-docker-розгортання">Docker</a> •
  <a href="#-локальний-запуск">Запуск</a>
</p>

---

# 📸 Галерея проєкту

> ⚠️ У README використовуються демонстраційні скриншоти інтерфейсу. Фактичний вигляд окремих компонентів може відрізнятися залежно від поточної версії проєкту.

<table align="center">
  <tr>
    <td align="center"><b>Головна сторінка</b></td>
    <td align="center"><b>Каталог товарів</b></td>
  </tr>
  <tr>
    <td><a href="public/assets/screenshots/Home Page.png"><img src="public/assets/screenshots/Home Page.png" alt="Home Page" width="100%"/></a></td>
    <td><a href="public/assets/screenshots/Catalog Page.png"><img src="public/assets/screenshots/Catalog Page.png" alt="Catalog Page" width="100%"/></a></td>
  </tr>
  <tr>
    <td align="center"><b>Оформлення замовлення (Checkout)</b></td>
    <td align="center"><b>Адміністративна панель</b></td>
  </tr>
  <tr>
    <td><a href="public/assets/screenshots/Checkout Page.png"><img src="public/assets/screenshots/Checkout Page.png" alt="Checkout Page" width="100%"/></a></td>
    <td><a href="public/assets/screenshots/Admin Dashboard.png"><img src="public/assets/screenshots/Admin Dashboard.png" alt="Admin Dashboard" width="100%"/></a></td>
  </tr>
</table>

---

# 📖 Огляд проєкту

**Nexora** — fullstack веб-додаток із адміністративною панеллю, побудований на основі стеку MERN.


Проєкт поєднує:

* SPA-архітектуру на основі React + Vite
* Адміністративну панель
* JWT-автентифікацію
* Систему рольового доступу
* Wishlist-списки та compare модулі
* Систему керування замовленнями
* Модерацію відгуків і питань
* Інтеграцію Nova Poshta API
* Docker-based deployment infrastructure

Застосунок підтримує як локальний режим розробки, так і production-like запуск через Docker Compose та Nginx.

---

# ✨ Основний функціонал

## 🛍 Користувацька частина

* Каталог товарів із фільтрацією та сортуванням
* Пошук товарів
* Wishlist-списки
* Порівняння товарів
* Кошик та checkout
* Історія замовлень
* Переглянуті товари
* Система відгуків і питань
* Підтримка акційних цін та знижок

## 🔐 Адміністративна панель

* Керування товарами
* Керування категоріями та брендами
* Панель керування замовленнями
* Керування клієнтами
* Модерація відгуків
* Модерація питань
* Керування role-based доступом
* Керування акційними цінами

## 🚚 Інтеграція доставки

* Інтеграція Nova Poshta API
* Динамічне завантаження міст та відділень
* Синхронізація даних доставки під час checkout

---

# 🏗 Архітектура

Проєкт побудований відповідно до класичної MERN клієнт-серверної архітектури:

* **Frontend:** React + Vite SPA
* **Backend:** Node.js + Express REST API
* **Database:** MongoDB + Mongoose
* **Authentication:** JWT-based authorization
* **Infrastructure:** Docker + Nginx reverse proxy

Frontend та backend ізольовані в окремі контейнери та оркеструються через Docker Compose.

---

# 🛠 Технологічний стек

## Frontend

<p>
  <img src="https://skillicons.dev/icons?i=react,vite,sass,html,css" />
</p>

* React 19
* Vite 8
* React Router DOM
* Context API
* Material UI
* SCSS

## Backend

<p>
  <img src="https://skillicons.dev/icons?i=nodejs,express,mongodb,js" />
</p>

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcrypt

## Інфраструктура

<p>
  <img src="https://skillicons.dev/icons?i=docker,nginx,npm,git" />
</p>

* Docker
* Docker Compose
* Nginx

---

# 📦 Структура проєкту

```text
fullstack-ecommerce-app/
├── client/
│   ├── components/
│   ├── context/
│   ├── hooks/
│   ├── pages/
│   ├── services/
│   ├── styles/
│   ├── Dockerfile
│   └── nginx.conf
│
├── server/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── Dockerfile
│
├── docker-compose.yml
└── README.md
```

---

# 🐳 Docker розгортання

Запуск повного стеку застосунку:

```bash
docker compose up -d --build
```

Адреси сервісів:

```text
Frontend:   http://localhost
Backend:    http://localhost:5000
MongoDB:    localhost:27018
```

Зупинка контейнерів:

```bash
docker compose down
```

Перевірка контейнерів:

```bash
docker compose ps
```

Перегляд логів backend:

```bash
docker compose logs -f backend
```

---

# 💻 Локальний запуск

### ⚡ Швидка інсталяція (One-liner)
Копіюйте та вставте цю команду в термінал, щоб встановити всі залежності (root + server) одразу:
```bash
npm install && cd server && npm install && cd ..
```

## Встановлення frontend-залежностей

```bash
npm install
```

## Встановлення backend-залежностей

```bash
cd server
npm install
cd ..
```

## Запуск backend

```bash
npm run server
```

## Запуск frontend

```bash
npm run dev
```

Frontend за замовчуванням:

```text
http://localhost:3000
```

---

# 🗄️ Наповнення бази даних (Seeding)

Проєкт містить готові тестові дані (товари з фотографіями, категорії та бренди), а також обліковий запис адміністратора за замовчуванням.

### ⚡ Імпорт початкових даних (Seed)
> [!WARNING]
> **Увага:** ця команда повністю очищає локальну базу даних (колекції товарів, категорій, брендів та адміністраторів) перед імпортом тестових даних. Не запускайте її на базі з реальними даними!

Для наповнення бази даних виконайте команду в корені проєкту:
```bash
npm run seed
```
Ця команда очистить поточні колекції товарів, категорій, брендів та адміністраторів, після чого завантажить актуальні дані з JSON-файлів у теку `server/data/` та створить адміністратора за замовчуванням:
* **Логін:** `admin`
* **Пароль:** `admin123`

*(Ви можете змінити ці значення перед запуском у файлі `server/.env` за допомогою змінних `ADMIN_USERNAME` та `ADMIN_PASSWORD`).*

### 📤 Експорт поточних даних (Export)
Якщо ви додали нові товари чи змінили наявні в локальній базі даних і хочете зберегти ці зміни для проекту, виконайте:
```bash
node server/scripts/export.js
```
Це оновнить JSON-файли в `server/data/` вашими поточними даними з бази. Після цього ви зможете закомітити їх та надіслати в репозиторій.

---

# ⚙ Environment Variables

Приклад frontend `.env`

```env
VITE_API_URL=http://localhost:5000
```

Приклад backend `.env`

```env
MONGO_URI=
JWT_SECRET=
NOVA_POSHTA_API_KEY=
```

---

# 📋 Корисні команди

### 🛠 Розробка та збірка
**Створити production-збірку фронтенду:**
```bash
npm run build
```

**Запустити фронтенд та бекенд одночасно (якщо встановлено `concurrently`):**
```bash
npm run dev:full
```

### 🐳 Керування Docker
**Перевірити статус усіх сервісів:**
```bash
docker compose ps
```

**Перезапустити API сервер:**
```bash
docker compose restart backend
```

**Перегляд логів бекенду в реальному часі:**
```bash
docker compose logs -f backend
```

**Зупинити та видалити всі контейнери:**
```bash
docker compose down
```

---
