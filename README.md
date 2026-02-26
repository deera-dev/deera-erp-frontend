# DEERA Internal ERP Frontend (PWA POS)

Frontend aplikasi internal POS untuk operasional grosir DEERA.
Project ini fokus ke **kecepatan input kasir**, **stabilitas di perangkat Android**, dan **integrasi penuh ke Supabase**.

## Tech Stack

- React + Vite + TypeScript
- Tailwind CSS
- Zustand (state management)
- Supabase JS (Auth, Database, Storage, RPC)
- html5-qrcode (scanner QR/barcode)
- dayjs (tanggal)
- vite-plugin-pwa (installable PWA)

## Product Context

- Internal system (bukan public app)
- Target device: Android phone
- Printer: Bluetooth thermal
- Kondisi lapangan: transaksi cepat, internet kadang tidak stabil
- Prinsip utama: **Speed first, Stability second, Simplicity third**

## Supabase Data Architecture (Ringkas)

### Master Tables

- `products`: master produk, barcode, harga jual, HPP default, dan `image_url`
- `stores`: master toko/gudang
- `stock`: stok per produk per store (unique `product_id + store_id`)

### Transaction Tables

- `sales`: header transaksi
- `sale_items`: detail item transaksi, menyimpan `hpp_at_sale` untuk historical profit
- `stock_transfers` + `stock_transfer_items`: mutasi antar store
- `damaged_stock`: catatan barang rusak

### Accounting & Control

- `accounting_periods`: kontrol lock periode

### Core RPC

- `create_sale(...)`
- `delete_sale(p_sale_id)`
- `transfer_stock(from_store, to_store, items_jsonb)`
- `mark_damaged_stock(...)`
- `is_date_locked(p_date)`
- `close_current_period(p_end_date)`

## POS Flow (Current MVP)

1. Scan barcode via kamera belakang
2. Scanner auto-stop setelah 1 scan
3. Beep + vibrate sebagai feedback user
4. Lookup produk ke Supabase (`products` aktif)
5. Item masuk ke cart Zustand
6. Jika barcode sama, qty auto increment

## Current Status

### Backend

Sudah siap dan stabil di Supabase:

- Sales engine (anti minus + historical HPP)
- Transfer engine
- Damaged stock flow
- Reporting views (profit, ledger, summary)
- Period lock enforcement

### Frontend

MVP POS berjalan:

- Scanner stabil dan usable untuk flow pasar
- Real barcode → real Supabase lookup → real cart update
- Beep/vibrate feedback aktif

Belum dikerjakan (next phase):

- Simpan transaksi `sales` dari UI checkout
- Discount flow
- Product preload cache
- Offline mode / sync strategy
- EAN-13 optimization
- Period filter integration (`period_id`)

## Product Image Convention

- Bucket Supabase Storage: `product-images`
- Naming file: `{product_id}.jpg`
- URL final disimpan di `products.image_url`

## Getting Started

1. Install dependency:

   ```bash
   npm install
   ```

2. Buat `.env`:

   ```bash
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```

3. Jalankan dev server:

   ```bash
   npm run dev
   ```

4. Build production:

   ```bash
   npm run build
   ```

## Notes

- Backend logic utama sengaja ditempatkan di Supabase RPC agar frontend tetap tipis dan cepat.
- Frontend berperan sebagai client input/operasional POS dengan UX yang dioptimalkan untuk 1 tangan.
