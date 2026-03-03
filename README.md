# MyDebts — Backend

> REST API for MyDebts, a debt tracking application that helps users manage and track debts between individuals.

🚀 **Live API:** https://mydebts-backend-jwvr.onrender.com

---

## Tech Stack

| Category       | Technology                   |
| -------------- | ---------------------------- |
| Runtime        | Node.js                      |
| Language       | TypeScript                   |
| Framework      | Express                      |
| Database       | MongoDB + Mongoose           |
| Authentication | JWT                          |
| Email          | Resend                       |
| Bot Protection | Cloudflare Turnstile         |
| Testing        | Jest + MongoDB Memory Server |
| Job Scheduling | node-cron                    |

---

## Features

- 🔐 JWT authentication with secure token handling
- 📧 Password reset via email (Resend + custom domain)
- 🤖 Cloudflare Turnstile bot protection on all auth routes
- ⏰ Automated cron job to mark unpaid debts as overdue
- 🛡️ Security hardening: Helmet, CORS, rate limiting, mongo-sanitize
- ✅ Comprehensive test suite with in-memory MongoDB

---

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB Atlas account (or local MongoDB)

### Installation

```bash
git clone https://github.com/HugoVS26/mydebts-backend.git
cd mydebts-backend
npm install
cp .env.example .env
```

### Environment Variables

```env
PORT=5000
NODE_ENV=development
DEBUG=src:*,jobs:*
MONGODB_URL=mongodb+srv://<user>:<password>@cluster.mongodb.net/mydebts_app
JWT_SECRET=your_strong_random_secret
FRONT_URL=http://localhost:4200
RESEND_API_KEY=your_resend_api_key
RESEND_FROM=support@yourdomain.com
TURNSTILE_SECRET_KEY=your_turnstile_secret_key
```

### Running Locally

```bash
npm run start:dev   # development
npm run build && npm start  # production
```

---

## API Endpoints

### Auth

| Method | Endpoint                | Description               | Requires Auth |
| ------ | ----------------------- | ------------------------- | ------------- |
| `POST` | `/auth/register`        | Register a new user       | ❌            |
| `POST` | `/auth/login`           | Login and receive JWT     | ❌            |
| `GET`  | `/auth/me`              | Get current user          | ✅            |
| `POST` | `/auth/forgot-password` | Send password reset email | ❌            |
| `POST` | `/auth/reset-password`  | Reset password with token | ❌            |

### Debts

| Method   | Endpoint          | Description            | Requires Auth |
| -------- | ----------------- | ---------------------- | ------------- |
| `GET`    | `/debts`          | Get all debts for user | ✅            |
| `GET`    | `/debts/:id`      | Get debt by ID         | ✅            |
| `POST`   | `/debts`          | Create a new debt      | ✅            |
| `PUT`    | `/debts/:id`      | Update a debt          | ✅            |
| `DELETE` | `/debts/:id`      | Delete a debt          | ✅            |
| `PATCH`  | `/debts/:id/paid` | Mark debt as paid      | ✅            |
| `DELETE` | `/debts/paid`     | Delete all paid debts  | ✅            |

### Health

| Method | Endpoint | Description  |
| ------ | -------- | ------------ |
| `GET`  | `/ping`  | Health check |

---

## Testing

```bash
npm test                 # run all tests
npm run test:dev         # watch mode
npm run test:coverage    # coverage report
```

Tests use **Jest** with **MongoDB Memory Server** — no real database connection needed.

---

## Scripts

| Script                  | Description              |
| ----------------------- | ------------------------ |
| `npm start`             | Start production server  |
| `npm run start:dev`     | Start with file watching |
| `npm run build`         | Compile TypeScript       |
| `npm test`              | Run test suite           |
| `npm run test:coverage` | Coverage report          |
| `npm run lint`          | Run ESLint               |
| `npm run format`        | Format with Prettier     |

---

## Deployment

Deployed on **Render** (free tier).

- Build: `npm install --include=dev && npm run build`
- Start: `node dist/index.js`
- Health check: `/ping`

> ⚠️ Free tier spins down after 15 min of inactivity. First request may take ~30s.
