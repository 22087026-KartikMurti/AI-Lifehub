## Getting Started

First, `pnpm add` or `npm install`

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
  - `NEXT_PUBLIC_BASE_URL='http://localhost:3000' // For convenience but not required`
  6. Generate and migrate database:
  - `npx prisma generate`
  - `npx prisma migrate dev`

Finally, run the development server:

```bash
npm run dev
# or
pnpm dev
```
## Unit tests for all components included in this branch (Task-manager basic components integration test as well):
  1. `pnpm dev` or `npm dev`
  2. `pnpx vitest --watch` or  `npx vitest --watch`

Open [http://localhost:3000](http://localhost:3000) with your browser enter the home page.

## Open Router for AI

I am using nvidia/nemotron-nano-12b-v2-vl:free model for the AI, if you would like to use the app for yourself, you may have to create your own API key on OpenRouter to have access to this model (until I can solve or find a work-around)
