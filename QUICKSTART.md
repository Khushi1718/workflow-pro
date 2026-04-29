# Quick Start

## Prerequisites

- Node.js v18+
- MongoDB running locally or a `MONGODB_URI` environment variable

## Setup

```bash
npm install
npm run seed
npm run dev
```

Open `http://localhost:3000`.

## Test Login

```text
Admin: admin@tracely.app / password123
Employee: khushi@tracely.app / password123
Employee 2: john@tracely.app / password123
```

## Useful Checks

```bash
curl http://localhost:3000/health

curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"khushi@tracely.app","password":"password123"}'
```

## Notes

Frontend and backend now run together in Next.js. The UI lives in `src/views` and `src/components`; the backend lives in `app/api` and `src/server`.
