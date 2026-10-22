# LU48 Starter — Session Authentication

## Setup

```bash
cp .env.example .env
npm install
npm run setup
npm run dev
```

Set `COOKIE_SECRET` in `.env` to at least 32 random characters. Keep `COOKIE_SECURE=false` for local HTTP; production must use HTTPS with `COOKIE_SECURE=true`.

Seeded demo account: `sam@example.com` / `SessionDemo!48`.

## Implement

Complete the TODOs in:

- `src/routes/authRoutes.js`
- `src/session/sessionStore.js`
- `src/middleware/requireSession.js`

Required endpoints: `POST /auth/login`, `GET /auth/me`, `POST /auth/logout`.

Use Postman cookie jar or curl `-c cookies.txt` and `-b cookies.txt` to preserve the cookie between requests.

`POST /auth/login` accepts JSON with `email` and `password`. A successful login returns the user
and sets a signed, HTTP-only `sid` cookie. `GET /auth/me` returns the authenticated user, and
`POST /auth/logout` destroys the server-side session and clears the cookie. Sessions expire after
`SESSION_TTL_MS` (one hour by default).

```bash
curl -i -c cookies.txt -H "Content-Type: application/json" \
  -d '{"email":"sam@example.com","password":"SessionDemo!48"}' \
  http://localhost:3000/auth/login
curl -i -b cookies.txt http://localhost:3000/auth/me
curl -i -b cookies.txt -c cookies.txt -X POST http://localhost:3000/auth/logout
```
