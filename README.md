# Tugas 9 - Autentikasi & Otorisasi

## Identitas
- Nama: ADITYA
- NIM: F1D02310032
- Kasus ETS: Movies API

## Cara Menjalankan
Persyaratan: Node.js/npm dan MySQL (misalnya XAMPP).

1. Buat database MySQL `movies_db`.
2. Salin `.env.example` menjadi `.env`, lalu sesuaikan `DATABASE_URL`.
3. Buat secret JWT acak. Jalankan perintah ini dan salin hasilnya ke `JWT_SECRET` di `.env`:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
4. Pasang dependency dan terapkan migrasi:
   ```bash
   npm install
   npx prisma migrate dev
   npm run prisma:seed
   npm run dev
   ```
5. API berjalan di `http://localhost:3000`. Endpoint register membuat akun uji; tidak ada seeder pengguna.

Migrasi baru `20261125170000_add_users` hanya menambahkan tabel `users`; migrasi dan tabel ETS yang lama tidak diubah. Skema tabel yang sama dalam SQL:

```sql
CREATE TABLE `users` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(100) NOT NULL,
  `passwordHash` VARCHAR(255) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `users_email_key` (`email`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Jangan commit `.env` atau membagikan secret JWT. `.env.example` hanya berisi nilai contoh.

## Akun Uji
Buat akun ini sekali melalui `POST /auth/register` (atau ganti email jika sudah terdaftar). Kredensial berikut hanya untuk pengujian lokal dan bukan password akun pribadi.

| Email | Password |
|---|---|
| `aditya.f1d02310032@example.com` | `FilmTugas9!2026` |

## Struktur Proyek
```text
index.js                                  # [diubah] Mount auth dan cek konfigurasi secret
package.json                              # [diubah] Tambah bcrypt dan jsonwebtoken
.env.example                              # [diubah] Tambah JWT_SECRET contoh
controllers/authController.js             # [baru] Respons register, login, dan identitas
data/userData.js                          # [baru] Query user dengan kolom respons terpilih
middleware/auth.js                        # [baru] Verifikasi Bearer JWT pada route privat
middleware/errorHandler.js                # [tetap] Format error terpusat dari proyek ETS
prisma/schema.prisma                      # [diubah] Tambah model User
prisma/migrations/20261125170000_add_users/ # [baru] Migrasi users saja
routes/authRoutes.js                      # [baru] Endpoint autentikasi
routes/movieRoutes.js                     # [diubah] GET publik; operasi tulis wajib login
routes/genreRoutes.js                     # [tetap] Endpoint genre publik
routes/screeningRoutes.js                 # [diubah] Transaksi screening wajib login
services/authService.js                   # [baru] Hash password, login, dan penerbitan JWT
validators/authValidator.js               # [baru] Validasi Joi register dan login
requests.http                             # [diubah] Request tugas dan dua percobaan
README.md                                 # [diubah] Panduan tugas, endpoint, dan deklarasi AI
screenshot/                               # Bukti pengujian autentikasi dan tabel users
```

## Endpoint
| Method | URL | Akses | Status berhasil |
|---|---|---|---|
| POST | `/auth/register` | Publik | 201 |
| POST | `/auth/login` | Publik | 200 |
| GET | `/auth/saya` | Wajib login | 200 |
| GET | `/movies` | Publik | 200 |
| GET | `/movies/:id` | Publik | 200 |
| POST | `/movies` | Wajib login | 201 |
| PUT | `/movies/:id` | Wajib login | 200 |
| DELETE | `/movies/:id` | Wajib login | 204 |
| GET | `/genres` | Publik | 200 |
| GET | `/genres/:id` | Publik | 200 |
| POST | `/screenings` | Wajib login | 201 |

Register dan login memakai validasi Joi: email wajib valid dan maksimal 100 karakter; password wajib 8–72 karakter. Password di-hash memakai bcrypt cost 10. Login mengembalikan JWT berlaku 2 jam; kolom hash tidak dipilih untuk respons register maupun login.

Format kegagalan mengikuti `{ "error": { "pesan": "...", "kode": "..." } }`. Kode autentikasi yang digunakan: `VALIDATION_ERROR` (422), `EMAIL_DUPLIKAT` (409), `LOGIN_GAGAL` (401), `TOKEN_DIPERLUKAN` (401), dan `TOKEN_TIDAK_VALID` (401). Pesan login gagal untuk email tidak terdaftar dan password salah sama, yaitu “Email atau password salah”.

## Pengujian
Gunakan `requests.http` dengan ekstensi REST Client. Jalankan request Login sebelum request yang memakai token; `@token` diambil otomatis dari respons login. Pastikan tabel genre sudah terisi agar `genreId` pada contoh tersedia. Jangan menyimpan token aktif ke Git atau screenshot.

Hasil pengujian lokal:

| Pengujian | Status aktual |
|---|---|
| Register akun uji | 201 |
| Register akun yang sudah ada | 409 `EMAIL_DUPLIKAT` |
| Login kredensial benar | 200 berisi JWT |
| Login password salah | 401 `LOGIN_GAGAL` |
| Daftar film tanpa token | 200 |
| Tambah film tanpa token | 401 `TOKEN_DIPERLUKAN` |
| Tambah film dengan token valid | 201 |
| Payload JWT diganti tanpa secret | 401 `TOKEN_TIDAK_VALID` |
| JWT kedaluwarsa | 401 `TOKEN_TIDAK_VALID` |

Screenshot bukti yang saat ini tersedia di `screenshot/`:

| Bukti | File |
|---|---|
| Login berhasil (token tidak ditampilkan) | `login-berhasil.png` |
| Daftar film publik, 200 | `film-publik-200.png` |
| Tambah film tanpa token, 401 | `tambah-film-tanpa-token-401.png` |
| Tambah film dengan token, 201 | `tambah-film-dengan-token-201.png` |
| Daftar genre publik, 200 | `genre-publik-200.png` |
| Identitas dari token, 200 | `identitas-token-200.png` |
| Login gagal, 401 | `login-gagal-401.png` |
| Percobaan 1: token palsu, 401 | `percobaan-1-token-palsu-401.png` |
| Percobaan 2: token expired, 401 | `percobaan-2-token-expired-401.png` |
| Tabel `users` dan `passwordHash` di phpMyAdmin | `users-hash-phpmyadmin.png` |
| GET publik 200 dan POST tanpa token 401 berdampingan | `publik-200-dan-privat-401.png` |
| Request utama di `requests.http` dalam VS Code | `requests-http.png` |

Screenshot Percobaan 1 dan 2 menampilkan identitas/NIM, request, dan respons tanpa memperlihatkan JWT. Screenshot gabungan menunjukkan GET publik 200 dan POST tanpa token dengan kode `TOKEN_DIPERLUKAN`; screenshot `requests-http.png` memperlihatkan request login, daftar publik, dan tambah data di VS Code. Jangan tampilkan JWT aktif.

## Dua Percobaan
1. **Token dipalsukan:** token login lokal diubah pada payload (`id`) tanpa mengubah signature. Hasil uji `/auth/saya` adalah 401 `TOKEN_TIDAK_VALID`. Payload JWT dapat dibaca karena hanya Base64URL-encoded, tetapi signature yang lama tidak cocok dengan payload baru saat server memverifikasi token.
2. **Token expired:** `expiresIn` diubah sementara menjadi `'5s'`, API direstart, lalu token login diuji setelah menunggu 6,2 detik. Hasilnya 401 `TOKEN_TIDAK_VALID`. Setelah percobaan, `expiresIn` dikembalikan ke `'2h'` dan API direstart; server mengetahui masa berlaku dari klaim `exp` di token, sehingga tidak perlu menyimpan daftar token.

Hasil kedua percobaan telah diverifikasi terhadap API lokal. Screenshot di atas menampilkan request dan respons, sementara tokennya sengaja tidak ditampilkan.

## Deklarasi Penggunaan AI
| Bagian | Alat AI | Dipakai untuk apa | Cara saya memeriksa hasilnya |
|---|---|---|---|
| Autentikasi dan otorisasi | Copilot | Membantu menyusun dan meninjau alur register/login, bcrypt, JWT, middleware, serta pembagian route publik/privat | Uji register/login, endpoint publik dan privat, token palsu/expired; pastikan hash tidak ikut dalam respons |
| Konfigurasi database dan migrasi | Copilot | Membantu menyiapkan `.env`, migrasi `users`, dan memperbaiki seed agar memuat `.env` | Periksa status migrasi, jalankan seed, dan cek tabel `users` di MySQL/phpMyAdmin |
| `requests.http`, pengujian, dan dokumentasi | Copilot | Membantu mengatur token respons otomatis, menjelaskan skenario uji, memeriksa bukti, dan merapikan README | Cocokkan status/error HTTP dengan hasil REST Client dan pengujian lokal |

Contoh prompt yang benar-benar digunakan: “Atur `.env` dengan koneksi MySQL dan secret JWT acak, lalu jalankan migrasi serta uji endpoint register/login menggunakan database.”

Pernyataan: Saya menggunakan Copilot sebagai asisten AI pada bagian-bagian yang tercantum di tabel. Saya memeriksa hasilnya dengan migrasi, pengujian API lokal, REST Client, dan pemeriksaan screenshot. Tidak semua kode proyek ditulis oleh AI; bagian yang dibantu dan cara pemeriksaannya saya cantumkan di atas.

## Kesimpulan & Kendala
1. Password di-hash, bukan dienkripsi, karena hash satu arah cukup untuk membandingkan password saat login tanpa menyimpan bentuk aslinya; enkripsi dapat dibalik jika kunci bocor.
2. Pesan login gagal dibuat sama agar pihak lain tidak dapat mengetahui apakah suatu email terdaftar hanya dari respons login.
3. Halaman publik seperti daftar/detail film dapat dibuka tanpa akun, sedangkan pembuatan/perubahan/penghapusan data dan transaksi screening perlu token. Server tahu token sah dengan memverifikasi signature JWT memakai secret serta memeriksa masa berlaku `exp`, bukan dengan menyimpan token.
4. Kendala dan solusi: seed awal gagal membaca `DATABASE_URL`; `prisma/seed.js` diperbaiki agar memuat `.env`. Apache XAMPP tidak dapat memakai port 80 karena digunakan PID 4, sehingga Apache dijalankan pada port 8080 dan phpMyAdmin dibuka melalui `http://localhost:8080/phpmyadmin`. Port API 3000 juga sempat bentrok karena proses server lama masih berjalan; hentikan proses lama sebelum menjalankan server baru.
