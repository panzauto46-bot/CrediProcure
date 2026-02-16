 # CrediProcure

UI/UX prototype untuk platform manajemen kredit dan procurement yang dibangun dengan React, TypeScript, Vite, dan Tailwind CSS.

## Roadmap Pengembangan

### Fase 1: Konsep & Desain UI/UX (Target: 3–5 hari)

- [x] Membuat sketsa user flow (alur pengguna dari login sampai pencairan dana).
- [x] Mendesain UI/UX untuk Dashboard Procurement (mirip SaaS tradisional agar mudah dipakai bisnis).
- [x] Mendesain UI/UX untuk Marketplace Investor (bergaya Web3/DeFi).
- [x] Menyiapkan logo "CrediProcure".

### Fase 2: Pengembangan Smart Contract (Target: 1 minggu)

- [ ] Membuat smart contract untuk mencetak NFT dari data Invoice (RWA).
- [ ] Membuat smart contract untuk kolam pendanaan (Liquidity Pool).
- [ ] Melakukan uji coba smart contract di lokal.
- [ ] Deploy smart contract yang sudah jadi ke Creditcoin Testnet.

### Fase 3: Integrasi & Prototipe Web (Target: 1 minggu)

- [ ] Membangun frontend aplikasi web (React.js/Next.js).
- [ ] Menghubungkan frontend dengan dompet kripto (MetaMask) dan jaringan Creditcoin.
- [ ] Menghubungkan frontend dengan smart contract agar fitur "Mint Invoice" dan "Danai" berjalan di testnet.
- [ ] Melakukan bug testing mandiri.

### Fase 4: Persiapan Final & Submission (Target: H-3 sebelum 7 Maret)

- [ ] Merekam video demo (3–5 menit) yang menunjukkan alur dari sisi vendor dan investor.
- [ ] Membuat pitch deck (PDF) berisi masalah, solusi, dan potensi pasar.
- [ ] Merapikan repositori GitHub (README.md yang jelas dan profesional).
- [ ] Mengisi formulir pendaftaran di DoraHacks sebelum deadline.

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

