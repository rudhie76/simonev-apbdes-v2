# MATERI SOSIALISASI & MANUAL OPERASIONAL
## SIMONEV APBDes Kecamatan Waru (Tahun Anggaran 2026)
*Sistem Informasi Monitoring dan Evaluasi Anggaran Pendapatan dan Belanja Desa Terintegrasi*

Dokumen ini disusun untuk memudahkan pelaksanaan **Sosialisasi, Bimbingan Teknis (Bimtek), dan Serah Terima Operasional** aplikasi Simonev APBDes Kecamatan Waru kepada berbagai pemangku kepentingan (*stakeholders*).

---

## 📅 BAGIAN 1: RANCANGAN SLIDE PRESENTASI (Kecamatan & Desa)
*Gunakan struktur slide ini untuk menyusun file PowerPoint (PPTX) atau Google Slides.*

### Slide 1: Cover Utama
- **Judul:** Transformasi Tata Kelola Keuangan dan Fisik Desa: Implementasi Aplikasi **Simonev APBDes Kecamatan Waru TA 2026**
- **Subjudul:** Transparansi, Akuntabilitas, dan Efisiensi Monitoring Evaluasi APBDes secara Real-Time.
- **Visual Pendukung:** Logo Kabupaten Penajam Paser Utara, Tanggal Sosialisasi, dan tagline *"Sistem Tata Kelola Keuangan dan Fisik Desa Transparan"*.

### Slide 2: Latar Belakang & Masalah Utama
*Mengapa kita membutuhkan aplikasi ini?*
1. **Verifikasi Manual Lambat:** Proses verifikasi berkas permohonan rekomendasi pencairan APBDes memakan waktu dan berulang-ulang.
2. **Keterbatasan Fisik & Jarak:** Monitoring lapangan sulit dipantau secara langsung setiap saat oleh tim verifikator Kecamatan.
3. **Risiko Ketidaksesuaian Anggaran:** Perbedaan data antara laporan realisasi fisik di lapangan dengan data keuangan Siskeudes.
4. **Tuntutan Transparansi Publik:** Masyarakat memerlukan wadah pengaduan dan akses informasi pembangunan desa yang mudah diakses.

### Slide 3: Definisi & Solusi Aplikasi (Simonev APBDes)
*Apa itu Simonev APBDes?*
Aplikasi monitoring dan evaluasi berbasis web terintegrasi yang dirancang khusus untuk mempermudah koordinasi antara **Pemerintah Desa** (Operator Desa) dan **Pemerintah Kecamatan** (Tim Verifikasi PMD) guna mengawal realisasi pembangunan desa.
- **Tiga Desa Percontohan:** Bangun Mulya, Sesulu, dan Api-api.
- **Dual Mode (Blended/Hybrid):** Berjalan dengan sinkronisasi online real-time maupun luring (offline fallback) otomatis jika kualitas sinyal lemah.

### Slide 4: Fitur Unggulan Sistem
1. **Interactive Dashboard:** Statistik penyerapan dana, grafik perbandingan fisik vs keuangan, sisa pagu, dan status kelayakan kegiatan.
2. **Operator Desa Workspace:** Formulir input progres (0%, 30%, 50%, 100%), unggah foto fisik lapangan, rincian biaya, dan koordinat.
3. **Kecamatan Verifikator Workspace:** Portal penilaian kelayakan, input catatan koreksi/perbaikan, dan tombol persetujuan digital (ACC).
4. **Digital Certification:** Penerbitan Surat Verifikasi Lapangan otomatis dengan QR-Code Pengesahan Elektronik (PDF).
5. **Portal Integrasi Siskeudes:** Sinkronisasi pagu definitif APBDes (DD, ADD, PAD).
6. **Portal Pengaduan Warga:** Saluran aduan foto dan deskripsi penyimpangan fisik lapangan oleh masyarakat setempat (*social control*).

### Slide 5: Diagram Alir Alur Kerja (Workflow) Aplikasi
```
[ Operator Desa ]
Menyusun Kegiatan -> Input Biaya -> Unggah Foto Fisik (0%-100%) -> Kirim Laporan ke Kecamatan
       │
       ▼
[ Tim Verifikasi PMD Kecamatan ]
Menerima Notifikasi -> Evaluasi Lapangan -> Beri Catatan / Rekomendasi -> Setujui (ACC Digital)
       │
       ├─► REKOMENDASI PERBAIKAN: Dikembalikan ke Operator Desa (Progres Ditangguhkan)
       │
       └─► DISETUJUI (ACC): Aplikasi Otomatis Menerbitkan Surat Verifikasi Lapangan (PDF)
```

### Slide 6: Peran & Akses Pengguna (Role Matrix)
- **1. Publik / Warga Desa (Tanpa Log-In)**
  - Melihat dashboard transparansi realisasi per desa.
  - Mengirim aduan/laporan fisik pembangunan di lapangan disertai bukti foto.
- **2. Operator Desa (Input Anggaran & Progres)**
  - Menambahkan kegiatan berdasarkan Bidang (Penyelenggaraan Pemerintahan, Pembangunan, Pembinaan Kemasyarakatan, dll).
  - Melaporkan perkembangan fisik (unggah foto asli lapangan dan laporan penyerapan dana).
- **3. Verifikator Kecamatan PMD (Akses Khusus Verifikasi)**
  - Mengevaluasi kesesuaian fisik dan anggaran belanja kegiatan desa.
  - Memutuskan status: *Disetujui*, *Butuh Perbaikan*, atau *Ditolak*.
  - Menandatangani berkas rekomendasi secara digital (*Digital Signature Seal*).

### Slide 7: Keunggulan bagi Pemerintah Desa
- **Efisiensi Waktu:** Pengiriman proposal monitoring dan laporan realisasi fisik cukup dilakukan secara online melalui browser.
- **Satu Sumber Data:** Mengurangi kekeliruan administrasi pencocokan pagu belanja desa karena pagu telah tersinkronisasi di portal Siskeudes aplikasi.
- **Dokumentasi Terstruktur:** Dokumentasi foto perkembangan fisik (0%, 30%, 50%, 100%) tertata dengan rapi pada setiap sub-kegiatan.

### Slide 8: Keunggulan bagi Camat & Tim PMD Kecamatan
- **Pengambilan Keputusan Berbasis Data (Data-Driven):** Camat bisa memantau desa mana yang penyerapan anggarannya lambat melalui grafik dashboard utama.
- **Arsip Digital Tersentralisasi:** Surat Verifikasi Lapangan dapat dicetak sewaktu-waktu dan memiliki kode verifikasi digital yang aman dari manipulasi.
- **Verifikasi Lapangan Akurat:** Foto lokasi pembangunan disimpan lengkap dengan deskripsi, tanggal, dan nilai realisasi.

---

## 📖 BAGIAN 2: MANUAL OPERASIONAL PENGGUNA (USER GUIDE)
*Panduan taktis langkah-demi-langkah pengoperasian aplikasi.*

### 🛠️ PANDUAN 1: OPERATOR DESA (Mendaftarkan & Melaporkan Kegiatan)
1. **Akses Dashboard Utama:** Buka aplikasi Simonev APBDes Kecamatan Waru.
2. **Pilih Peran:** Pada bar bagian atas, ganti pilihan peran menjadi **Operator Desa**.
3. **Pilih Nama Desa:** Tentukan wilayah desa Anda (contoh: *Bangun Mulya*).
4. **Tambah Kegiatan Baru (Jika Belum Ada):**
   - Klik tombol **"+ Tambah Kegiatan Baru"**.
   - Isi informasi nama kegiatan (contoh: *Pembangunan Jembatan Beton RT 04*).
   - Pilih Tahun Anggaran (2026), Bidang, Jenis Anggaran, Lokasi, Volume, dan Estimasi Biaya.
   - Klik **"Simpan & Publikasikan"**.
5. **Perbarui Progres Keuangan & Fisik (Masa Pelaksanaan):**
   - Cari kegiatan yang sedang berjalan, klik **"Kelola"** atau **"Detail"**.
   - Input **Realisasi Anggaran** yang telah digunakan.
   - Upload dokumentasi foto lapangan sesuai tahapan progres fisik (**0%**, **30%**, **50%**, atau **100%**).
   - Klik **"Kirim Laporan untuk Evaluasi Lapangan"** jika progres fisik telah mencapai target.

### 📝 PANDUAN 2: VERIFIKATOR KECAMATAN PMD (Mengevaluasi & ACC Digital)
1. **Masuk ke Portal Verifikator:**
   - Ubah pilihan peran di pojok kanan atas menjadi **Kecamatan (PMD)**.
   - Masukkan PIN / Sandi otentikasi tim verifikator Kecamatan.
2. **Pengecekan Berkas Berjalan:**
   - Navigasi ke tab **Evaluasi Kecamatan**.
   - Sistem akan memfilter daftar laporan pembangunan desa yang bersatus **"Menunggu Evaluasi"** (*Waiting Evaluation*).
3. **Melakukan Penilaian (Verifikasi Fisik & Anggaran):**
   - Klik tombol **"Evaluasi Sekarang"** pada kegiatan desa yang ingin diperiksa.
   - Periksa rincian target, akumulasi realisasi biaya, kesesuaian progres fisik, dan foto dokumen pendukung.
4. **Pengambilan Keputusan (ACC / Koreksi):**
   - Isi kolom **Catatan Rekomendasi Lapangan** (tulis saran spesifik untuk desa).
   - Klik **"Berikan Persetujuan (ACC Lapangan)"** jika laporan sudah valid dan layak disetujui.
   - Klik **"Minta Perbaikan / Revisi"** jika fisik atau berkas belum sesuai.
5. **Pencetakan Surat Hasil Verifikasi:**
   - Pada kegiatan yang berstatus **Disetujui (ACC)**, klik tombol **"Cetak Berkas Rekomendasi"**.
   - Dokumen pdf berformat Surat Verifikasi Dinas PMD bermaterai digital siap dicetak atau diunduh untuk lampiran pencairan anggaran.

### 👥 PANDUAN 3: PORTAL WARGA (Pengaduan & Transparansi Publik)
1. **Akses Publik:** Warga tidak perlu memiliki akun log-in, cukup pilih peran **Publik / Warga Warga**.
2. **Pantau Transparansi Desa:** 
   - Gunakan tab **Portal Warga** untuk melihat daftar proyek fisik yang sedang berjalan lengkap dengan anggaran dan foto terunggah.
3. **Kirim Laporan Temuan Lapangan:**
   - Jika masyarakat menemukan ketidaksesuaian spek proyek di lapangan, klik **"Laporkan Temuan Lapangan"**.
   - Isi form nama pelapor, pilih desa, pilih kegiatan yang diadukan, isi uraian ketidaksesuaian, dan lampirkan foto fisik asli di lapangan.
   - Aduan ini akan langsung masuk ke log notifikasi sistem dan dapat dibaca oleh tim Kecamatan PMD.

---

## 📈 BAGIAN 3: RENCANA IMPLEMENTASI, ROLLOUT & SINKRONISASI
*Tiga fase rujukan untuk kelancaran adopsi sistem baru di Kecamatan Waru.*

| Fase | Waktu | Kegiatan Utama | Keterlibatan Pihak | Target Hasil |
| :--- | :--- | :--- | :--- | :--- |
| **Fase 1: Persiapan & Sosialisasi Awal** | Minggu ke-1 | Sosialisasi konsep aplikasi, koordinasi pembagian akun/PIN kecamatan, dan penyelarasan data Siskeudes awal. | Camat, Kasi PMD, Kepala Desa (Kades). | Terpilihnya Operator Desa resmi di 3 Desa (Bangun Mulya, Sesulu, Api-api). |
| **Fase 2: Bimbingan Teknis (Bimtek)** | Minggu ke-2 | Pelatihan praktis (*hands-on workshop*) penggunaan aplikasi kepada seluruh Operator Desa dan staf PMD Kecamatan. | Tim IT/Penyusun Aplikasi, Operator Desa, Verifikator PMD. | Seluruh operator dan verifikator mampu menginput kegiatan dan menandatangani rekomendasi digital. |
| **Fase 3: Implementasi Penuh & Evaluasi** | Minggu ke-3 dst. | Uji coba pengiriman laporan fisik 0%-100% dan pencetakan Surat Verifikasi fisik secara real di lapangan untuk dasar pencairan dana tahap berikutnya. | Operator Desa, Tim Verifikasi Kecamatan, Publik. | Pengurangan tumpukan berkas cetak (*paperless*) hingga 80% dan verifikasi lapangan yang akurat. |

---

> **Simonev APBDes Kecamatan Waru 2026**
> *Mewujudkan Desa Mandiri, Transparan, dan Akuntabel demi Kesejahteraan Masyarakat Penajam Paser Utara.*
