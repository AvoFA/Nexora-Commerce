# Nexora

MERN веб-додаток із клієнтською частиною на React/Vite, серверною частиною на Node.js/Express та базою даних MongoDB.

## Запуск проєкту через Docker

Для production-like запуску через Docker Desktop достатньо виконати команду з кореня проєкту:

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
