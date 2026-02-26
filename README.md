# DEERA ERP – Internal PWA POS Frontend

Sistem ini adalah **ERP retail internal** untuk operasional grosir dengan fokus utama:

- **Speed first** (transaksi cepat, minim friction)
- **Stability second** (aman dipakai di kondisi pasar)
- **Simplicity third** (UI ringkas, mobile-first)

Target penggunaan:

- Device utama: **Android phone**
- Input utama: **scan barcode/QR**
- Output transaksi: **Bluetooth thermal printer**
- Distribusi aplikasi: **PWA installable** (tanpa Play Store)

---

## Architecture (High Level)

### Backend (Supabase) — ✅ Selesai

Semua business logic kritis ditempatkan di database (RPC + constraint), bukan di frontend.
Tujuan: konsistensi data, anti manipulasi, dan safety accounting.

Komponen backend:

- PostgreSQL (table, view, constraint)
- Supabase Auth
- Supabase Storage
- Supabase RPC (logic transaksi)
- RLS policy

### Frontend (PWA) — 🚧 Development Scope

Stack yang dipakai:

- React + Vite + TypeScript
- Tailwind CSS
- Zustand
- Supabase JS
- Vite PWA plugin
- html5-qrcode

---

## Supabase Database Architecture

### 1) Master Tables

- `products`
  - `id`, `product_code`, `barcode_value (unique)`, `display_name`
  - `selling_price`, `hpp_per_pcs`, `image_url`, `is_active`, `created_at`
  - Catatan:
    - 1 produk = 1 barcode
    - 1 produk = 1 foto
    - HPP default disimpan di sini
- `stores`
  - `id`, `name`, `created_at`
- `stock`
  - `id`, `product_id`, `store_id`, `qty`, `updated_at`
  - Unique constraint: `(product_id, store_id)`

### 2) Transaction Tables

- `sales`
  - Header transaksi (`id`, `store_id`, `total_amount`, `created_at`)
- `sale_items`
  - Detail item (`sale_id`, `product_id`, `qty`, `price`, `hpp_at_sale`, `created_at`)
  - `hpp_at_sale` menjaga akurasi profit historis walau HPP produk berubah
- `stock_transfers` + `stock_transfer_items`
  - Header + detail transfer stok antar store
- `damaged_stock`
  - Catatan barang rusak (`product_id`, `store_id`, `qty`, `note`, `created_at`)

### 3) Accounting Control

- `accounting_periods`
  - `start_date`, `end_date`, `is_closed`, `created_at`
  - Dipakai untuk lock period

---

## Core RPC (Database Functions)

- `create_sale(...)`
  - Insert sales header + items
  - Ambil HPP saat transaksi
  - Simpan `hpp_at_sale`
  - Kurangi stock
  - Proteksi anti-minus + period lock
- `delete_sale(p_sale_id)`
  - Cek period lock
  - Restore stock
  - Hapus sale items + sale header
- `transfer_stock(from_store, to_store, items_jsonb)`
  - Transfer multi item
  - Simpan log transfer
  - Anti-minus + period lock
- `mark_damaged_stock(...)`
  - Cek period lock
  - Kurangi stock
  - Simpan damaged log
- `is_date_locked(p_date)`
  - Return boolean lock status
- `close_current_period(p_end_date)`
  - Close period aktif + buka period baru

---

## Reporting Views

- **Profit View**
  - Rumus utama: `sum(qty * (price - hpp_at_sale))`
  - Historical profit tetap akurat
- **Stock Ledger View**
  - Gabungan transaksi sale, transfer out/in, damaged
  - Audit histori by timestamp
- **Sales Summary View**
  - Total transaksi, qty, revenue, profit

---

## Storage Convention (Product Image)

- Bucket: `product-images`
- Naming: `{product_id}.jpg`
- URL public disimpan di `products.image_url`

---

## Frontend Feature Plan

### 1) Authentication

- Login via Supabase Auth
- Session persistence
- Basic role (admin)

### 2) Dashboard

Ringkasan harian:

- Omset
- Profit
- Qty terjual
- Jumlah transaksi
- Damaged
- Transfer

### 3) POS (Most Critical)

Flow target super cepat:

- Auto focus input
- Scan barcode/QR
- Auto add to cart
- Scan lagi
- Enter → bayar → print

Fitur POS:

- Scan barcode
- Manual search
- Auto qty increment
- Remove item
- Hitung total realtime
- Submit sale (RPC)
- Print Bluetooth thermal
- Error handling (stock habis, period lock)

### 4) Product Management

- Create/edit product
- Upload foto via kamera HP
- Preview image
- Search product
- Deactivate product

### 5) Transfer Management

- Pilih from store / to store
- Multi product transfer
- Submit transfer

### 6) Damaged Management

- Pilih product + store
- Input qty
- Submit damaged

### 7) Reporting Page

- Filter tanggal
- Profit per produk
- Profit per store
- Stock ledger
- Summary table

### 8) Settings

- Close period
- Lihat period aktif
- Optional: tambah store
- Optional: edit HPP default

### 9) PWA Features

- Installable
- App icon + splash screen
- Fullscreen mode
- Auto update deploy
- Offline fallback (manual nota mode)

---

## Current Status

- **Backend:** ✅ 100% selesai & stabil
- **Frontend:** 🚧 implementasi bertahap sesuai scope di atas

Fitur pembeda sistem:

- Historical HPP aman
- Anti minus stock
- Multi-store real
- Full stock ledger audit
- Accounting period lock
- Product image per item
- POS flow ultra-fast (mobile-first)

---

## Setup

1. Install dependency

```bash
npm install
```

2. Isi environment variable

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

3. Jalankan aplikasi

```bash
npm run dev
```

4. Build production

```bash
npm run build
```
