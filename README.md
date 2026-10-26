# LILI BELAJAR — Matematika Penjumlahan 1–20

Media pembelajaran interaktif berbasis HTML, CSS, dan JavaScript vanilla untuk kelas 6 SDLB/B, SLB Negeri 1 Yogyakarta. Disusun oleh Lili Mariyani (2027).

## Cara membuka
- Buka `index.html` untuk memulai.
- Untuk pengalaman terbaik, jalankan folder ini melalui web server statis atau unggah seluruh isi folder ke repository GitHub Pages.
- `index.html` berada di root. Tidak ada proses build, framework, atau backend.
- Video menggunakan tautan yang diberikan guru; jika embed tidak tersedia, pilih **Buka di YouTube**.

## Halaman
`index.html`, `profil.html`, `apersepsi.html`, `materi-1.html`, `materi-2.html`, `materi-3.html`, `video.html`, `aktivitas.html`, `latihan.html`, `game.html`, `evaluasi.html`, `refleksi.html`, `selesai.html`.

## Berkas utama
- `style.css` — design system responsif biru-putih, animasi ringan, dan dukungan reduced motion.
- `bank-soal.js` — bank 20 soal; setiap soal memiliki 1 jawaban benar, 3 distraktor, kategori, pembahasan, dan rujukan halaman materi.
- `bank-soal.json` — salinan bank soal dalam format yang mudah diedit guru.
- `app.js` — navigasi, aktivitas, latihan 10 soal, game 3 level, evaluasi 10 soal acak, refleksi, penyimpanan progres, dan hasil.

## Evaluasi
- KKM: 75.
- 10 soal diambil acak dari 20 butir; urutan soal dan distraktor diacak.
- Slot jawaban benar A/B/C/D dibuat seimbang (untuk 10 soal: distribusi 3,3,2,2 dalam urutan acak).
- Nilai dihitung dari jumlah benar × 10. Jawaban dan pembahasan ditampilkan setelah tes selesai.
- Hasil, percobaan, skor latihan, high score game, progres, dan refleksi disimpan di `localStorage` browser/perangkat. Tidak ada data yang dikirim ke server.
- Tombol **Cetak / Simpan PDF** membuka dialog cetak browser; pilih **Save as PDF / Simpan sebagai PDF**.

## Sumber dan cakupan
Materi ditulis ulang dari `RPP Kls 6 per-1 SDLB_ SLB N1 YK.pdf` yang diunggah: pengertian penjumlahan sebagai menggabungkan dua kelompok, penggunaan stik/kantong penjumlahan, penjumlahan dengan hasil sampai 20, sifat pertukaran, penggunaan gambar benda, dan dukungan bertahap pada rentang 1–10. Reference website ZIP dipakai hanya sebagai benchmark desain/UX dan ketahanan halaman, bukan sebagai sumber materi.

## Mode tanpa JavaScript
Isi materi, contoh statis, caption visual, tautan navigasi, dan tujuan halaman berada langsung dalam HTML. `app.js` hanya menambahkan interaksi. Setiap halaman mempunyai critical visibility fallback dan pesan `<noscript>`; fitur interaktif tidak berjalan jika JavaScript mati, tetapi halaman materi tetap terbaca.

## Branding
Dibuat menggunakan Reference Pack PK UNY × SPENSABA 2026.
