# FinanceAI Deployment

FinanceAI sengaja tidak mengikat business logic ke satu provider.

## Vercel

1. Push repository ke Git provider.
2. Import repository di Vercel.
3. Framework preset: Next.js.
4. Build command: `npm run build`.
5. Tidak ada environment variable wajib untuk MVP local-first.

## Generic Node.js

```bash
npm install
npm run build
npm start
```

Default port Next.js adalah `3000`.

## Docker

```bash
docker build -t finance-ai .
docker run --rm -p 3000:3000 finance-ai
```

`next.config.ts` sudah menggunakan `output: "standalone"` agar runtime container lebih portable.

## Platform lain

Netlify, Railway, Render, atau platform Node-compatible lain dapat menggunakan build contract yang sama:

```text
Install: npm install
Build:   npm run build
Start:   npm start
```

Untuk provider yang memiliki adapter Next.js khusus, adapter tersebut hanya menjadi deployment layer dan tidak masuk ke business modules FinanceAI.
