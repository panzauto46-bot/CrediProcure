 # CrediProcure

UI/UX prototype untuk platform manajemen kredit dan procurement yang dibangun dengan React, TypeScript, Vite, dan Tailwind CSS.

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS 4

## Cara Menjalankan Project Secara Lokal

Pastikan sudah terinstall **Node.js** dan **npm**.

```bash
# install dependency
npm install

# menjalankan mode development
npm run dev
```

Setelah `npm run dev`, buka URL yang muncul di terminal (biasanya `http://localhost:5173`).

## Build untuk Production

```bash
npm run build
```

Untuk melihat hasil build secara lokal:

```bash
npm run preview
```

## Deploy ke Vercel (via GitHub)

1. Push kode ke repository GitHub ini (`panzauto46-bot/CrediProcure`).
2. Buka [https://vercel.com](https://vercel.com) dan login.
3. Pilih **Add New Project** → **Import Git Repository**.
4. Pilih repo **CrediProcure** dari GitHub.
5. Vercel akan otomatis mendeteksi framework **Vite**.
6. Pastikan:
   - Build Command: `npm run build`
   - Output Directory: `dist`
7. Klik **Deploy** dan tunggu sampai proses selesai.

Setelah itu, Vercel akan memberikan URL deploy yang bisa dibagikan.

