# Getting Started on Local Build

First, `pnpm install` or `npm install`

Then set up local database:

## To setup your own local database:
  1. Download postgres from [postgres official](https://www.postgresql.org/download/windows/) (I use postgres-17.4)
  2. In command prompt, cd into wherever postgres is installed (e.g. `C:\Program Files\PostgreSQL\17\bin`)
  3. Type in command `psql -U postgres`
  4. Then type these commands:
  - `CREATE DATABASE ai_lifehub;`
  - `CREATE USER {Your Username} WITH PASSWORD {Your Password};`
  - `GRANT ALL PRIVILEGES ON DATABASE ai_lifehub TO {Your Username};`
  - `\q` //To exit psql
  5. Create a .env file with variables:
  - `DATABASE_URL="postgresql://{Your username}:{Your password}@localhost:5432/ai_lifehub"`
  - `AI_API_KEY={Create in API key on OpenRouter and insert the key here}`
  6. Generate and migrate database:
  - `npx prisma generate`
  - `npx prisma migrate dev`

## Setting Up Redis:

There are 2 ways stated here, Docker or Local

### Docker:

  1. Install and run Docker Desktop
  2. Start Redis in a terminal: `docker run --name ai-lifehub-redis -p 6379:6379 -d redis:7-alpine`
  3. Add this to the .env file: `REDIS_URL=redis://localhost:6379`
  4. Check if Redis is responding: `docker exec ai-lifehub-redis redis-cli ping`, it should respond with `PONG`
  5. For later sessions, start the existing container with `docker start ai-lifehub-redis` then start the app.

### Local:

  1. Open in Ubuntu in WSL and run: 
  - `sudo apt update`
  - `sudo apt install redis-server`
  - `sudo service redis-server start`
  - Check if Redis is responding: `redis-cli ping`, it should respond with `PONG`
  - Add this to the .env file: `REDIS_URL=redis://localhost:6379`

## Environment Variables:

If you have already created a .env file from setting up a local db and Redis, just add these in:

  1. `NEXT_PUBLIC_BASE_URL='http://localhost:3000'`
  2. `RESEND_API_KEY={Create one on Resend's Website and insert key here}`
  3. Generate a secret value in terminal using: `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"` then add this in the .env file: `JWT_SECRET={generated value from earlier}`

Finally, run the development server:

```bash
npm run dev
# or
pnpm dev
```
# Unit and Integration tests:
  1. `pnpm test` or to have it in watch mode `pnpm test-vitest`
  2. To run only the unit tests, use: `pnpm test-unit`
  3. To run only the integration tests, use: `pnpm test-integration`
     Running integration tests requires OpenRouter, Resend, Redis and PostgreSQL configured.

# Open Router for AI

I am using NVIDIA's nemotron-3-super-120b-a12b:free model for AI, due to token bottlenecks despite being free to use, this is not very scalable however making it scalable would require newer and stronger models which would require buying premium subscriptions. I am avoiding this because this is a passion and personal project and would like to keep everything free to use and maintain over time.

## Default Account for Quick Access

There is a default account under username 'demo' with password being 'password' to use for quick access in the development and production builds. If you have trouble logging in the development build, type `pnpm seed` or `npm run seed` and try using the previously mentioned credentials to log in once more.
