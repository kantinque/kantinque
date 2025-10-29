KantinQue
=========

Proyek website statis untuk menampilkan informasi produk KantinQue dan hasil validasi pengguna.

Struktur
--------

- `index.html` – Halaman utama
- `assets/css/styles.css` – Gaya dan layout responsif
- `assets/js/app.js` – Interaktivitas ringan (smooth scroll, animasi skor, tahun footer)

Menjalankan Secara Lokal
------------------------

Karena ini situs statis, Anda cukup buka `index.html` langsung di browser:

1. Buka folder proyek `KantinQue`.
2. Klik dua kali `index.html`, atau
3. Jalankan server lokal (opsional), contoh PowerShell:

   - Python 3:
     ```powershell
     python -m http.server 8080
     # lalu buka http://localhost:8080
     ```

   - Node.js (npx serve):
     ```powershell
     npx --yes serve . -l 8080
     # lalu buka http://localhost:8080
     ```

Konten Validasi
---------------

- Responden: 5 mahasiswa aktif Universitas Islam Nahdlatul Ulama Jepara
- Metode: Wawancara dan uji coba prototype (tampilan interaktif Canva)
- Hasil:
  - Tampilan Aplikasi: 4,6/5 – Desain menarik, mudah dipahami
  - Kemudahan Pemesanan: 4,8/5 – Menu dan checkout mudah digunakan
  - Kecepatan Akses: 4,4/5 – Perlu optimasi kecepatan loading
  - Metode Pembayaran: 4,7/5 – Integrasi QRIS efisien dan modern
  - Potensi Penggunaan Nyata: 4,9/5 – Seluruh responden ingin menggunakan jika tersedia

Lisensi
-------

Hak cipta © KantinQue. Seluruh hak dilindungi.

