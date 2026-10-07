# TradeKnowledge Platform

A full-stack, safety-conscious knowledge exchange for Electrical, Plumbing, Welding, HVAC, Carpentry, Automotive and Masonry trades. Learners and professionals can publish guides for review, discuss and rate approved tutorials, and save them for later. Administrators manage members, categories and publication status.

## Start the applications

Configure `backend/.env` from `backend/.env.example` with a reachable MongoDB URI, `CLIENT_URL`, and a unique JWT secret of at least 32 characters. The frontend can use the Vite `/api` proxy by leaving `VITE_API_BASE_URL` unset, or set it in `frontend/.env`.

In separate terminals:

```powershell
cd backend
npm install
npm run dev
```

```powershell
cd frontend
npm install
npm run dev
```

Seed the starter library from `backend/` with `npm run seed`. The seed is idempotent; optionally set `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` in the backend environment to create an administrator. Run backend API tests with `npm test` and verify the production frontend with `npm run build` from `frontend/`.

See [PRD.md](PRD.md) for the initial product scope and [backend/README.md](backend/README.md) for API configuration and seed details.