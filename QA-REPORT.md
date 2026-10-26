# Laporan QA — LILI BELAJAR FINAL

Tanggal pemeriksaan: 26 Oktober 2026

## Cakupan materi
Materi diringkas dan ditulis ulang dari RPP yang diunggah. Cakupan: (1) penjumlahan sebagai penggabungan dua kelompok benda, simbol tambah dan sama dengan; (2) penggunaan kantong penjumlahan dan stik; (3) menghitung hasil penjumlahan sampai 20; (4) sifat pertukaran urutan bilangan; serta bantuan visual/penghitungan 1–10. Tiga halaman materi mengikuti tiga gugus isi tersebut. Reference ZIP digunakan untuk benchmark desain, UX, animasi, dan ketahanan halaman; materi SprintLab tidak disalin.

## Hasil pemeriksaan struktur
- 13 halaman HTML tersedia; `index.html` berada di root paket.
- Semua halaman memiliki tautan `style.css`, `bank-soal.js`, dan `app.js` dalam urutan yang benar.
- Semua halaman memiliki critical visibility fallback dan pesan `<noscript>`.
- Audit href/src lokal menemukan 0 path yang hilang.
- `node --check app.js` dan `node --check bank-soal.js` berhasil.
- Bank soal berisi 20 item. Setiap item memiliki pertanyaan, satu jawaban benar, tiga distraktor unik, kategori, pembahasan, serta rujukan remedial ke halaman materi yang tersedia.
- Tidak ditemukan teks TODO/lorem ipsum/soal dummy.

## Smoke test Chromium
Navigasi browser ke `localhost` maupun domain uji yang dirutekan diblokir kebijakan lingkungan dengan `ERR_BLOCKED_BY_ADMINISTRATOR`. Karena itu, pengujian render dilakukan menggunakan Chromium headless dengan konten HTML dan berkas CSS/JavaScript paket yang sama dipasang secara in-memory. Audit dependency relatif dilakukan terpisah. Ini bukan pengujian langsung pada GitHub Pages atau penyematan Google Sites.

Hasil pada lingkungan in-memory:
- JavaScript aktif: 13/13 halaman menampilkan judul utama, boot aplikasi sukses, dan tidak ada uncaught page error.
- JavaScript mati: 13/13 halaman tetap menampilkan judul utama dengan opacity terlihat serta pesan mode dasar.
- Simulasi `app.js` hilang: 13/13 halaman tetap terlihat; `js-ready` tidak ditambahkan.
- Interaksi apersepsi, aktivitas (kantong, tukar urutan, cocokkan benda), latihan 10 soal, game, evaluasi 10 soal, dan refleksi berhasil dijalankan.
- Game menyelesaikan 9 ronde, memperlihatkan skor akhir dan skor terbaik.
- Satu sesi evaluasi yang diamati menghasilkan distribusi slot benar A/B/C/D = 3/3/2/2 (selisih maksimum 1). Kunci jawaban tidak ditampilkan sebelum tes selesai. Distribusi diacak untuk setiap sesi.
- Layout diperiksa pada lebar 320, 390, 768, 1024, dan 1365 piksel; tidak ditemukan horizontal overflow.
- CSS mematuhi `prefers-reduced-motion`.

## Batas verifikasi
Penyimpanan progres, identitas, skor latihan, high score, hasil evaluasi, dan refleksi diimplementasikan menggunakan `localStorage` dengan fallback jika penyimpanan tidak tersedia. Persistensi antarhalaman/reload pada origin HTTP(S) nyata tidak dapat diuji secara independen karena navigasi browser ke URL tersebut diblokir oleh lingkungan. Verifikasi langsung pada GitHub Pages dan Google Sites tetap perlu dilakukan setelah deploy.
