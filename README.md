# 🧠 Svora Manager

Система управления студией звукозаписи: бронирование, работа с проектами, треками, версиями и комментариями.

---

## 🚀 Описание проекта

Svora Manager — это fullstack-приложение, которое решает задачи:

- 📅 бронирование студийного времени  
- 🎵 управление музыкальными проектами (single / album)  
- 🎚 работа с треками и версиями  
- 💬 комментарии и фидбек по аудио  
- 🔐 роли пользователей (client / owner)  

---

## 💡 Проблема

Музыкальные студии часто используют разрозненные инструменты:
- календарь отдельно
- файлы отдельно
- комментарии в мессенджерах

Это усложняет работу и коммуникацию.

## ✅ Solution

Svora Manager объединяет:
- бронирование
- проекты
- треки и версии
- фидбек

в одном интерфейсе.

---

## 📸 Интерфейс приложения

### 🔐 Login
![Login Screen](./screenshots/login.png)

---

### 📊 Dashboard
![Dashboard](./screenshots/dashboard.png)

---

### 📅 Bookings
![Bookings](./screenshots/bookings.png)

---

### 🎵 Projects List
![Projects](./screenshots/projects.png)

---

### 🎧 Project Details
![Project Details](./screenshots/project_details.png)

---

### 🎚 Track / Versions / Comments
![Track Details](./screenshots/track-details.png)
![Add Versions and Comments](./screenshots/addVersComm_form.png)

---

## 🧠 Подход к разработке

Проект разрабатывается итеративно (в духе Agile-подхода):

- сначала реализуется backend с бизнес-логикой  
- затем строится рабочий frontend  
- далее система расширяется и улучшается  

👉 Основной сценарий:  
**booking → project → track → version → comment**

---

## 🧠 Why this project

Этот проект демонстрирует:

- построение fullstack системы с нуля
- работу с бизнес-логикой (studio workflow)
- продуманную архитектуру frontend + backend
- работу с ролями и доступами
- постепенное развитие продукта (MVP → расширение)

---
## ⭐ Key Features

- Role-based access (client / owner)
- End-to-end workflow: booking → project → track → version → comment
- Album support with track ordering
- Inline editing UI (no modals / prompts)
- Collapsible sections with animations
- Clean API-driven architecture
---

## 📊 Текущий статус

Проект активно развивается.

### ✅ Backend
- архитектура и бизнес-логика  
- API для всех ключевых сущностей  
- авторизация и роли  

### ✅ Frontend (Next.js)

#### 🔐 Авторизация
- логин  
- хранение токена  
- protected routes  

#### 📅 Bookings
- просмотр бронирований  
- создание брони  
- выбор доступных слотов  
- owner видит все записи  

#### 🎵 Projects
- список проектов  
- создание проекта (single / album)  
- owner видит все проекты  
- client — только свои  

#### 🎧 Project Details
- создание треков  
- версии  
- комментарии  
- inline формы  
- анимации  
- role-based UI  

---

## 🚀 Дальнейшее развитие

### 🧩 Backend расширение
- update / delete endpoints  
- pagination  
- масштабирование  

### 🎨 Frontend
- update / delete actions  
- dashboard улучшения  
- status badges  
- publish tracks, albums
- project cover
---

## 🏗 Архитектура backend

```text
src/
  modules/
    auth/
    booking/
    project/
    track/
    version/
    comment/
  middlewares/
  utils/
  routes/
```

---

## ⚙️ Технологии

### Backend

* Node.js + Express
* TypeScript
* Prisma ORM
* PostgreSQL
* Docker

### Валидация и безопасность

* Zod
* JWT
* RBAC

---

## 🧱 Основные возможности backend

### 🔐 Auth

* регистрация
* логин (JWT)
* middleware авторизации

---

### 📅 Booking

* создание бронирования
* проверка пересечений
* запрет брони в прошлом
* управление статусами (owner)

---

### 🎵 Projects

* SINGLE / ALBUM
* получение списка проектов
* доступ только к своим данным

---

### 🎧 Tracks

* добавление треков
* ограничения по типу проекта
* поддержка порядка (`order`)

---

### 🎚 Versions

* несколько версий трека
* хранение ссылок на файлы

---

### 💬 Comments

* комментарии к трекам
* поддержка timestamp

---

## 📦 API формат

### Успешный ответ

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Ошибка

```json
{
  "success": false,
  "message": "Error message",
  "details": { ... }
}
```

---

## 🧠 Особенности реализации

* централизованный error handling (`AppError`)
* asyncHandler (без try/catch в контроллерах)
* единый формат API
* модульная архитектура
* строгая валидация

---

## 📸 API примеры (Insomnia)

### 🔐 Login

*(скрин Insomnia с успешным login и JWT токеном)*

---

### 📅 Создание брони

*(скрин POST /bookings + успешный ответ)*

---

### 🎵 Создание проекта

*(скрин POST /projects)*

---

### 🎧 Добавление трека

*(скрин POST /projects/:id/tracks)*

---

### 💬 Добавление комментария

*(скрин POST /tracks/:id/comments)*

---

## 🗄 Диаграмма базы данных

*( ER-диаграмма: User → Booking → Project → Track → Version → Comment)*

Можно использовать:

* dbdiagram.io
* draw.io

---

## 🐳 Запуск

```bash
docker-compose up -d --build
```

```bash
docker-compose exec backend npx prisma migrate dev
```

---

## 🎯 Архитектурный подход

Backend построен с акцентом на:

* разделение ответственности (modules)
* расширяемость
* предсказуемость API
* безопасность (auth + roles)

---

## 👨‍💻 Автор

🦸lovesamesosa