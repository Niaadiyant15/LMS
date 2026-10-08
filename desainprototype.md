# Perencanaan Desain Tampilan LMS — SMK Bina Informatika

Sumber acuan:
- Proses bisnis: `kordinasi TEFA 6 october - LMS.docx` (aktivitas tiap aktor + catatan laporan waka)
- Prototype HTML yang sudah ada (`*.html` di root repo, satu file per aktor, navigasi via `switchTab()`)

Tujuan: membuat **desain tampilan berupa gambar (PNG)** untuk dashboard dan setiap halaman (tab) per aktor.
Karena jumlahnya banyak (±125 layar), pengerjaan dibagi menjadi **tahap-tahap kecil** agar satu sesi
tidak melewati batas penggunaan. Satu tahap = satu sesi kerja.

---

## 1. Cara Kerja Per Tahap

1. Buka sesi baru, sebutkan: **"Kerjakan Tahap X di desainprototype.md"**.
2. Untuk tiap layar di tahap tersebut:
   - Buat mockup statis HTML di `desain/src/<aktor>/<nn-halaman>.html` (memakai `desain/src/_base.css` dari Tahap 0).
   - Render menjadi gambar PNG 1440×900 (desktop) → simpan di `desain/png/<aktor>/<nn-halaman>.png`.
   - Hanya layar bertanda 📱 yang juga dibuat versi mobile 390×844 (`...-mobile.png`).
3. Centang checklist layar di dokumen ini (`[ ]` → `[x]`) dan isi tabel **Log Progres** (bagian 6).
4. Selesai satu tahap → commit, lalu lanjut tahap berikutnya di sesi baru.

Aturan supaya hemat:
- Maksimal **±8 layar per tahap**.
- Data dummy cukup 5–8 baris per tabel; tidak perlu interaktif.
- Gunakan ulang komponen dari Tahap 0 (jangan mendesain ulang header/sidebar/kartu).
- Isi layar mengacu ke tab prototype yang sudah ada + poin proses bisnis di docx; jangan menambah fitur baru.

---

## 2. Design System (dikerjakan di Tahap 0)

### 2.1 Layout umum
```
┌──────────────────────────────────────────────────────────────┐
│ Topbar: logo · "SMK BINA INFORMATIKA – PORTAL <AKTOR>" ·     │
│         pencarian · notifikasi (badge) · avatar + nama/role  │
├────────────┬─────────────────────────────────────────────────┤
│ Sidebar    │ Breadcrumb + judul halaman + tombol aksi utama  │
│ (menu =    │ ───────────────────────────────────────────────  │
│ tab proto- │ Baris KPI (3–4 kartu statistik)                  │
│ type,      │ Konten: grafik / tabel / form / daftar           │
│ bernomor)  │                                                  │
└────────────┴─────────────────────────────────────────────────┘
```
- Prototype memakai tab horizontal; desain baru memindahkannya ke **sidebar kiri** (lebih rapi untuk 6–8 menu).
  Urutan & nama menu tetap mengikuti tab prototype.
- Lebar konten maks 1280px, grid 12 kolom, gutter 24px.
- Mobile: sidebar menjadi drawer, KPI menjadi 2 kolom, tabel menjadi kartu.

### 2.2 Warna
Basis netral (dari prototype): latar `slate-50`, kartu putih, border `slate-200`, topbar `slate-900`.
Warna aksen per aktor (mengikuti prototype):

| Aktor | Aksen | Aktor | Aksen |
|---|---|---|---|
| Yayasan | indigo-600 | Dept. Kurikulum | indigo-600 |
| Kepala Sekolah | blue-600 | BK | rose-600 |
| Admin Sekolah | blue-600 | Wali Kelas | indigo-600 |
| Waka Kesiswaan | emerald-600 | Guru Piket | amber-600 |
| Waka Humas/Hubin | blue-600 | Guru Mapel | emerald-600 |
| Waka Sarpras | amber-600 | Wali Murid | blue-600 |
| Tata Usaha | purple-600 | IDUKA | indigo-600 |
| Keuangan | emerald-600 | Siswa | teal-600 |
| Staf Penilaian & CBT | indigo-600 | | |

Warna status (seragam di semua aktor): sukses `emerald`, peringatan `amber`, bahaya `rose`, info `sky`, netral `slate`.

### 2.3 Tipografi & ikon
- Font: Inter (judul 600–700, isi 400). Ukuran: H1 24, H2 18, isi 14, keterangan 12.
- Ikon: Font Awesome 6 (sudah dipakai prototype).

### 2.4 Komponen inti (dibuat sekali di Tahap 0)
| Kode | Komponen |
|---|---|
| C01 | Topbar + Sidebar (varian aksen per aktor) |
| C02 | Kartu KPI (angka, label, tren ▲▼, ikon) |
| C03 | Kartu grafik (bar, line, donut) |
| C04 | Tabel data (filter, cari, badge status, aksi, paginasi) |
| C05 | Badge status alur: `Belum` · `Diajukan` · `Revisi` · `Disetujui` · `Ditolak` |
| C06 | Form (input, select, upload file, tanggal) + modal |
| C07 | Kartu pengumuman / notifikasi / daftar tugas |
| C08 | Tombol Ekspor PDF/Excel + pemilih periode |
| C09 | Timeline/stepper alur persetujuan (mis. Guru → Waka Kurikulum → Kepala Sekolah) |
| **C10** | **Panel Laporan Program Kerja Waka** (lihat 2.5) |
| C11 | Empty state & alert banner |

### 2.5 Aturan khusus: Panel Laporan Waka (dari catatan docx)
- **Nama & tata letak panel laporan harus sama** di semua waka (Kesiswaan, Humas, Sarpras, Kurikulum) serta Keuangan.
- Tiap waka dapat **menginput daftar program** (program → sub program), mengisi **progres (%)**, dan **mengunggah file laporan**.
- Default tabel memakai **template dari Kepala Sekolah**.
- Contoh program Kesiswaan: Program PSB, Pembentukan karakter ketakwaan & keimanan, Pembentukan karakter kewargaan, Pembentukan budaya sekolah.
- Di sisi Kepala Sekolah tampil sebagai rekap semua waka (sumber: `laporan-waka.js`).

---

## 3. Daftar Layar Per Aktor

Format nama file: `<nn>-<slug>.png`. Layar `00-dashboard` = halaman pertama setelah login.

### 3.0 Umum
- [ ] 00-login 📱
- [ ] 01-pilih-peran (seperti `index.html`)
- [ ] 02-design-system (lembar komponen C01–C11)

### 3.1 Yayasan (`yayasan.html`)
- [ ] 00-dashboard-lintas-sekolah — ringkasan per sekolah (siswa, guru, rombel), perbandingan kehadiran/nilai/ketuntasan/kelulusan, tren siswa baru & keluar, filter sekolah/jenjang/jurusan/TA
- [ ] 01-monitoring-kinerja — capaian akademik per unit, rekap kedisiplinan, keaktifan LMS, laporan kinerja Kepsek
- [ ] 02-laporan-ekspor — laporan bulanan/semester/tahunan, laporan PKL & kerja sama industri
- [ ] 03-persetujuan-strategis — pengajuan program besar, pengesahan kalender/kebijakan
- [ ] 04-komunikasi — pengumuman ke sekolah, pesan ke Kepsek, kendala unit
- [ ] 05-sdm-keuangan — rekap guru/staf per unit, ringkasan SPP, tunggakan, realisasi anggaran

### 3.2 Kepala Sekolah (`kepala sekolah.html`)
- [ ] 00-dashboard-eksekutif 📱 — KPI siswa/guru/rombel/TA, kehadiran siswa & guru (bulanan), rata-rata nilai & ketuntasan, grafik tren, notifikasi persetujuan menunggu & kelas kehadiran rendah
- [ ] 01-monitoring-pembelajaran — modul & materi yang sudah dicek Waka Kurikulum (read-only), keaktifan guru, jurnal & realisasi pertemuan
- [ ] 02a-persetujuan-perangkat-ajar — modul ajar, ATP, prosem (stepper C09)
- [ ] 02b-persetujuan-izin-cuti — halaman terpisah untuk izin/cuti guru & staf
- [ ] 02c-pengesahan-nilai-kenaikan — rapor, kenaikan kelas, kelulusan, proposal kegiatan
- [ ] 03a-laporan-rekap — absensi, nilai, ketuntasan + ekspor
- [ ] 03b-laporan-program-waka — rekap panel C10 dari semua waka + keuangan (lunas/belum), PKL, ringkasan pelanggaran
- [ ] 04-komunikasi — pengumuman bertarget per kelas/guru/siswa/wali murid/IDUKA + field link form, pesan langsung
- [ ] 05-supervisi — laporan supervisi dari Dept. Kurikulum dengan grafik, status unduhan catatan tindak lanjut oleh guru

### 3.3 Admin Sekolah (`admin.html`)
- [ ] 00-dashboard — status akun, kelas belum dibuat, log login terbaru
- [ ] 01-manajemen-pengguna — tabel user, impor Excel/CSV, reset password, role, relasi wali–siswa
- [ ] 02-data-master-akademik — TA/semester, jurusan, rombel, mapel, ruang, kalender akademik
- [ ] 03-penugasan-jadwal — plotting siswa, wali kelas, guru mapel, guru piket, kenaikan kelas
- [ ] 04-pengaturan-sekolah — jam masuk/pulang, kontak admin, KKM/bobot/predikat, template dokumen
- [ ] 05-monitoring-operasional — akun bermasalah, data tidak lengkap
- [ ] 06-dukungan-pemeliharaan — backup/ekspor, data ganda, tiket kendala

### 3.4 Departemen / Waka Kurikulum (`depkur.html`)
- [ ] 00-dashboard — keaktifan guru, kelengkapan perangkat ajar, ketuntasan, jam kosong
- [ ] 01-struktur-kurikulum — struktur per tingkat/jurusan, JP, CP/ATP/KKTP, kalender
- [ ] 02-beban-mengajar — pembagian tugas, JP per guru + peringatan kurang/lebih
- [ ] 03-jadwal-pelajaran — grid jadwal + deteksi bentrok
- [ ] 04a-perangkat-ajar — telaah dengan status C05 + catatan revisi
- [ ] 04b-supervisi-akademik — instrumen (pra pembelajaran, proses, evaluasi STS/SAS), catatan tindak lanjut ke guru, grafik hasil
- [ ] 05-monitoring-kkm — ketuntasan per mapel/kelas, kunci nilai + log audit
- [ ] 06-ujian-rapor — kalender ujian, panitia, validasi nilai, template rapor
- [ ] 07-vokasi-p5-pkl — pemetaan kompetensi industri, jadwal PKL/P5/UKK
- [ ] 08-laporan — panel C10 + ekspor

### 3.5 Waka Kesiswaan (`kesiswaan.html`)
- [ ] 00-dashboard — KPI pelanggaran, kehadiran, prestasi, peringatan dini
- [ ] 01-kedisiplinan-tatib — master poin, persetujuan tindakan (SP, skorsing, panggilan), kasus berat
- [ ] 02-kehadiran-peringatan — tren terlambat/alfa/izin, daftar peringatan dini
- [ ] 03-ekskul-osis — ekskul, pembina, OSIS/MPK, proposal & LPJ
- [ ] 04-prestasi-beasiswa
- [ ] 05-karakter-kesehatan — statistik BK anonim, program pembinaan, UKS
- [ ] 06-kesiswaan-smk — kesiapan PKL, pelanggaran saat PKL, BKK
- [ ] 07-laporan-program — panel C10 (program PSB, karakter, kewargaan, budaya sekolah)

### 3.6 Waka Humas / Hubin (`waka humas.html`)
- [ ] 00-dashboard — mitra aktif, MoU akan berakhir, serapan lulusan
- [ ] 01-kerja-sama-mitra — database mitra, MoU + pengingat kadaluarsa
- [ ] 02-pkl-bkk-tracer — kuota PKL per mitra, lowongan, tracer study
- [ ] 03-komite-wali-murid — komite, agenda, aspirasi, survei kepuasan
- [ ] 04-informasi-publik-ppdb
- [ ] 05-kunjungan-ukk
- [ ] 06-laporan-program — panel C10 (IDUKA, masyarakat, alumni)

### 3.7 Waka Sarpras (`sarpras.html`)
- [ ] 00-dashboard — aset per kondisi, kerusakan menunggu, peminjaman hari ini
- [ ] 01-inventaris-aset — daftar aset, mutasi, stok opname, label QR
- [ ] 02-gedung-ruang — data ruang + peminjaman dengan deteksi bentrok
- [ ] 03-lab-bengkel — alat praktik, bahan habis pakai, K3, kalibrasi
- [ ] 04-perawatan-perbaikan — alur laporan kerusakan (kanban 5 status)
- [ ] 05-pengadaan-rkas — persetujuan berjenjang (C09)
- [ ] 06-keamanan-lingkungan
- [ ] 07-laporan-program — panel C10 (stok opname lab, non-lab, data ruang)

### 3.8 Tata Usaha (`tata usaha.html`)
- [ ] 00-dashboard — jumlah siswa/guru, mutasi bulan ini, surat masuk
- [ ] 01-data-induk-siswa — biodata, mutasi, berkas, kartu pelajar
- [ ] 02-guru-tendik — kepegawaian, izin/cuti (diteruskan ke Kepsek)
- [ ] 03-persuratan-disposisi — surat masuk/keluar, template, arsip
- [ ] 04-rekap-rapor-dapodik
- [ ] 05-administrasi-pkl
- [ ] 06-laporan-ekspor

### 3.9 Keuangan (`keuangan.html`)
- [ ] 00-dashboard — penerimaan hari ini/bulan ini, tunggakan, realisasi anggaran
- [ ] 01-master-keuangan — jenis pembayaran, tarif, rekening
- [ ] 02-tagihan — generate massal, keringanan/beasiswa, blokir ujian
- [ ] 03-penerimaan-pembayaran — kasir + kuitansi
- [ ] 04-tunggakan-penagihan — daftar menunggak, pengingat WA
- [ ] 05-pengeluaran-anggaran — RAPBS, dana BOS
- [ ] 06-laporan — panel C10 + status lunas/belum lunas untuk Kepsek

### 3.10 Staf Penilaian & CBT (`penilaian.html`)
- [ ] 00-dashboard — ujian berjalan, status soal per guru
- [ ] 01-periode-sesi — jadwal, ruang, peserta, pengawas, kartu peserta
- [ ] 02-pengelolaan-soal — status soal, paket A/B, kunci soal
- [ ] 03-pelaksanaan-realtime — monitor login/mengerjakan/selesai, token, berita acara
- [ ] 04-penilaian-analisis — rekap, analisis butir, remedial
- [ ] 05-komunikasi-pengingat
- [ ] 06-laporan-ekspor

### 3.11 Bimbingan Konseling (`bk.html`)
- [ ] 00-dashboard — daftar peringatan dini harian, kasus aktif
- [ ] 01-data-siswa-bk
- [ ] 02-kedisiplinan-pelanggaran — input pelanggaran, akumulasi poin, cetak surat panggilan/SP
- [ ] 03-konseling — jadwal, catatan kasus (rahasia), home visit
- [ ] 04-bimbingan-karier
- [ ] 05-komunikasi-koordinasi — rujukan dari walas/piket, rekomendasi terbatas
- [ ] 06-laporan-statistik

### 3.12 Wali Kelas (`walas.html`)
- [ ] 00-dashboard 📱 — kehadiran kelas hari ini, siswa berisiko, izin menunggu
- [ ] 01-data-kelas-binaan — daftar siswa, struktur kelas, piket kelas
- [ ] 02-absensi-kehadiran — verifikasi izin dari wali murid
- [ ] 03-monitoring-akademik — nilai semua mapel (read-only), ketuntasan
- [ ] 04-rapor-administrasi — catatan walas, kelengkapan nilai, rekomendasi kenaikan, sensor SPP
- [ ] 05-pembinaan-siswa — rujukan ke BK
- [ ] 06-komunikasi-undangan
- [ ] 07-laporan-ekspor

### 3.13 Guru Piket (`piket.html`)
- [ ] 00-dashboard 📱 — guru hadir/tidak hari ini, jam kosong, siswa terlambat
- [ ] 01-kehadiran-guru-jam-kosong — penunjukan guru pengganti
- [ ] 02-siswa-terlambat-ketertiban — alur keterlambatan (`alur-keterlambatan.js`)
- [ ] 03-jurnal-buku-tamu
- [ ] 04-komunikasi-notifikasi
- [ ] 05-laporan-piket

### 3.14 Guru Mata Pelajaran (`mapelbaruguru.html`)
- [ ] 00-dashboard 📱 — jadwal hari ini, tugas perlu dinilai, status perangkat ajar, catatan supervisi baru
- [ ] 01-manajemen-kelas
- [ ] 02-perangkat-ajar — unggah CP/ATP/modul, status persetujuan (C09)
- [ ] 03-materi-pembelajaran
- [ ] 04-tugas-projek
- [ ] 05a-bank-soal
- [ ] 05b-cbt-wizard — membuat kuis/UH/STS/SAS
- [ ] 06-presensi-jurnal
- [ ] 07-interaksi-supervisi — forum, daring, unduh catatan tindak lanjut supervisi
- [ ] 08-laporan-leger

### 3.15 Wali Murid (`wali murid.html`)
- [ ] 00-dashboard 📱 — pemilih anak aktif, kehadiran, tugas, tagihan, pengumuman
- [ ] 01-profil-anak 📱
- [ ] 02-kehadiran-izin 📱 — ajukan izin + unggah surat
- [ ] 03-akademik-rapor 📱
- [ ] 04-kedisiplinan 📱
- [ ] 05-pkl-kegiatan
- [ ] 06-komunikasi-undangan 📱
- [ ] 07-keuangan-spp 📱

### 3.16 IDUKA (`iduka.html`)
- [ ] 00-dashboard — siswa PKL aktif, jurnal belum diverifikasi, tenggat penilaian
- [ ] 01-profil-mou — profil perusahaan, pembimbing industri
- [ ] 02-penempatan-pkl — terima/tolak pengajuan, pembagian divisi
- [ ] 03-monitoring-harian — verifikasi presensi & jurnal
- [ ] 04-penilaian-pkl — rubrik, kunci nilai, sertifikat
- [ ] 05-keselarasan-loker
- [ ] 06-komunikasi
- [ ] 07-laporan-riwayat

### 3.17 Siswa (`siswa.html`)
- [ ] 00-dashboard 📱 — jadwal hari ini, tugas mendekati tenggat, ujian, pengumuman
- [ ] 01-pembelajaran 📱 — daftar mapel & materi
- [ ] 02-tugas-projek 📱 — kumpul tugas, portofolio
- [ ] 03-ujian-nilai 📱 — tampilan CBT + nilai
- [ ] 04-kehadiran 📱
- [ ] 05-kedisiplinan-bk 📱
- [ ] 06-pkl-karier 📱 — presensi & jurnal PKL
- [ ] 07-komunikasi 📱

---

## 4. Pembagian Tahap

Urutan berdasarkan prioritas: fondasi → aktor pimpinan → waka (karena panel laporan harus seragam) → staf → guru → pengguna akhir.

| Tahap | Isi | Jumlah layar |
|---|---|---|
| 0 | Setup folder + `_base.css`, design system (3.0: login, pilih peran, lembar komponen C01–C11) | 3 |
| 1 | Kepala Sekolah bag. 1: 00, 01, 02a, 02b, 02c | 5 |
| 2 | Kepala Sekolah bag. 2: 03a, 03b, 04, 05 + mobile dashboard | 5 |
| 3 | Yayasan (semua) | 6 |
| 4 | Dept. Kurikulum bag. 1: 00 – 04a | 5 |
| 5 | Dept. Kurikulum bag. 2: 04b – 08 | 5 |
| 6 | Waka Kesiswaan (semua) | 8 |
| 7 | Waka Humas (semua) | 7 |
| 8 | Waka Sarpras (semua) | 8 |
| 9 | Admin Sekolah (semua) | 7 |
| 10 | Tata Usaha (semua) | 7 |
| 11 | Keuangan (semua) | 7 |
| 12 | Staf Penilaian & CBT (semua) | 7 |
| 13 | BK (semua) | 7 |
| 14 | Guru Piket (semua) + mobile dashboard | 7 |
| 15 | Wali Kelas (semua) + mobile dashboard | 9 |
| 16 | Guru Mapel bag. 1: 00 – 04 + mobile dashboard | 6 |
| 17 | Guru Mapel bag. 2: 05a – 08 | 5 |
| 18 | Wali Murid (desktop semua) | 8 |
| 19 | Wali Murid (mobile) | 7 |
| 20 | IDUKA (semua) | 8 |
| 21 | Siswa (desktop semua) | 8 |
| 22 | Siswa (mobile) | 8 |
| 23 | Review konsistensi + halaman indeks galeri (`desain/index.html` berisi semua PNG) | – |

Total ±160 gambar (termasuk versi mobile).

---

## 5. Struktur Folder Output

```
desain/
├── src/
│   ├── _base.css            # token warna, tipografi, komponen C01–C11
│   ├── _render.md           # catatan cara render PNG
│   └── <aktor>/<nn-halaman>.html
├── png/
│   ├── 00-umum/
│   ├── 01-yayasan/
│   ├── 02-kepala-sekolah/
│   ├── 03-admin/
│   ├── 04-kurikulum/
│   ├── 05-kesiswaan/
│   ├── 06-humas/
│   ├── 07-sarpras/
│   ├── 08-tata-usaha/
│   ├── 09-keuangan/
│   ├── 10-penilaian/
│   ├── 11-bk/
│   ├── 12-wali-kelas/
│   ├── 13-guru-piket/
│   ├── 14-guru-mapel/
│   ├── 15-wali-murid/
│   ├── 16-iduka/
│   └── 17-siswa/
└── index.html               # galeri semua desain (Tahap 23)
```

Render PNG: buka file HTML mockup di browser (XAMPP: `http://localhost/prototype-lms/desain/src/...`),
atur viewport 1440×900 (mobile 390×844), lalu screenshot satu halaman penuh.

### Template prompt per tahap
```
Kerjakan Tahap <X> di desainprototype.md.
Gunakan desain/src/_base.css. Acuan isi: <file prototype>.html + bagian <aktor> di docx.
Buat mockup HTML lalu render PNG 1440x900 ke desain/png/<folder-aktor>/.
Setelah selesai centang checklist layar dan isi Log Progres.
```

---

## 6. Log Progres

| Tahap | Tanggal | Layar selesai | Catatan |
|---|---|---|---|
| 0 | | | |
