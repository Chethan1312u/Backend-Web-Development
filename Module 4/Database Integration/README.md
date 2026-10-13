# Database Integration Assignment Starter

Replace the in-memory repository implementation with PostgreSQL through Prisma. The starter already uses an asynchronous repository contract so services and controllers can remain stable during the swap.

## Run

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run db:seed
npm start
```

## Database setup

Copy `.env.example` to `.env` and set `DATABASE_URL` to a PostgreSQL database you can access. Never commit `.env` or real credentials. `prisma:migrate` applies the committed migration history; `db:seed` can be run repeatedly and creates the sample author and posts only when they are missing. It does not reset or delete existing data.

```bash
npm run prisma:format
npm run prisma:validate
```

Formatting and validation do not require a live database. Migrations and seeding do. Do not use `prisma db push` as a substitute for the migration history.
