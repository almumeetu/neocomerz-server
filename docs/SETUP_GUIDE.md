# NeoComerz Server - Developer Setup Guide

This guide helps new developers easily set up the NeoComerz e-commerce server project.

## 📋 Prerequisites

### Required Software:

- **Node.js** - v18 or higher
- **pnpm** - Package manager
- **Git** - Version control

### Database Options:

- **PostgreSQL** installed locally (recommended)
- **Docker** and **Docker Compose** (alternative)

### Development Tools (Optional):

- **VS Code** - Recommended IDE
- **Postman** or **Insomnia** - API testing
- **DBeaver** or **pgAdmin** - Database management

## 🚀 Quick Setup

### 1. Clone Project

```bash
git clone <repository-url>
cd neocomerz-server
```

### 2. Install Dependencies

```bash
# Using pnpm (recommended)
pnpm install

# Or using npm
npm install
```

### 3. Set Up Environment Variables

```bash
# Create .env file from template
cp .env.example .env
```

Edit the `.env` file:

```env
# Database Configuration
DATABASE_URL="postgresql://linkon:123456@localhost:5432/neocomerz"

# Application Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
```

### 4. Database Setup

#### Option A: Local PostgreSQL (Recommended)

If you have PostgreSQL installed locally:

```bash
# Create database
createdb neocomerz

# Create user (if needed)
createuser linkon
psql -c "ALTER USER linkon PASSWORD '123456';"
psql -c "GRANT ALL PRIVILEGES ON DATABASE neocomerz TO linkon;"
```

#### Option B: Docker (Alternative)

If you prefer using Docker:

```bash
# Create docker-compose.yml if not exists
cat > docker-compose.yml << EOF
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: neocomerz
      POSTGRES_USER: linkon
      POSTGRES_PASSWORD: 123456
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  adminer:
    image: adminer
    ports:
      - "8080:8080"
    depends_on:
      - postgres

volumes:
  postgres_data:
EOF

# Start PostgreSQL and Adminer
docker-compose up -d

# Stop database
docker-compose down
```

This will start:

- PostgreSQL on port 5432
- Adminer (database GUI) on http://localhost:8080

### 5. Database Migration

```bash
# Generate Prisma client
pnpm db:generate

# Run database migrations
pnpm db:migrate

# (Optional) Seed database
pnpm db:seed
```

### 6. Run the Application

```bash
# Development mode with hot reload
pnpm start:dev

# Production mode
pnpm build
pnpm start:prod
```

The application will be available at http://localhost:3000

## 🔧 Development Workflow

### Daily Development Commands

```bash
# Start development server
pnpm start:dev

# Code formatting
pnpm format

# Linting and fixing
pnpm lint

# Run tests
pnpm test

# Check test coverage
pnpm test:cov
```

### Database Management

```bash
# Open Prisma Studio (visual database browser)
pnpm db:studio

# Create new migration
pnpm db:migrate --name <migration-name>

# Reset database
pnpm db:migrate:reset

# Push schema to database (without migration)
pnpm db:push

# Complete database setup
pnpm db:setup
```

## 🏗️ Project Structure

```
neocomerz-server/
├── src/                    # Source code
│   ├── auth/              # Authentication module
│   ├── user/              # User management
│   ├── address/           # Address management
│   ├── product/           # Product management
│   ├── order/             # Order management
│   ├── cart/              # Cart management
│   ├── payment/           # Payment management
│   ├── prisma/            # Prisma service
│   ├── app.module.ts      # Main application module
│   └── main.ts            # Application entry point
├── prisma/                 # Database configuration
│   ├── schema.prisma      # Prisma schema
│   ├── migrations/        # Database migrations
│   └── seed.ts           # Database seed script
├── docs/                   # Documentation
├── test/                   # Test files
├── docker-compose.yml      # Docker configuration
├── .env.example          # Environment variables template
└── README.md             # Project readme
```

## 🌐 API Access

Once the application is running, you can access:

- **Swagger Documentation**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/health
- **API Base URL**: http://localhost:3000

## 🧪 Testing

### Unit Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# View coverage report
pnpm test:cov
```

### Integration Tests

```bash
# Run e2e tests
pnpm test:e2e
```

## 🔍 Debugging

### VS Code Debug Setup

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug NestJS",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/src/main.ts",
      "preLaunchTask": "tsc: build - tsconfig.json",
      "outFiles": ["${workspaceFolder}/dist/**/*.js"],
      "env": {
        "NODE_ENV": "development"
      }
    }
  ]
}
```

### Debug Mode

```bash
pnpm start:debug
```

## 🚨 সাধারণ সমস্যা এবং সমাধান

### সমস্যা ১: ডাটাবেস কানেকশন ইরর

**সমাধান:**

- Docker চলছে কিনা চেক করুন: `docker ps`
- `.env` ফাইলের DATABASE_URL চেক করুন
- PostgreSQL পোর্ট 5432 খোলা আছে কিনা চেক করুন

### সমস্যা ২: pnpm ইনস্টল ইরর

**সমাধান:**

```bash
# pnpm ইনস্টল করুন
npm install -g pnpm

# ক্যাশ ক্লিয়ার করুন
pnpm store prune
pnpm install
```

### সমস্যা ৩: পোর্ট ইতিমধ্যে ব্যবহার হচ্ছে

**সমাধান:**

```bash
# পোর্ট 3000 খোলা আছে কিনা চেক করুন
lsof -i :3000

# প্রসেস কিল করুন
kill -9 <PID>

# অথবা ভিন্ন পোর্ট ব্যবহার করুন
PORT=3001 pnpm start:dev
```

### সমস্যা ৪: মাইগ্রেশন ফেইলিউর

**সমাধান:**

```bash
# ডাটাবেস রিসেট করুন এবং আবার মাইগ্রেট করুন
pnpm db:migrate:reset
pnpm db:migrate

# অথবা মাইগ্রেশন ফাইলগুলি চেক করুন prisma/migrations/
```

## 📝 Coding Standards

### ESLint and Prettier

The project includes ESLint and Prettier configuration:

```bash
# Format code
pnpm format

# Fix linting issues
pnpm lint
```

### Git Hooks (Optional)

```bash
# Install husky for git hooks
pnpm add -D husky

# Set up pre-commit hook
npx husky add .husky/pre-commit "pnpm lint && pnpm format"
```

## 🤝 Contributing Guidelines

1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Commit your changes: `git commit -m 'Add your feature'`
3. Push to the branch: `git push origin feature/your-feature-name`
4. Create a Pull Request

### Commit Message Format

```
type(scope): description

Examples:
feat(auth): add JWT authentication
fix(user): resolve email validation bug
docs(api): update user endpoint documentation
```

## 📚 Helpful Links

- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)

## 🆘 Support

If you encounter any issues:

1. Check project's issue tracker
2. Contact team lead or senior developer
3. Review documentation and Swagger API docs
4. Check existing GitHub issues

## 🔧 Advanced Configuration

### Environment Variables

| Variable         | Description                  | Default       |
| ---------------- | ---------------------------- | ------------- |
| `DATABASE_URL`   | PostgreSQL connection string | -             |
| `PORT`           | Application port             | `3000`        |
| `NODE_ENV`       | Environment                  | `development` |
| `JWT_SECRET`     | JWT signing secret           | -             |
| `JWT_EXPIRES_IN` | JWT expiration time          | `7d`          |

### Database Configuration

For production, consider:

```env
# Production database URL with SSL
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# Connection pooling
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
```

### Performance Optimization

```bash
# Build for production
pnpm build

# Start with cluster mode
NODE_ENV=production pnpm start:prod
```

## 📊 Monitoring and Logging

### Application Logs

```bash
# View application logs
tail -f logs/app.log

# View error logs
tail -f logs/error.log
```

### Database Monitoring

```bash
# Monitor database connections
psql -c "SELECT * FROM pg_stat_activity;"

# Monitor slow queries
psql -c "SELECT query, mean_time, calls FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"
```

## 🚀 Deployment Preparation

### Pre-deployment Checklist

- [ ] All tests pass
- [ ] Code is formatted and linted
- [ ] Environment variables are set
- [ ] Database migrations are up to date
- [ ] Documentation is updated
- [ ] Security scan is done

### Build Process

```bash
# Clean build
rm -rf dist
pnpm build

# Verify build
ls -la dist/
```

---

**Happy Coding! 🎉**
