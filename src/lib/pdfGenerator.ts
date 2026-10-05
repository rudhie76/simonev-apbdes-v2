/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from 'jspdf';

/**
 * Generates and downloads a beautifully styled Operator and Verifier Manual PDF
 * for Simonev APBDes Kecamatan Waru.
 */
export function generateOperatorManualPDF() {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageHeight = 297;
  const pageWidth = 210;
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2); // 170mm
  let currentPage = 1;
  let y = 30;

  // Primary Theme Colors (Deep Slate, Blue, Emerald and Accents)
  const colors = {
    primary: [15, 23, 42],      // Slate 900
    secondary: [37, 99, 235],   // Blue 600
    accent: [16, 185, 129],     // Emerald 500
    darkGray: [71, 85, 105],    // Cool Gray 600
    lightGray: [248, 250, 252], // Slate 50
    border: [226, 232, 240],    // Slate 200
  };

  // Helper: Draw standard page header and footer
  const drawHeaderFooter = (pageNum: number) => {
    if (pageNum === 1) return; // Skip cover page header/footer

    // Header
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(colors.darkGray[0], colors.darkGray[1], colors.darkGray[2]);
    doc.text('SIMONEV APBDES KECAMATAN WARU - PANDUAN OPERATOR', margin, 12);
    doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
    doc.setLineWidth(0.3);
    doc.line(margin, 14, pageWidth - margin, 14);

    // Footer
    doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
    doc.text(`Kecamatan Waru • Kabupaten Penajam Paser Utara`, margin, pageHeight - 10);
    doc.text(`Halaman ${pageNum}`, pageWidth - margin - 20, pageHeight - 10);
  };

  // Helper: Add title/header on a new page
  const addNewPage = () => {
    doc.addPage();
    currentPage++;
    y = 25;
    drawHeaderFooter(currentPage);
  };

  // Helper: Ensure y space remains, else advance to next page
  const requireSpace = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 25) {
      addNewPage();
    }
  };

  // Helper: Reset text formatting
  const resetText = () => {
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85); // Slate 700
  };

  // Helper: Write a block of paragraph text with wrapping
  const writeParagraph = (text: string, spaceAfter = 6) => {
    resetText();
    const splitText = doc.splitTextToSize(text, contentWidth);
    const textHeight = splitText.length * 5;
    requireSpace(textHeight + spaceAfter);
    doc.text(splitText, margin, y);
    y += textHeight + spaceAfter;
  };

  // Helper: Write a large heading
  const writeHeading1 = (text: string, spaceBefore = 8, spaceAfter = 6) => {
    requireSpace(18 + spaceBefore + spaceAfter);
    y += spaceBefore;
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.text(text, margin, y);
    y += 5;
    doc.setDrawColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
    doc.setLineWidth(0.8);
    doc.line(margin, y, margin + 25, y);
    y += spaceAfter + 3;
    resetText();
  };

  // Helper: Write a sub-heading
  const writeHeading2 = (text: string, spaceBefore = 6, spaceAfter = 4) => {
    requireSpace(12 + spaceBefore + spaceAfter);
    y += spaceBefore;
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
    doc.text(text, margin, y);
    y += spaceAfter + 2;
    resetText();
  };

  // Helper: Write a bullet items list
  const writeBulletList = (items: string[], spaceAfter = 6) => {
    items.forEach(item => {
      resetText();
      const splitItem = doc.splitTextToSize(`•  ${item}`, contentWidth - 4);
      const textHeight = splitItem.length * 5;
      requireSpace(textHeight + 2);
      doc.text(splitItem, margin, y);
      y += textHeight + 2;
    });
    y += spaceAfter;
  };

  // Helper: Draw a gorgeous styled box for information/warnings
  const writeAlertBox = (title: string, body: string, type: 'info' | 'success' | 'warning', spaceAfter = 6) => {
    const boxColor = type === 'info' ? colors.secondary : type === 'success' ? colors.accent : [225, 29, 72]; // Rose 600
    const bgColor = type === 'info' ? [239, 246, 255] : type === 'success' ? [240, 253, 250] : [255, 241, 242]; // Light tints
    
    const splitBody = doc.splitTextToSize(body, contentWidth - 10);
    const boxHeight = 12 + (splitBody.length * 5);

    requireSpace(boxHeight + spaceAfter);

    // Fill background
    doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
    doc.rect(margin, y, contentWidth, boxHeight, 'F');

    // Draw left border strip
    doc.setFillColor(boxColor[0], boxColor[1], boxColor[2]);
    doc.rect(margin, y, 1.5, boxHeight, 'F');

    // Title
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.text(title, margin + 5, y += 6);

    // Body
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(splitBody, margin + 5, y += 5);

    y += (splitBody.length * 5) - 3 + spaceAfter;
    resetText();
  };


  // ==========================================
  // PAGE 1: COVER PAGE
  // ==========================================
  
  // Upper Banner
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.rect(0, 0, pageWidth, 90, 'F');

  // Decorative Accent Block
  doc.setFillColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
  doc.rect(0, 88, pageWidth, 4, 'F');

  // App Logo/Badge (vector drawing)
  doc.setFillColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
  doc.rect(20, 30, 16, 16, 'F');
  doc.setFillColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('M', 25, 41);

  // App Metadata Cover Text
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(191, 219, 254); // Blue 200
  doc.text('SISTEM MONITORING & EVALUASI APBDES', 42, 35);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('SIMONEV KECAMATAN WARU', 42, 43);

  // Cover Main Section Title
  y = 115;
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  const coverTitle = 'PANDUAN RESMI OPERATOR';
  doc.text(coverTitle, margin, y);
  
  y += 10;
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
  doc.text('TATA KELOLA REALISASI APBDES 100%', margin, y);

  y += 15;
  // Subtitle / Intro text on Cover
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(colors.darkGray[0], colors.darkGray[1], colors.darkGray[2]);
  const introLines = doc.splitTextToSize(
    'Buku panduan operasional ini disusun secara komprehensif untuk membantu Operator Desa (Desa Bangun Mulya, Desa Sesulu, Desa Api-api) dan Verifikator Tim Pemberdayaan Masyarakat Desa (PMD) Kecamatan Waru dalam mengelola usulan kegiatan dan evaluasi berkas pertanggungjawaban APBDes Tahun Anggaran Multi-Year (2024 - 2028).',
    contentWidth
  );
  doc.text(introLines, margin, y);

  y += 35;
  // Metadata Details Card
  doc.setFillColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
  doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
  doc.setLineWidth(0.4);
  doc.rect(margin, y, contentWidth, 52, 'FD');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text('DETIL DOKUMEN:', margin + 6, y += 6);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('•  Nama Aplikasi:  Sistem Simonev APBDes Terintegrasi', margin + 6, y += 6);
  doc.text('•  Target Pengguna: Operator Desa (Pemerintahan Desa) & Tim Verifikasi Kecamatan', margin + 6, y += 5);
  doc.text('•  Wilayah Layanan:  Kecamatan Waru, Kabupaten Penajam Paser Utara', margin + 6, y += 5);
  doc.text('•  Penerbit Dokumen: Seksi Pemberdayaan Masyarakat Desa (PMD) Kecamatan Waru', margin + 6, y += 5);
  doc.text('•  Sandi Integritas:  Terenkripsi Digital - Sah Secara Elektronik', margin + 6, y += 5);
  doc.text('•  Versi Sistem:      v10.4.26 (Edisi Pembersihan Cloud Firestore)', margin + 6, y += 5);

  // Footer Cover
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text('Diterbitkan pada Juni 2026', margin, pageHeight - 20);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(colors.darkGray[0], colors.darkGray[1], colors.darkGray[2]);
  doc.text('Layanan IT PMD Kec. Waru • Kab. Penajam Paser Utara © 2026', margin, pageHeight - 15);


  // ==========================================
  // PAGE 2: PENDAHULUAN & KREDENSIAL AKSES
  // ==========================================
  addNewPage();

  writeHeading1('BAB I - PENDAHULUAN & ALUR KERJA');

  writeParagraph(
    'Aplikasi Simonev APBDes Kecamatan Waru dirancang khusus untuk memfasilitasi monitoring pembangunan desa, transparansi penyerapan anggaran, dan akuntabilitas realisasi lapangan. Warga masyarakat dapat mengakses dasbor publik secara bebas, sedangkan petugas operator dilindungi oleh sistem otorisasi.'
  );

  writeHeading2('1.1 Alur Pelaporan dan Verifikasi Kegiatan 100%');
  
  writeParagraph(
    'Alur pelaporan mengikuti standar administrasi kerja terpadu antara desa dengan pihak kecamatan:'
  );

  writeBulletList([
    'Tahap 1 - Usulan Baru: Operator Desa menginput detail usulan rencana kegiatan yang bersumber dari APBDes ke dalam sistem (Pagu, Sektor, dsb).',
    'Tahap 2 - Update Progres Secara Berkala: Seiring mobilisasi pembangunan di lapangan, Operator Desa wajib memperbarui target serapan anggaran dan realisasi progress fisik (%) secara berkala.',
    'Tahap 3 - Pengajuan Evaluasi: Ketika pekerjaan fisik telah rampung 100% dan berkas SPJ siap, operator desa mengunggah foto bukti serta berkas laporan, lalu status otomatis beralih ke "MENUNGGU_EVALUASI".',
    'Tahap 4 - Evaluasi Kecamatan (ACC & TTD): Tim PMD/Camat memeriksa berkas dan foto. Jika disetujui, Kecamatan akan melakukan ACC dan memberikan digital signature. Status kegiatan resmi berubah menjadi "SELESAI".'
  ]);

  writeHeading2('1.2 Kredensial Resmi Akun Operator Aktif');
  
  writeParagraph(
    'Hak akses administrator dibatasi berdasarkan kewenangan instansi masing-masing. Berikut adalah daftar username dan kata sandi operasional resmi yang sah:'
  );

  // Draw credentials table
  const colWidths = [45, 60, 65];
  const tableHeaders = ['Institusi Peran', 'Kredensial Username', 'Kata Sandi / Password'];
  const tableRows = [
    ['Desa Bangun Mulya', 'ops.bangunmulya', 'bangunmulya2026'],
    ['Desa Sesulu', 'ops.sesulu', 'sesulu2026'],
    ['Desa Api-api', 'ops.apiapi', 'apiapi2026'],
    ['Kecamatan Waru', 'ops.kecamatan', 'kecamatanwaru2026']
  ];

  requireSpace(35);
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.rect(margin, y, contentWidth, 7, 'F');
  
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  let curX = margin;
  tableHeaders.forEach((header, i) => {
    doc.text(header, curX + 3, y + 4.8);
    curX += colWidths[i];
  });
  
  y += 7;
  
  tableRows.forEach((row, rIdx) => {
    requireSpace(7);
    if (rIdx % 2 === 0) {
      doc.setFillColor(241, 245, 249);
    } else {
      doc.setFillColor(255, 255, 255);
    }
    doc.rect(margin, y, contentWidth, 7, 'F');
    doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
    doc.rect(margin, y, contentWidth, 7, 'S');

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    
    curX = margin;
    row.forEach((cell, cIdx) => {
      if (cIdx === 0) {
        doc.setFont('Helvetica', 'bold');
      } else {
        doc.setFont('Courier', 'bold');
      }
      doc.text(cell, curX + 3, y + 4.8);
      curX += colWidths[cIdx];
    });
    y += 7;
  });

  y += 5;
  writeAlertBox(
    'PERINGATAN PENTING KEAMANAN',
    'Mohon menjaga kerahasiaan kata sandi operator di atas. Jangan bagikan kredensial di luar instansi pemerintahan desa untuk mencegah pemalsuan pelaporan fisik yang melanggar ketentuan perundang-undangan.',
    'warning'
  );


  // ==========================================
  // PAGE 3: PANDUAN JALAN KERJA OPERATOR DESA
  // ==========================================
  addNewPage();

  writeHeading1('BAB II - PETUNJUK OPERATOR DESA');

  writeParagraph(
    'Petugas Operator Desa bertanggung jawab penuh atas kebenaran, ketepatan, dan keaktifan data realisasi yang disajikan di aplikasi. Seluruh aktivitas desa dikelola melalui instrumen kerja "Input Kegiatan Desa".'
  );

  writeHeading2('2.1 Langkah Melakukan Pendaftaran Usulan Baru');
  writeBulletList([
    'Pilih Peran Desa Anda di halaman Login Portal, isi Username dan Kata Sandi sesuai tabel bab sebelumnya, lalu masuk ke sistem.',
    'Klik Menu Utama "Input Kegiatan Desa". Halaman ini hanya terbuka sesudah login berhasil.',
    'Klik Tombol "+ Daftarkan Usulan Baru" di sudut kanan atas.',
    'Isi formulir dengan data yang sah: Nama Program Kerja, Sektor Bidang, Pagu Dana (dalam Rupiah), Realisasi SPJ (awal), dan Progres Fisik Lapangan (awal).',
    'Unggah Foto Bukti Awal Lapangan dan nama Laporan Syarat Pendukung jika tersedia.',
    'Klik tombol "Simpan Usulan". Program akan didaftarkan ke cloud secara otomatis dan tercantum di dasbor utama.'
  ]);

  writeHeading2('2.2 Memperbarui Realisasi Progres Fisik ke 100%');
  writeParagraph(
    'Secara berkala (misal tiap pekan atau bulan), operator harus meng-update capaian terbaru dengan menekan tombol "Edit Realisasi" di sebelah kanan item kegiatan.'
  );

  writeBulletList([
    'Isi field Realisasi SPJ terbaru seiring pencairan dana yang dipertanggungjawabkan.',
    'Perbarui slider Persentase Fisik (%) sesuai progress riil di lapangan.',
    'WAJIB ISI ALASAN BELUM RAMPUNG: Untuk setiap kegiatan dengan progres fisik di bawah 100%, pengisian kolom "Alasan Kegiatan Belum Rampung" bersifat wajib/mandatory. Jika dikosongkan, sistem akan menghentikan penyimpanan dan menampilkan peringatan: "Isi alasan Belum Rampung dan Jika sudah Rampung".',
    'PANDUAN 100%: Apabila realisasi fisik telah mencapai 100%, status secara otomatis disetel sistem menjadi "MENUNGGU_EVALUASI". Pekerjaan dianggap siap ditinjau secara digital oleh Kecamatan.',
    'Unggah foto dokumentasi bukti fisik 100% sebagai laporan purnarupa.',
    'Cantumkan bukti berkas pendukung dalam laporan pengajuan.'
  ]);

  writeAlertBox(
    'FITUR PROTEKSI KORUPSI DAN DATA UNDEFINED',
    'Sistem telah ditingkatkan dengan fungsi "cleanForFirestore()". Fitur ini secara otomatis menyaring nilai kosong/undefined sebelum diunggah ke database utama, menjamin penyimpanan 100% aman dan bebas crash saat operator memasukkan data baru.',
    'success'
  );


  // ==========================================
  // PAGE 4: PANDUAN TIM EVALUATOR KECAMATAN
  // ==========================================
  addNewPage();

  writeHeading1('BAB III - PETUNJUK VERIFIKATOR KECAMATAN');

  writeParagraph(
    'Operator / Verifikator Kecamatan Waru (Kewenangan Seksi Pemerintahan / PMD) bertugas mengawasi jalannya penyerapan dana dari tiap-tiap desa, mengevaluasi kendala pembangunan, serta memberikan rekomendasi resmi dan persetujuan (ACC).'
  );

  writeHeading2('3.1 Langkah Mengevaluasi Berkas Usulan Desa');
  writeBulletList([
    'Buka aplikasi dan login menggunakan peran "Kecamatan Waru" dengan kredensial yang sah.',
    'Beralih ke tab menu "Evaluasi Kecamatan" di bagian kiri aplikasi.',
    'Gunakan filter desa atau pencarian jika ingin membatasi tampilan wilayah desa tertentu.',
    'Tab sub-menu terbagi dua: \n  a. "Menunggu Evaluasi" (rencana baru atau rampung belum tervalidasi)\n  b. "Telah Disetujui (ACC)" (Daftar laporan 100% bertanda tangan digital Kecamatan).'
  ]);

  writeHeading2('3.2 Cara Memberikan ACC, Rekomendasi Ter-TTD 100%');
  writeParagraph(
    'Setiap dokumen pengajuan dari desa harus diperiksa kevalidannya. Berikut langkah melakukan verifikasi akhir:'
  );

  writeBulletList([
    'Klik ikon Mata / "Detail" untuk membuka berkas, meninjau rincian biaya, dan meneliti legalitas foto fisik lapangannya.',
    'Jika berkas belum sesuai: Isi box masukan rekomendasi, lalu klik "Kirim Catatan Evaluasi". Status usulan di desa akan bergeser kembali ke "Dalam Proses" dan memuat instruksi revisi Anda.',
    'Jika berkas telah dinilai lengkap & fisik sah 100%: Tuliskan teks rekomendasi akhir yang membangun, lalu klik tombol "Setujui Laporan Akhir" secara digital.',
    'Konfirmasi Persetujuan: Sistem akan menerbitkan lembar sertifikasi digital (ttd digital) untuk kegiatan tersebut. Status kegiatan secara mutlak dinilai "SELESAI (ACC KECAMATAN)".'
  ]);

  writeAlertBox(
    'REKOMENDASI EVALUATOR KECAMATAN',
    'Operator desa tidak diizinkan mendeklarasikan suatu kegiatan SELESAI jika status persetujuan dari Kecamatan/PMD belum di-ACC (IsKecamatanApproved === false). Verifikasi fisik lapang secara obyektif sangat ditekankan.',
    'info'
  );


  // ==========================================
  // PAGE 5: PERTANYAAN UMUM & PENYELESAIAN MASALAH
  // ==========================================
  addNewPage();

  writeHeading1('BAB IV - FAQ & PENYELESAIAN MASALAH');

  writeHeading2('4.1 Masalah Penyimpanan Data Evaluasi Desa');
  writeParagraph(
    'Pertanyaan: Mengapa saat menyimpan form "ACC" atau "TTD" terkadang data tidak tersimpan ke database?'
  );
  writeParagraph(
    'Jawaban: Hal tersebut sebelumnya dikarenakan pembatasan Cloud Firestore yang menolak parameter undefined (tipe data kosong/tidak terdefinisi). Masalah ini saat ini TELAH TERATASI dengan sempurna berkat penambahan middleware "cleanForFirestore()" di server dan client. Seluruh data ACC dan TTD seratus persen tersimpan lancar di cloud.'
  );

  writeHeading2('4.2 Ketidaksinkronan Dashboard Progres Kegiatan');
  writeParagraph(
    'Pertanyaan: Berapa lama delay penayangan status kegiatan di dasbor utama warga?'
  );
  writeParagraph(
    'Jawaban: Aplikasi ini menggunakan konektivitas real-time "onSnapshot" dari Firebase SDK. Perubahan progres anggaran atau fisik di level desa atau persetujuan kecamatan langsung terekam dan tampil dalam waktu kurang dari 1 (satu) detik tanpa perlu klik penyegaran browser (refresh).'
  );

  writeHeading2('4.3 Aturan Reset Database baseline');
  writeParagraph(
    'Pertanyaan: Kapan dan bagaimana kami bisa membersihkan database simulasi?'
  );
  writeParagraph(
    'Jawaban: Untuk pengujian cepat (testing), tombol "Reset Database Awal" pada bilah hitam atas dapat ditekan. Tindakan ini akan menyetel ulang semua isian kegiatan kembali ke kondisi awal (baseline data), membantu proses presentasi di depan pimpinan.'
  );

  writeHeading2('4.4 Kontak Layanan Hubungan Masyarakat / IT Support');
  writeParagraph(
    'Jika operator desa menemui kendala teknis lebih lanjut yang tidak bisa diselesaikan melalui panduan ini, harap menghubungi Tim IT Pendamping Desa (PD/PLD) atau Kantor Camat Waru - Seksi Pemberdayaan Masyarakat Desa (PMD) di Jalan Negara No. 12, Waru.'
  );

  y += 5;
  writeAlertBox(
    'INTEGRITAS DATA SIMONEV',
    'Setiap entri data dan persetujuan (ACC KECAMATAN) dilindungi dengan penanda waktu server (server-timestamp) dan audit log publik pada Papan Transparansi Rakyat.',
    'success'
  );

  // Trigger browser PDF downloading workflow
  doc.save('PANDUAN_OPERATOR_SIMONEV_WARU.pdf');
}
