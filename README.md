# Monitoring Petugas SE2026 KKA

Web app Google Apps Script untuk monitoring PML, petugas, wilayah kerja, dan laporan harian. Google Spreadsheet dipakai sebagai database.

## File

- `Code.gs`: backend Apps Script, auth, CRUD, dan akses Spreadsheet.
- `Index.html`: UI web app.
- `appsscript.json`: manifest Apps Script.

## Setup Paling Mudah

1. Buat Google Spreadsheet kosong.
2. Buka `Extensions > Apps Script`.
3. Salin isi `Code.gs` ke file `Code.gs` di Apps Script.
4. Buat file HTML bernama `Index`, lalu salin isi `Index.html`.
5. Buka `Project Settings`, centang `Show appsscript.json`, lalu salin isi `appsscript.json`.
6. Jalankan fungsi `setupApp()` dari editor Apps Script.
7. Beri izin saat Google meminta authorization.
8. Deploy lewat `Deploy > New deployment > Web app`.
9. Pilih:
   - Execute as: `Me`
   - Who has access: `Anyone` atau `Anyone with Google account`
10. Buka URL deployment.

Login awal dibuat otomatis saat `setupApp()` atau login pertama:

```text
username: admin
password: admin2026
```

Segera ubah password admin dari menu `Akun`.

## Jika Script Tidak Bound ke Spreadsheet

Kalau project Apps Script dibuat standalone, jalankan fungsi ini sekali dari editor:

```js
setSpreadsheetId("ISI_DENGAN_ID_SPREADSHEET");
```

ID Spreadsheet ada di URL:

```text
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
```

## Alur Pakai

1. Login sebagai admin.
2. Buat data PML di menu `Admin`.
3. Buat akun login untuk masing-masing PML.
4. Tambahkan petugas di menu `Petugas`.
5. Assign wilayah kerja di menu `Wilayah Kerja`.
6. Input progres di menu `Laporan Harian`.
7. Pantau hasil di `Dashboard`.

## Struktur Sheet

Fungsi `setupApp()` membuat sheet berikut:

- `users`
- `pml`
- `petugas`
- `assign_tasks`
- `daily_reports`
- `audit_logs`

Data yang dinonaktifkan tidak dihapus permanen. Kolom `active` diubah menjadi `FALSE` supaya riwayat tetap bisa ditelusuri.

## Catatan Operasional

- Skala 11 PML dan sekitar 3.000 laporan harian masih aman untuk Google Spreadsheet.
- Session login disimpan 6 jam memakai `CacheService`.
- Submit data memakai `LockService` untuk mengurangi risiko tabrakan saat beberapa user input bersamaan.
- Jangan bagikan akun admin ke PML.
