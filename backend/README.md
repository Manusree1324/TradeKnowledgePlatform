# Trade Knowledge Platform API

Express and Mongoose API for the Trade Knowledge Platform.

## Configure

Copy `.env.example` to `.env`, then set a MongoDB Atlas connection string and a unique `JWT_SECRET` of at least 32 characters. Keep `.env` private. Set `CLIENT_URL` to the frontend origin.

## Run

```powershell
npm install
npm run dev
```

The server listens on port 5000 by default and requires MongoDB to be reachable before it starts accepting requests.

## Seed the library

```powershell
npm run seed
```

Seeding is repeatable and creates 15 practical tutorials across Electrical, Plumbing, Welding, HVAC, Carpentry, and Automotive, plus all seven trade categories including Masonry. Every seeded guide includes practical steps and task-specific precautions. To provision an administrator during seeding, set `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` in `.env` first. Do not use a shared or default password.

## Tests

```powershell
npm test
```

API tests use mocked persistence and do not require production database credentials. Configure MongoDB to exercise the seed and persisted workflows.