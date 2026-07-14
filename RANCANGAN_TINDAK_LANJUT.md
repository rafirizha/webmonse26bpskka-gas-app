# Rancangan Tindak Lanjut Webmon SE2026 KKA

Dokumen ini dipakai untuk mencatat ide, revisi, dan rencana perbaikan sebelum dieksekusi satu per satu. Tujuannya supaya semua masukan tertampung dulu, lalu pengerjaan bisa lebih rapi dan tidak saling tabrakan.

## Cara Pakai

- Tambahkan ide baru ke bagian `Daftar Rencana`.
- Setiap rencana diberi status: `Diskusi`, `Siap Eksekusi`, `Dikerjakan`, `Selesai`, atau `Ditunda`.
- Eksekusi dilakukan bertahap berdasarkan prioritas dan dampak ke pengguna.
- Perubahan yang berisiko ke data seperti `assign_tasks`, `daily_reports`, atau mapping petugas harus dibahas dulu sebelum kode diubah.

## Daftar Rencana

### 1. Menu Khusus Kinerja Petugas

Status: `Selesai`

Prioritas: `Tinggi`

Latar belakang:

- Dashboard mulai terlalu penuh kalau semua detail monitoring dimasukkan ke satu halaman.
- Ada kebutuhan untuk melihat progress per petugas, bukan hanya per SLS.
- Pegawai ingin bisa mengetahui petugas dengan progress paling kecil untuk bahan pemantauan, evaluasi, atau motivasi.

Rancangan solusi:

- Buat menu baru bernama `Kinerja Petugas`.
- Dashboard tetap menjadi ringkasan eksekutif, bukan halaman detail.
- Detail progress petugas dipindahkan ke menu khusus agar lebih fokus.

Usulan urutan sidebar:

1. Dashboard
2. Kinerja Petugas
3. Laporan Harian
4. Wilayah Kerja
5. Prelist Usaha
6. Petugas
7. Admin

Isi utama menu `Kinerja Petugas`:

- Ringkasan atas:
  - Total petugas
  - Sudah mulai
  - Belum mulai
  - Progress rata-rata
  - Petugas perlu perhatian
- Panel `10 Progress Terendah`:
  - Nama petugas
  - PML
  - Korwil
  - Kecamatan
  - Target
  - Tercacah
  - Sisa
  - Progress
  - Status
- Tabel detail petugas:
  - Petugas
  - PML
  - Korwil
  - Kecamatan
  - Jumlah SLS
  - Target
  - Tercacah
  - Sisa
  - Progress
  - Laporan terakhir
  - Aksi lihat detail SLS

Filter yang dibutuhkan:

- PML
- Korwil
- Kecamatan
- Petugas
- Jenis beban: semua, mitra, organik
- Status: belum mulai, berjalan, selesai

Catatan UX:

- Petugas progress rendah bisa diberi warna lembut, bukan terlalu agresif.
- Data untuk screenshot sebaiknya ringkas dan mudah dibaca.
- Dashboard cukup menampilkan teaser kecil seperti `Petugas perlu perhatian` dan tombol menuju `Kinerja Petugas`.

Catatan teknis:

- Gunakan data yang sudah ada dari `assign_tasks`, `daily_reports`, `pml`, dan `petugas`.
- Jangan mengubah struktur `daily_reports`.
- Status selesai tetap mengikuti mekanisme penandaan selesai yang sudah ada, bukan semata-mata progress mencapai target.
- Pastikan pagination tetap tersedia untuk tabel detail.

### 2. Struktur Baru Input Laporan Harian

Status: `Selesai`

Prioritas: `Tinggi`

Latar belakang:

- Konsep muatan berubah. Muatan progress hanya dihitung dari `keluarga` dan `usaha non-pertanian`.
- `Usaha pertanian` tetap perlu dicatat sebagai informasi tambahan, tetapi tidak masuk hitungan progress.
- Form lama hanya memakai input `muatan_harian` manual dan `catatan`, sehingga rincian keluarga, usaha non-pertanian, dan usaha pertanian tidak terstruktur.
- Data lama tidak perlu langsung dimigrasikan ke struktur baru agar tidak mengganggu laporan yang sudah masuk.

Rancangan solusi:

- Ubah form laporan harian agar PML mengisi tiga field angka:
  - `Keluarga`
  - `Usaha non-pertanian`
  - `Usaha pertanian`
- `Muatan harian` untuk progress dihitung otomatis:

```text
muatan_harian = keluarga + usaha_non_pertanian
```

- `Usaha pertanian` disimpan sebagai data tambahan dan bisa ditampilkan di riwayat laporan, tetapi tidak menambah progress.
- Input `muatan_harian` manual sebaiknya tidak lagi ditampilkan ke user untuk mengurangi salah hitung.

Catatan data lama:

- Data lama tetap dibiarkan apa adanya, yaitu memakai `muatan_harian` dan `catatan`.
- Mapping catatan lama ke kolom baru `keluarga`, `usaha_non_pertanian`, dan `usaha_pertanian` ditunda.
- Jika nanti dibutuhkan, migrasi data lama bisa dilakukan dengan parser dan flag `needs_review`, bukan langsung ditimpa otomatis.

Catatan teknis:

- Pertimbangkan menambah kolom baru di sheet `daily_reports`:
  - `keluarga_harian`
  - `usaha_non_pertanian_harian`
  - `usaha_pertanian_harian`
- Kolom `muatan_harian` tetap dipertahankan untuk kompatibilitas grafik, dashboard, dan progress yang sudah ada.
- Untuk laporan baru, backend harus menghitung `muatan_harian` dari `keluarga_harian + usaha_non_pertanian_harian`.
- Untuk laporan lama yang belum punya kolom rincian, tampilan tetap membaca `muatan_harian` dan `catatan`.
- Jangan mengubah atau menghapus isi laporan lama saat fitur ini diterapkan.

### 3. Penyederhanaan UX Form Laporan Harian

Status: `Selesai`

Prioritas: `Sedang`

Latar belakang:

- Setelah struktur input laporan harian dibuat lebih rinci, tampilan form terasa terlalu ramai.
- Field `Catatan hitung` tidak perlu ditampilkan karena rumus progress adalah logika sistem, bukan instruksi yang harus dibaca user setiap kali input.
- Field `Muatan progress` dalam bentuk input readonly masih berpotensi membingungkan karena terlihat seperti field yang harus diisi.
- Informasi `PML` dalam input besar terasa mengulang, terutama ketika nama PML sudah muncul di label petugas.

Rancangan solusi:

- Hapus field `Catatan hitung` dari form.
- Jangan tampilkan `Muatan progress` sebagai input besar.
- Tampilkan hasil hitung progress sebagai ringkasan kecil di area bawah form, dekat tombol simpan:

```text
Masuk progress hari ini: 0
```

- Pertahankan label `Akumulasi` sesuai keputusan user.
- Pertimbangkan mengubah field `PML` menjadi metadata kecil, bukan input besar, misalnya:

```text
PML: Sumiati
```

- Susun form agar alur input terasa lebih natural:
  - Petugas
  - Wilayah kerja
  - PML sebagai metadata kecil
  - Tanggal monitoring
  - Akumulasi
  - Keluarga
  - Usaha non-pertanian
  - Usaha pertanian
  - Catatan
  - Ringkasan `Masuk progress hari ini`
  - Tombol simpan

Catatan UX:

- Dua field pembentuk progress, yaitu `Keluarga` dan `Usaha non-pertanian`, sebaiknya diletakkan sejajar.
- `Usaha pertanian` tetap terlihat, tetapi tidak perlu dibuat seolah setara dengan angka progress utama.
- Tampilkan catatan kecil bila perlu:

```text
Usaha pertanian disimpan sebagai informasi tambahan.
```

- Hindari menampilkan formula teknis berulang di form utama.
- Tujuan form adalah membantu PML melapor cepat, bukan menjelaskan struktur database.

### 4. Rekap Mingguan Provinsi

Status: `Implementasi tahap awal`

Prioritas: `Tinggi`

Latar belakang:

- BPS Provinsi membutuhkan monitoring mingguan dengan format mendekati template `Monitoring SE2026 Kepri.xlsx`.
- Rekap yang dibutuhkan berbasis minggu, yaitu M1 sampai M12.
- Provinsi juga membutuhkan fitur download Excel dengan satu format lengkap untuk KK dan usaha sekaligus.
- Fitur ini sebaiknya tidak dicampur ke Dashboard, Kinerja Petugas, atau Wilayah Kerja agar informasi tetap fokus.

Rancangan solusi:

- Buat tab baru bernama `Rekap Mingguan`.
- Tab ini ditampilkan untuk:
  - `viewer`
  - `admin`
- `pml` tidak ditampilkan dulu agar menu PML tetap fokus ke input dan monitoring operasional.
- Data ditampilkan dari sumber yang sudah ada, tanpa menambah struktur database baru.
- Sumber utama:
  - `assign_tasks`
  - `daily_reports`
  - `petugas`
  - `pml`

Definisi minggu:

```text
M1  = 15 Juni - 21 Juni
M2  = 22 Juni - 28 Juni
M3  = 29 Juni - 5 Juli
M4  = 6 Juli - 12 Juli
M5  = 13 Juli - 19 Juli
M6  = 20 Juli - 26 Juli
M7  = 27 Juli - 2 Agustus
M8  = 2 Agustus - 8 Agustus
M9  = 9 Agustus - 14 Agustus
M10 = 15 Agustus - 21 Agustus
M11 = 22 Agustus - 28 Agustus
M12 = 29 Agustus - 31 Agustus
```

Mode tampilan tabel tahap awal:

- `Mingguan KK`
  - M1-M12 berisi total keluarga/KK dari laporan harian.
- `Mingguan Usaha`
  - M1-M12 berisi total usaha non-pertanian dari laporan harian.
- `Mingguan Muatan`
  - M1-M12 berisi total keluarga/KK + usaha non-pertanian.

Catatan konsep terbaru:

- `Usaha` dalam rekap provinsi berarti usaha non-pertanian.
- `Usaha pertanian` tidak masuk rekap mingguan ini.
- Muatan progress tetap berarti:

```text
muatan = keluarga/KK + usaha non-pertanian
```

- Untuk laporan lama yang belum punya rincian `keluarga_harian` dan `usaha_non_pertanian_harian`, perlu fallback saat implementasi:
  - Untuk mode `Mingguan Muatan`, masih bisa memakai `muatan_harian`.
  - Untuk mode `Mingguan KK` dan `Mingguan Usaha`, data lama tanpa rincian tidak bisa dipisahkan secara akurat.
  - Fallback ini harus ditampilkan dengan hati-hati agar tidak menyesatkan.

Kontrol tahap awal:

- Mode tabel: KK, Usaha, Muatan
- Tombol download Excel/CSV sesuai mode aktif

Filter lanjutan yang bisa ditambahkan nanti:

- Cari wilayah, ID SLS, PML, atau petugas
- Kecamatan
- Desa/Kelurahan
- PML
- Petugas
- Korwil
- Jenis beban: semua, mitra, organik

Kolom tabel utama:

- Kecamatan
- Desa
- ID SLS
- Nama SLS
- Petugas
- PML
- Korwil
- M1
- M2
- M3
- M4
- M5
- M6
- M7
- M8
- M9
- M10
- M11
- M12
- Total
- Target atau prelist terkait
- Selisih

Download Excel:

- Tombol `Download Excel` tersedia di tab `Rekap Mingguan`.
- File yang diunduh berisi satu format lengkap provinsi, bukan per mode tabel.
- Kolom mingguan KK dan kolom mingguan usaha non-pertanian ditampilkan sekaligus.
- Kolom kode wilayah, ID SLS, kode PCL/PML, dan nomor HP harus dipaksa sebagai teks agar leading zero dan ID panjang tidak berubah.
- Tombol `Download Excel` membuat file `.xlsx` langsung di browser dari data bootstrap Webmon.
- Implementasi tidak memakai temporary Spreadsheet, `DriveApp`, `UrlFetchApp`, atau sheet output tambahan.

Catatan teknis:

- Implementasi cukup di `Script.html` untuk proses download langsung.
- Tidak perlu menambah sheet output di database utama.
- Tidak perlu mengubah struktur `daily_reports`.
- Perhitungan mingguan dilakukan runtime dari `daily_reports` berdasarkan tanggal laporan.
- Tidak perlu menambah kolom M1-M12 atau identifier minggu di database.
- Untuk performa, hasil rekap bisa dihitung dari data bootstrap yang sudah ada di frontend, sedangkan download bisa dibuat server-side agar file lebih rapi.
- Hati-hati dengan ID SLS agar tidak berubah menjadi scientific notation saat download.

Revisi lanjutan: agregasi 465 SLS unik dan kolom kumulatif provinsi:

Status: `Selesai`

Latar belakang:

- Provinsi membutuhkan output yang sederhana dan unik per SLS, total 465 baris.
- Di database internal Webmon, sebagian SLS bisa muncul sebagai dua task operasional:

```text
2105xxxxxxxxxx
2105xxxxxxxxxx-ORGANIK
```

- Struktur ini dibutuhkan untuk pembagian beban internal antara mitra dan organik.
- Namun untuk kebutuhan provinsi, dua baris tersebut sebaiknya digabung menjadi satu baris SLS unik agar rumus lookup dan rekap provinsi tidak membaca `-ORGANIK` sebagai SLS berbeda.
- Provinsi juga meminta kolom hasil lap menjadi kumulatif dari awal periode, bukan nilai per minggu terpisah.
- Asumsi awal periode kumulatif adalah `15 Juni 2026`, berdasarkan header `15-19 JUNI`.

Prinsip utama:

- Jangan mengubah struktur database.
- Jangan mengubah `assign_tasks`, `daily_reports`, atau `task_id` yang sudah berjalan.
- Agregasi hanya dilakukan di layer preview `Rekap Mingguan` dan output download Excel provinsi.
- Join progress tetap menggunakan `task_id`, bukan teks `ID SLS` yang tampil di Excel.

Rancangan bridge/agregasi:

- Buat fungsi runtime untuk membersihkan ID SLS:

```text
clean_id_sls = id_sls tanpa suffix "-ORGANIK"
```

- Saat membangun rekap provinsi, kelompokkan task berdasarkan `clean_id_sls`.
- Jika ada task reguler dan task organik dengan `clean_id_sls` sama, gabungkan nilai mingguannya menjadi satu baris.
- Output preview dan Excel menampilkan `ID SLS` bersih tanpa `-ORGANIK`.
- `Nama SLS` ditampilkan sebagai nama SLS normal, tanpa label tambahan `-ORGANIK`, karena output provinsi berorientasi pada 465 SLS unik.

Aturan agregasi nilai:

- Untuk setiap titik kumulatif:
  - `KK` = total keluarga dari seluruh task dalam grup `clean_id_sls`, dihitung dari `2026-06-15` sampai tanggal akhir titik kumulatif.
  - `Usaha` = total usaha non-pertanian dari seluruh task dalam grup `clean_id_sls`, dihitung dari `2026-06-15` sampai tanggal akhir titik kumulatif.
- Kolom kumulatif diperlakukan sebagai checkpoint berjalan:
  - checkpoint yang sudah lewat atau sedang berjalan boleh terisi;
  - checkpoint masa depan dibiarkan kosong dulu;
  - contoh pada `22 Juni 2026`, kolom `15-19 JUNI` dan `15-26 JUNI` boleh terisi, sedangkan `15-30 JUNI` sampai akhir tetap kosong.
- `Total KK Lap` = nilai KK pada titik kumulatif aktif terakhir.
- `Total Usaha Lap` = nilai usaha pada titik kumulatif aktif terakhir.
- `KK Prelist` dan `Usaha Prelist` mengikuti nilai prelist/agregat dari grup `clean_id_sls`.
- `Selisih KK` = `Total KK Lap - KK Prelist`.
- `Selisih Usaha` = `Total Usaha Lap - Usaha Prelist`.

Titik kumulatif yang diminta provinsi:

```text
C1  = 15 Juni - 19 Juni 2026
C2  = 15 Juni - 26 Juni 2026
C3  = 15 Juni - 30 Juni 2026
C4  = 15 Juni - 03 Juli 2026
C5  = 15 Juni - 10 Juli 2026
C6  = 15 Juni - 17 Juli 2026
C7  = 15 Juni - 24 Juli 2026
C8  = 15 Juni - 31 Juli 2026
C9  = 15 Juni - 07 Agustus 2026
C10 = 15 Juni - 14 Agustus 2026
C11 = 15 Juni - 21 Agustus 2026
C12 = 15 Juni - 28 Agustus 2026
C13 = 15 Juni - 31 Agustus 2026
```

Header export Excel untuk KK:

```text
JUMLAH KK HASIL LAP (15-19 JUNI)
JUMLAH KK HASIL LAP (15-26 JUNI)
JUMLAH KK HASIL LAP (15-30 JUNI)
JUMLAH KK HASIL LAP (15-03 JULI)
JUMLAH KK HASIL LAP (15-10 JULI)
JUMLAH KK HASIL LAP (15-17 JULI)
JUMLAH KK HASIL LAP (15-24 JULI)
JUMLAH KK HASIL LAP (15-31 JULI)
JUMLAH KK HASIL LAP (15-07 AGS)
JUMLAH KK HASIL LAP (15-14 AGS)
JUMLAH KK HASIL LAP (15-21 AGS)
JUMLAH KK HASIL LAP (15-28 AGS)
JUMLAH KK HASIL LAP (15-31 AGS)
```

Header export Excel untuk usaha:

```text
JUMLAH Usaha HASIL LAP (15-19 JUNI)
JUMLAH Usaha HASIL LAP (15-26 JUNI)
JUMLAH Usaha HASIL LAP (15-30 JUNI)
JUMLAH Usaha HASIL LAP (15-03 JULI)
JUMLAH Usaha HASIL LAP (15-10 JULI)
JUMLAH Usaha HASIL LAP (15-17 JULI)
JUMLAH Usaha HASIL LAP (15-24 JULI)
JUMLAH Usaha HASIL LAP (15-31 JULI)
JUMLAH Usaha HASIL LAP (15-07 AGS)
JUMLAH Usaha HASIL LAP (15-14 AGS)
JUMLAH Usaha HASIL LAP (15-21 AGS)
JUMLAH Usaha HASIL LAP (15-28 AGS)
JUMLAH Usaha HASIL LAP (15-31 AGS)
```

Catatan khusus organik:

- Untuk SLS biasa, task `-ORGANIK` menyumbang bagian organik/UB sesuai konsep kerja internal, lalu digabung ke SLS reguler pada output provinsi.
- SLS kawasan khusus `2105072004500100` tetap menjadi satu baris SLS unik.
- Untuk SLS khusus `2105072004500100`, seluruh muatan organik yang relevan masuk ke baris tersebut, termasuk pengecualian `UM + UMK` yang memang dicacah organik.
- Dengan pendekatan ini, output provinsi tetap 465 SLS unik tanpa merusak pembagian beban internal Webmon.

Kolom preview `Rekap Mingguan` setelah agregasi:

- ID SLS
- Desa
- Nama SLS
- Nama PCL
- KK C1 sampai KK C13, dengan tooltip tanggal kumulatif
- Total KK Lap
- KK Prelist
- Selisih KK
- Usaha C1 sampai Usaha C13, dengan tooltip tanggal kumulatif
- Total Usaha Lap
- Usaha Prelist
- Selisih Usaha

Rencana eksekusi bertahap:

1. Tambahkan konstanta periode kumulatif provinsi di backend dan frontend.
2. Buat helper `clean_id_sls` untuk menghapus suffix `-ORGANIK` hanya pada layer rekap/export.
3. Ubah builder export provinsi agar mengelompokkan task berdasarkan `clean_id_sls`.
4. Hitung kolom KK dan usaha secara kumulatif berdasarkan tanggal laporan.
5. Ubah preview `Rekap Mingguan` agar memakai data agregat 465 SLS unik dan kolom C1-C13.
6. Pastikan hasil download Excel tetap memaksa kolom ID/kode sebagai teks.
7. Validasi jumlah baris output = 465 SLS unik.
8. Validasi khusus SLS `2105072004500100` agar pengecualian organik tetap masuk benar.

Risiko dan mitigasi:

- Risiko: dua task berbeda menjadi satu baris output sehingga detail petugas organik tidak terlihat di rekap provinsi.
  - Mitigasi: detail operasional tetap tersedia di menu internal seperti `Wilayah Kerja` dan `Kinerja Petugas`.
- Risiko: target/prelist bisa dobel jika agregasi tidak hati-hati.
  - Mitigasi: target/prelist harus dihitung per `clean_id_sls`, bukan sekadar menjumlah semua baris task tanpa aturan.
- Risiko: user bingung karena label lama `M1-M12` berubah menjadi kumulatif.
  - Mitigasi: preview web memakai label pendek `KK C1-C13` dan `Usaha C1-C13`, dengan tooltip tanggal kumulatif; export Excel memakai header lengkap dari provinsi.
- Risiko: laporan lama masih memakai konsep muatan lama.
  - Mitigasi: untuk rekap KK/Usaha, tetap gunakan kolom terstruktur `keluarga_harian` dan `usaha_non_pertanian_harian`; fallback ke `muatan_harian` hanya boleh dipakai untuk konteks muatan, bukan memecah KK dan usaha.

### 5. Integrasi Progress FASIH dari CSV Scraping

Status: `Selesai tahap awal`

Prioritas: `Tinggi`

Latar belakang:

- Selain laporan lapangan di Webmon, ada sumber progress lain dari FASIH sebagai aplikasi kuesioner.
- Data FASIH bisa memberikan status lebih dekat ke kondisi real-time, misalnya jumlah `Open`, `Draft`, `Submitted`, `Rejected`, dan `Approved`.
- Saat ini data FASIH diperoleh dari scraping manual di console Chrome, lalu disimpan sebagai CSV.
- Update tidak harus otomatis penuh; cukup ada mekanisme admin untuk import CSV setiap 12 jam atau 24 jam sesuai kebutuhan operasional.
- Dashboard perlu membedakan antara:
  - progress pelaporan lapangan dari Webmon;
  - progress status kuesioner dari FASIH.

Contoh struktur CSV FASIH:

```text
Scraped_At
Email
Username
Fullname
SLS_Code
SLS_Name
Open
Draft
Submitted_By_Pencacah
Submitted_Respondent
Rejected
Approved
Total_Status
Dominant_Status
All_Statuses
Other_Statuses
```

Rancangan sheet baru:

- Tambahkan sheet baru di database bernama `fasih_progress`.
- Sheet ini menjadi staging status FASIH terbaru hasil import CSV.
- Data lama bisa dipilih salah satu pendekatan:
  - overwrite penuh setiap import agar sheet selalu merepresentasikan snapshot terbaru; atau
  - simpan histori import dengan `import_batch_id`.
- Rekomendasi tahap awal: overwrite penuh agar sederhana, cepat, dan tidak membengkakkan spreadsheet.

Usulan header sheet `fasih_progress`:

```text
imported_at
scraped_at
email
username
fullname
sls_code
sls_name
open
draft
submitted_by_pencacah
submitted_respondent
rejected
approved
total_status
dominant_status
all_statuses
other_statuses
```

Flow import:

1. Admin membuka menu khusus atau panel admin `Import FASIH`.
2. Admin memilih file CSV hasil scraping.
3. Frontend membaca CSV, menampilkan ringkasan validasi awal:
   - jumlah baris;
   - timestamp `Scraped_At`;
   - jumlah SLS unik;
   - total open/draft/submitted/rejected/approved.
4. Admin klik `Import`.
5. Backend menyimpan snapshot terbaru ke sheet `fasih_progress`.
6. Dashboard dan menu terkait membaca data terbaru dari `fasih_progress`.
7. Tampilkan metadata versi data:

```text
Data FASIH terakhir diimport: 22 Juni 2026 09:42
Sumber scraping: 22 Juni 2026 09:41
```

Informasi dashboard yang disarankan:

- Card ringkasan FASIH:
  - Total status/kuesioner.
  - Open.
  - Draft.
  - Submitted by pencacah.
  - Submitted respondent.
  - Rejected.
  - Approved.
- Card versi data:
  - waktu scraping;
  - waktu import ke Webmon;
  - umur data, misalnya `2 jam lalu`.
- Perbandingan Webmon vs FASIH:
  - total muatan tercatat di Webmon;
  - total status FASIH;
  - selisih indikatif.
- Daftar perlu perhatian:
  - SLS dengan `Open` tinggi tetapi laporan lapangan rendah.
  - SLS dengan `Rejected` > 0.
  - SLS yang belum muncul di FASIH tetapi ada di assign/prelist.
  - SLS yang muncul di FASIH tetapi tidak cocok dengan database Webmon.

Rancangan tampilan lanjutan:

- Buat menu/panel `Monitoring FASIH` bila informasi dashboard mulai terlalu padat.
- Dashboard cukup menampilkan ringkasan dan indikator penting.
- Detail tabel FASIH dipindahkan ke menu khusus agar tidak membuat Dashboard terlalu berat.

Kolom tabel detail FASIH yang disarankan:

- ID SLS
- Desa
- Nama SLS
- Petugas/PCL dari Webmon, bila bisa dimapping dari `assign_tasks`
- PML dari Webmon
- Open
- Draft
- Submitted Pencacah
- Submitted Respondent
- Rejected
- Approved
- Total
- Dominant Status
- Update FASIH

Mapping data:

- `SLS_Code` pada CSV FASIH dipakai sebagai kunci utama untuk join dengan `assign_tasks.idsubsls` atau `clean_id_sls`.
- Jika Webmon memakai suffix `-ORGANIK`, mapping FASIH harus menggunakan `clean_id_sls`.
- Join ke petugas/PML bersifat informatif, bukan mengubah database.
- Jika satu `SLS_Code` memiliki lebih dari satu task internal, tampilkan agregat FASIH sekali per SLS dan data petugas bisa mengikuti task reguler atau gabungan sesuai kebutuhan tampilan.

Validasi import:

- Wajib cek header CSV agar format tidak salah.
- Wajib cek jumlah baris dan jumlah `SLS_Code` unik.
- Wajib cek nilai numerik status.
- Wajib cek apakah CSV valid secara struktur, karena file yang diedit manual di spreadsheet bisa berubah menjadi format tidak standar, misalnya:
  - ada tambahan `;;;;` di akhir header/baris;
  - satu baris data terbungkus quote besar;
  - tanda quote ganda muncul di setiap field;
  - field `All_Statuses` berisi pemisah status yang bisa mengganggu parser sederhana.
- Importer sebaiknya punya normalizer ringan atau minimal menolak file dengan pesan yang jelas agar admin tahu file perlu diekspor ulang sebagai CSV bersih.
- Wajib tampilkan peringatan jika ada:
  - `SLS_Code` kosong;
  - `SLS_Code` duplikat;
  - status total tidak sama dengan penjumlahan status;
  - `SLS_Code` tidak ditemukan di Webmon;
  - SLS Webmon tidak muncul di CSV FASIH.

Advice tambahan:

- Tambahkan indikator `umur data FASIH`:
  - hijau jika kurang dari 12 jam;
  - kuning jika 12-24 jam;
  - merah jika lebih dari 24 jam.
- Tambahkan metrik `Rejected` sebagai alarm utama karena ini butuh tindak lanjut.
- Tambahkan metrik `Draft tinggi` sebagai indikasi pekerjaan sudah mulai tetapi belum dikirim.
- Tambahkan metrik `Open tinggi` sebagai indikasi belum banyak disentuh.
- Tambahkan fitur download atau copy ringkasan FASIH untuk bahan laporan cepat.
- Simpan minimal metadata import terakhir di sheet kecil atau bagian atas sheet `fasih_progress` agar admin tahu snapshot mana yang sedang dipakai.

Catatan teknis:

- Tahap awal cukup import CSV manual, tidak perlu scraping otomatis dari sistem.
- Jangan menambahkan proses otomatis 12/24 jam dulu karena sumber CSV masih manual.
- Jangan mengubah `daily_reports`; data FASIH adalah sumber observasi terpisah.
- `fasih_progress` sebaiknya diperlakukan sebagai snapshot eksternal, bukan sumber kebenaran untuk progress lapangan Webmon.
- Jika suatu saat ingin histori, buat sheet tambahan `fasih_import_log`, bukan menumpuk semua snapshot di `fasih_progress`.
- File contoh terbaru setelah baris percobaan dihapus berisi 466 line, yaitu 1 header + 465 data. Namun formatnya perlu dibersihkan/ditangani hati-hati saat import karena ada indikasi CSV tidak standar setelah diedit manual.

Implementasi tahap awal:

- Menambahkan sheet `fasih_progress` sebagai snapshot terbaru hasil import CSV.
- Menambahkan fungsi backend `importFasihProgress` khusus admin.
- Menambahkan panel `Import Progress FASIH` di menu Admin.
- Menambahkan parser CSV di frontend dengan validasi header wajib.
- Dashboard menampilkan ringkasan FASIH terbaru:
  - SLS FASIH;
  - Open;
  - Draft;
  - Submitted;
  - Approved;
  - Rejected;
  - total status;
  - waktu scraping dan waktu import.
- Import bersifat overwrite penuh agar sheet tetap ringan dan merepresentasikan versi terbaru.
- Data `daily_reports`, `assign_tasks`, dan progress Webmon tidak diubah oleh import FASIH.

## Tierlist Prioritas UI/UX dan Risiko

Bagian ini dipakai sebagai peta keputusan sebelum eksekusi UI/UX. Urutan dibuat dari dampak paling besar dan perubahan paling berat, sampai nice to have yang relatif kecil. Prinsipnya: dahulukan perubahan yang membantu pengguna mengambil tindakan harian, bukan hanya mempercantik tampilan.

| Tier | Rencana tindak lanjut | Dampak UX | Ukuran perubahan | Risiko utama | Rekomendasi eksekusi |
| --- | --- | --- | --- | --- | --- |
| S | Panel `Perlu Ditindaklanjuti Hari Ini` di Dashboard/Kinerja Petugas | Sangat tinggi, karena pengguna langsung tahu petugas/wilayah mana yang harus dikejar hari ini | Hard change | Salah ranking bisa bikin prioritas lapangan keliru; perlu aturan scoring yang transparan | Mulai dari aturan sederhana: target hari ini terbesar, progress rendah, laporan terakhir lama, rejected FASIH tinggi |
| S | Data freshness global untuk Webmon dan FASIH | Sangat tinggi, karena monitoring sangat bergantung pada kepercayaan data | Medium-hard change | Timestamp berbeda sumber bisa membingungkan; perlu copy yang jelas | Tampilkan badge di topbar/dashboard: Webmon terakhir sinkron, FASIH scraped/imported, status segar/lama |
| S | Mode mobile/tablet untuk halaman padat data | Tinggi, terutama jika PML membuka dari HP | Hard change | Tabel lebar bisa pecah; banyak kolom penting harus dipilih ulang | Jangan memaksa semua tabel tampil penuh. Buat summary card + drilldown detail untuk layar kecil |
| A | Active filter chips di Dashboard, Kinerja, Wilayah Kerja, FASIH | Tinggi, mengurangi kebingungan saat data terlihat "hilang" karena filter aktif | Medium change | State filter tersebar di banyak view; perlu konsistensi reset | Buat helper render chip dari object filter, tampilkan di bawah panel filter, sertakan reset per chip dan reset semua |
| A | Table readability system: label jelas, tooltip header, sticky kolom kunci | Tinggi untuk pekerjaan monitoring berulang | Medium change | Terlalu banyak tooltip/kolom sticky bisa membuat tabel berat atau ramai | Prioritaskan kolom identitas, status, progress, sisa, aksi; ubah label teknis seperti `UNP`, `UTP`, `MuatanTotal` |
| A | Konfirmasi aksi yang lebih kontekstual | Tinggi untuk mencegah salah nonaktifkan/tandai selesai | Medium-small change | Modal terlalu panjang bisa memperlambat kerja | Di modal tampilkan nama petugas/wilayah/tanggal, dampak aksi, dan tombol utama yang spesifik |
| B | Empty state dan error state yang operasional | Sedang-tinggi, terutama saat data belum sinkron/import gagal | Small-medium change | Copy terlalu panjang bisa mengganggu tampilan | Tiap empty state beri sebab umum + langkah berikutnya, misalnya cek filter, sync data, atau import CSV |
| B | Legend status dan warna yang konsisten | Sedang, membuat arti warna lebih mudah diingat | Small-medium change | Warna terlalu banyak bisa kehilangan makna | Tetapkan satu arti warna lintas halaman: merah perhatian, amber berjalan/draft, hijau selesai/approved, biru info/submitted |
| B | Detail petugas/wilayah dalam drawer atau panel samping | Sedang, mengurangi scroll lompat saat melihat detail | Medium change | Butuh layout responsif dan focus management | Terapkan dulu di `Kinerja Petugas`, karena saat ini detail muncul di bawah dan pengguna bisa kehilangan konteks tabel |
| C | Microcopy polish pada label dan subtitle | Sedang, membuat aplikasi terasa lebih matang | Small change | Dampak terbatas jika masalah utama belum selesai | Rapikan istilah campuran: `Sign out`, `Download Excel`, `Target Seharusnya`, `Kum. Harian`, `Submit Pencacah` |
| C | Fokus keyboard dan aksesibilitas form/modal | Sedang, penting untuk kualitas dan pengguna power-user | Small-medium change | Perlu cek manual lintas modal dan menu | Pastikan Escape, focus return, visible focus, aria label, dan urutan tab nyaman |
| C | Preset tampilan tabel per role | Nice to have, membantu admin/viewer/PML melihat kolom relevan | Medium change | Jika preset salah, pengguna merasa kolom penting hilang | Mulai dari default berbeda tanpa menyembunyikan permanen; sediakan tombol tampilkan semua |

### Rencana Eksekusi Bertahap

#### Fase 0 - Quick Wins Rendah Risiko

Target: membuat UI terasa lebih jelas tanpa menyentuh logika data besar.

- Status: selesai tahap awal pada 27 Juni 2026. Tahap awal berisi perbaikan scroll, sticky header/kolom nomor, density mobile, dan kontrol pagination.
- Rapikan microcopy istilah campuran: `Keluar`, `Unduh Excel`, `Target Saat Ini`, dan label teknis yang lebih terbaca.
- Tambahkan empty state yang memberi langkah berikutnya.
- Tambahkan legend status warna sederhana di halaman yang paling padat.
- Perkuat modal konfirmasi dengan konteks data yang sedang diproses.
- Tambahkan tooltip untuk header tabel teknis.

Risiko: rendah. Perubahan mayoritas markup/copy/CSS, tetapi tetap perlu cek role admin, PML, dan viewer.

#### Fase 1 - Kejelasan Monitoring Harian

Target: pengguna langsung tahu kondisi data dan filter aktif.

- Status: selesai tahap awal pada 27 Juni 2026.
- Tambahkan badge freshness Webmon/FASIH.
- Tambahkan active filter chips lintas halaman utama.
- Perjelas status FASIH: scraped, imported, umur data, dan apakah snapshot masih layak dipakai.
- Tambahkan ringkasan `Rejected`, `Draft tinggi`, dan `Open tinggi` sebagai alarm monitoring.

Risiko: sedang. Perlu memastikan timestamp tersedia dari backend dan label tidak menyesatkan saat data kosong.

#### Fase 2 - Decision Panel

Target: dashboard berubah dari sekadar rekap menjadi alat ambil tindakan.

- Status: dilewati pada 27 Juni 2026 sesuai preferensi pengguna. Implementasi panel keputusan tidak dipakai.
- Buat panel `Perlu Ditindaklanjuti Hari Ini`.
- Definisikan skor prioritas awal:
  - target hari ini besar;
  - progress total rendah;
  - belum ada laporan terbaru;
  - status belum mulai;
  - rejected FASIH tinggi;
  - open/draft FASIH tinggi;
  - selisih progress Webmon dan FASIH mencolok;
  - snapshot FASIH sudah terlalu lama.
- Tampilkan alasan prioritas per baris, bukan hanya angka skor.
- Sediakan filter cepat: semua, Webmon, FASIH perlu review, data perlu diperbarui.

Risiko: tinggi. Ini menyentuh cara pengguna mengambil keputusan lapangan. Skoring harus mudah dijelaskan dan tidak menggantikan penilaian koordinator.

#### Fase 3 - Responsif dan Tabel Besar

Target: halaman tetap nyaman di HP/tablet dan data besar tidak terasa berat.

- Status: selesai tahap awal pada 27 Juni 2026.
- Buat tampilan mobile berupa card summary + detail expandable untuk tabel besar.
- Terapkan sticky kolom hanya pada desktop/tablet lebar.
- Pertimbangkan drawer detail petugas agar konteks tabel tidak hilang.
- Kurangi kolom default untuk layar kecil, lalu sediakan `Lihat detail`.

Risiko: tinggi. Banyak halaman memakai pola tabel yang mirip tetapi tidak identik, sehingga perubahan harus dilakukan bertahap per view.

### Checklist Validasi Setiap Fase

- Login sebagai admin, PML, dan viewer.
- Cek state tanpa data, data sedikit, dan data banyak.
- Cek filter aktif lalu refresh data.
- Cek tampilan desktop, tablet, dan HP.
- Cek aksi berisiko: nonaktifkan, edit, tandai selesai, import CSV.
- Pastikan informasi FASIH tetap dipisahkan dari progress Webmon agar sumber data tidak tercampur.

## Catatan Ide Berikutnya

Tambahkan perbaikan nomor 2, 3, 4, dan seterusnya di bawah bagian ini sebelum mulai eksekusi besar.
