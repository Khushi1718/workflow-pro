# Next.js Integration Notes

Workflow Pro now runs the frontend and backend inside the same Next.js app.

## Runtime

- App: `http://localhost:3000`
- API: `http://localhost:3000/api`
- Health: `http://localhost:3000/health`

## API Client

The existing frontend client lives at `src/lib/api.ts` and uses:

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";
```

For local development, no API environment variable is required. Add `NEXT_PUBLIC_API_BASE_URL` only if you intentionally want to point the UI at a different API host.

## Routing

The app uses the Next App Router. Existing views are preserved under `src/views`, and `src/lib/router.tsx` provides the small compatibility layer used by the untouched UI components.
