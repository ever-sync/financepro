# 🚀 Fase 4: Infraestrutura & DevOps

**Status:** 🟢 Iniciando  
**Duração Estimada:** 4 semanas (2 sprints)  
**Objetivo:** Profissionalizar deploy, monitoramento e operações da aplicação

---

## 📋 Visão Geral

A Fase 4 foca em transformar o projeto em uma aplicação production-ready com:
- Containerização completa (Docker)
- Pipeline de CI/CD automatizado
- Monitoramento de erros e performance
- Backup e recuperação de desastres
- Documentação operacional

---

## 🎯 Sprints

### Sprint 11: Containerização & Deploy (Semana 1-2)

| ID | Tarefa | Status | Esforço | Prioridade |
|----|--------|--------|---------|------------|
| 11.1 | Dockerizar backend | ⬜ Pendente | 6h | 🔴 Alta |
| 11.2 | Dockerizar frontend | ⬜ Pendente | 4h | 🔴 Alta |
| 11.3 | Docker Compose (stack completa) | ⬜ Pendente | 4h | 🔴 Alta |
| 11.4 | Ambiente de staging | ⬜ Pendente | 6h | 🟠 Média |
| 11.5 | Health checks endpoints | ⬜ Pendente | 3h | 🟠 Média |
| 11.6 | Script de backup PostgreSQL | ⬜ Pendente | 5h | 🔴 Alta |

**Total Sprint 11:** ~28 horas

---

### Sprint 12: Monitoramento & Logs (Semana 3-4)

| ID | Tarefa | Status | Esforço | Prioridade |
|----|--------|--------|---------|------------|
| 12.1 | Sentry integration (frontend) | ⬜ Pendente | 4h | 🔴 Alta |
| 12.2 | Sentry integration (backend) | ⬜ Pendente | 4h | 🔴 Alta |
| 12.3 | Centralized logging (pino/winston) | ⬜ Pendente | 6h | 🟠 Média |
| 12.4 | Performance monitoring setup | ⬜ Pendente | 8h | 🟢 Baixa |
| 12.5 | Uptime monitoring | ⬜ Pendente | 2h | 🟠 Média |
| 12.6 | Documentação operacional | ⬜ Pendente | 6h | 🟠 Média |

**Total Sprint 12:** ~30 horas

---

## 📦 Entregáveis

### 1. Dockerização

#### Backend Dockerfile
```dockerfile
# server/Dockerfile
FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN npm install -g pnpm && pnpm fetch

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm install -g pnpm && pnpm install --frozen-lockfile
RUN pnpm run build:server

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/server/dist ./dist
COPY --from=builder /app/server/package.json ./package.json
COPY --from=builder /app/server/node_modules ./node_modules

EXPOSE 3000
CMD ["node", "dist/index.js"]
```

#### Frontend Dockerfile
```dockerfile
# client/Dockerfile
FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN npm install -g pnpm && pnpm fetch

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm install -g pnpm && pnpm install --frozen-lockfile
RUN pnpm run build:client

FROM nginx:alpine AS runner
COPY --from=builder /app/client/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: .
      dockerfile: server/Dockerfile
    environment:
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}
      JWT_SECRET: ${JWT_SECRET}
      NODE_ENV: production
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: .
      dockerfile: client/Dockerfile
    ports:
      - "80:80"
    depends_on:
      - backend

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

---

### 2. CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
      
      - name: Install pnpm
        run: npm install -g pnpm
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run linter
        run: pnpm run lint
      
      - name: Run type check
        run: pnpm run typecheck
      
      - name: Run tests
        run: pnpm run test
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test_db
      
      - name: Build application
        run: pnpm run build

  deploy-staging:
    needs: test
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    environment: staging
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to staging
        run: |
          echo "Deploying to staging environment..."
          # Add deployment commands here

  deploy-production:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Build and push Docker images
        run: |
          echo "Building and pushing Docker images..."
          # Add Docker build and push commands here
      
      - name: Deploy to production
        run: |
          echo "Deploying to production..."
          # Add deployment commands here
```

---

### 3. Health Checks

```typescript
// server/src/routes/health.ts
import { Router } from 'express';
import { db } from '../db';
import { sql } from 'drizzle-orm';

const router = Router();

router.get('/health', async (req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    status: 'OK',
  };

  try {
    await db.execute(sql`SELECT 1`);
    res.json(healthcheck);
  } catch (error) {
    healthcheck.status = 'ERROR';
    res.status(503).json(healthcheck);
  }
});

router.get('/ready', async (req, res) => {
  try {
    await db.execute(sql`SELECT 1`);
    // Check other dependencies (Redis, external APIs, etc.)
    res.json({ status: 'READY' });
  } catch (error) {
    res.status(503).json({ status: 'NOT_READY' });
  }
});

export default router;
```

---

### 4. Backup Automático

```bash
#!/bin/bash
# scripts/backup.sh

set -e

BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME=${DB_NAME:-financeiro}
DB_USER=${DB_USER:-postgres}

echo "Starting backup at $(date)"

# Create backup directory if not exists
mkdir -p $BACKUP_DIR

# Dump database
pg_dump -h postgres -U $DB_USER $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/backup_$DATE.sql

# Delete backups older than 7 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed at $(date)"
echo "Backup file: backup_$DATE.sql.gz"
```

```yaml
# docker-compose.backup.yml
version: '3.8'

services:
  backup:
    image: postgres:15-alpine
    environment:
      DB_NAME: ${DB_NAME}
      DB_USER: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
    volumes:
      - ./scripts/backup.sh:/backup.sh
      - ./backups:/backups
    command: >
      sh -c "chmod +x /backup.sh && 
             while true; do 
               /backup.sh; 
               sleep 86400; 
             done"
    depends_on:
      - postgres
```

---

### 5. Sentry Integration

#### Backend Setup
```typescript
// server/src/index.ts
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    nodeProfilingIntegration(),
  ],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
  environment: process.env.NODE_ENV || 'development',
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  Sentry.captureException(err);
  next(err);
});
```

#### Frontend Setup
```typescript
// client/src/main.tsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  environment: import.meta.env.MODE,
});
```

---

### 6. Centralized Logging

```typescript
// server/src/utils/logger.ts
import pino from 'pino';
import pretty from 'pino-pretty';

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  formatters: {
    level: (label) => ({ level: label.toUpperCase() }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

// Usage example
logger.info({ userId: 123, action: 'login' }, 'User logged in');
logger.error({ error: err, userId: 123 }, 'Login failed');
```

---

## 📊 Métricas de Sucesso

| Métrica | Antes | Depois (Meta) |
|---------|-------|---------------|
| Tempo de deploy | Manual (~30min) | Automatizado (<5min) |
| Downtime em deploy | ~5min | Zero (blue-green) |
| MTTR (Mean Time To Recovery) | Desconhecido | <15min |
| Cobertura de logs | Baixa | 100% das rotas críticas |
| Backup | Manual | Automático diário |
| Monitoramento de erros | Reativo | Proativo com alertas |

---

## 🔗 Dependências

- ✅ Fase 1: Reestruturação do backend (concluída)
- ✅ Fase 2: Paginação implementada (concluída)
- ✅ Fase 3: Otimizações de performance (concluída)
- ⬜ Fase 4: Infraestrutura & DevOps (em andamento)

---

## 📝 Próximos Passos Imediatos

1. **Criar Dockerfiles** para frontend e backend
2. **Configurar Docker Compose** para ambiente local
3. **Implementar health checks** nas rotas do servidor
4. **Configurar GitHub Actions** para CI/CD básico
5. **Criar script de backup** automático do PostgreSQL
6. **Integrar Sentry** para tracking de erros

---

## 🛠️ Comandos Úteis

```bash
# Build e rodar com Docker
docker-compose up --build

# Rodar apenas serviços específicos
docker-compose up postgres backend

# Ver logs
docker-compose logs -f backend

# Executar migrations
docker-compose exec backend pnpm run db:migrate

# Backup manual
docker-compose exec postgres pg_dump -U usuario dbname > backup.sql

# Parar tudo
docker-compose down

# Parar e remover volumes
docker-compose down -v
```

---

**Responsável:** Equipe de Infraestrutura  
**Reviewers:** Tech Lead, DevOps Engineer  
**Data de Início:** A definir  
**Data de Término Estimada:** +4 semanas
