# Im Alive - Check-in & Monitoring System

A NestJS-based monitoring system designed to verify user activity through check-ins and send alerts via Telegram if inactivity is detected.

## 🚀 Core Features

- **User Check-ins**: Simple API-based check-in mechanism to signal "I'm alive".
- **Telegram Bot Integration**: Automated notifications and reminders sent directly to your Telegram.
- **Configurable Alerts**: Customizable inactivity thresholds (e.g., 7 days) and emergency alert counts.
- **History Tracking**: Maintain a log of check-in activity and system status.
- **Automated Monitoring**: Cron-based background jobs to track missed check-ins.

## 🛠 Tech Stack

- **Backend**: [NestJS](https://nestjs.com/) (TypeScript)
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [TypeORM](https://typeorm.io/)
- **Authentication**: JWT & Passport
- **Messaging**: [Node Telegram Bot API](https://github.com/yagop/node-telegram-bot-api)
- **Validation**: class-validator & class-transformer

## ⚙️ Setup & Installation

### Prerequisites

- Node.js (v18+)
- PostgreSQL
- Telegram Bot Token (from @BotFather)

### 1. Environment Configuration

Create a `.env` file in the root directory:

```env
PORT=3003
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_DATABASE=im-alive
DB_SYNCHRONIZE=false

# Telegram
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
```

### 2. Database Setup

Run PostgreSQL via Docker (optional):

```bash
docker run --name im-alive-db -e POSTGRES_PASSWORD=your_password -d -p 5432:5432 postgres
```

### 3. Installation & Database Migrations

```bash
# Install dependencies
npm install

# Run migrations
npm run migration:run
```

### 4. Running the App

```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod
```

## 📜 Available Scripts

- `npm run start:dev`: Start development server with watch mode.
- `npm run migration:generate --name=MigrationName`: Generate a new database migration.
- `npm run migration:run`: Execute pending migrations.
- `npm run test`: Run unit tests.
- `npm run lint`: Lint the codebase.
