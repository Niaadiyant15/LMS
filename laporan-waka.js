// =====================================================================
// Laporan Program Kerja Waka ke Kepala Sekolah (dipakai bersama oleh
// halaman depkur, kesiswaan, waka humas, sarpras, dan kepala sekolah).
//
// Struktur: setiap bidang punya beberapa PROGRAM, dan setiap program punya
// beberapa SUB PROGRAM yang dilaporkan dengan kolom: Indikator Kegiatan,
// Jadwal, Pelaksana, Target, Realisasi, Progres, Kendala, Tindak Lanjut,
// Status, plus lampiran file dan catatan Kepala Sekolah.
//
// Prototype: data disimpan di localStorage browser supaya sub program yang
// ditambahkan/dikirim waka langsung terlihat di halaman Kepala Sekolah
// (selama dibuka di browser & alamat yang sama).
// =====================================================================
(function () {
    const STORAGE_KEY = 'lms_laporan_waka_v2';
    const STORAGE_KEY_LAMA = 'lms_laporan_waka_v1';

    const BIDANG = {
        kurikulum: { judul: 'KURIKULUM', jabatan: 'Waka Kurikulum' },
        kesiswaan: { judul: 'KESISWAAN', jabatan: 'Waka Kesiswaan' },
        humas: { judul: 'HUBUNGAN INDUSTRI / HUBIN', jabatan: 'Waka Humas / Hubin' },
        sarpras: { judul: 'SARANA PRASARANA', jabatan: 'Waka Sarpras' },
        keuangan: { judul: 'KEUANGAN SEKOLAH', jabatan: 'Bendahara' }
    };

    const STATUS = ['Belum Mulai', 'Berjalan', 'Selesai', 'Tertunda'];
    const WARNA_STATUS = {
        'Belum Mulai': 'bg-slate-100 text-slate-700',
        'Berjalan': 'bg-emerald-100 text-emerald-800',
        'Selesai': 'bg-blue-100 text-blue-800',
        'Tertunda': 'bg-amber-100 text-amber-800'
    };

    // File di atas batas ini hanya dicatat namanya, karena penyimpanan browser terbatas (~5 MB)
    const MAKS_UKURAN_SIMPAN = 1.5 * 1024 * 1024;
    const FORMAT_DITERIMA = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png';

    // ---------- Data contoh ----------
    const prog = (nama, sub) => ({ nama, sub });
    const sub = (nama, indikator, jadwal, pelaksana, target, realisasi, progres, kendala, tindakLanjut, status, lampiran) =>
        ({ nama, indikator, jadwal, pelaksana, target, realisasi, progres, kendala, tindakLanjut, status, terkirim: true, catatanKS: '', lampiran: lampiran || [] });
    // Lampiran contoh (hanya metadata; isi file tidak tersedia di prototype)
    const contohFile = (nama, ukuran, tanggal) => ({ nama, ukuran, tanggal, data: '' });

    const DATA_AWAL = {
        kurikulum: [
            prog('Raker Persiapan Mengajar', [
                sub('Raker', 'Rapat kerja persiapan bahan ajar & modul Deep Learning', 'Juli 2026', 'Waka Kurikulum', '100 % Guru Mempersiapkan bahan ajar / Modul Deep Learning', '85 %', 85, 'Masih ada guru pemula yang belum menguasai pembuatan modul', 'PIGP', 'Berjalan',
                    [contohFile('Notulen_Raker_Persiapan_Mengajar.pdf', 245760, '2026-07-10'), contohFile('Rekap_Kesiapan_Modul_Guru.xlsx', 61440, '2026-07-12')]),
                sub('Workshop Modul Deep Learning', 'Pelatihan penyusunan modul ajar berbasis Deep Learning', 'Agustus 2026', 'Tim Kurikulum', 'Seluruh guru menyusun minimal 1 modul', '32 dari 38 guru', 84, 'Waktu pelatihan terbatas', 'Pendampingan per MGMP', 'Berjalan')
            ]),
            prog('Induksi Guru Pemula', [
                sub('Pendampingan Mentor', 'Guru pemula didampingi mentor senior', 'Juli - Desember 2026', 'Waka Kurikulum & Mentor', '100 % guru pemula mengikuti program induksi', '4 dari 5 guru', 80, 'Jadwal mentor bentrok dengan jam mengajar', 'Pendampingan dijadwalkan tiap Sabtu', 'Berjalan')
            ]),
            prog('Hasil Penelaahan Modul Deep Learning', [
                sub('Telaah Modul Ajar', 'Modul ajar guru ditelaah & diberi catatan revisi', 'Agustus - September 2026', 'Tim Kurikulum', '100 % modul ajar disetujui', '30 dari 38 modul', 79, '8 modul masih perlu revisi asesmen', 'Klinik modul bersama tim kurikulum', 'Berjalan')
            ]),
            prog('Hasil Kegiatan STS', [
                sub('Penyusunan & Validasi Soal STS', 'Soal STS terkumpul dan tervalidasi', 'Oktober 2026', 'Staf Penilaian', '100 % soal masuk sebelum tenggat', '30 dari 38 mapel', 79, 'Masih ada guru yang terlambat menyerahkan soal', 'Pengingat tenggat soal ke guru mapel', 'Berjalan'),
                sub('Pelaksanaan STS', 'STS berbasis CBT terlaksana', '19 - 24 Oktober 2026', 'Panitia Ujian', 'Ketuntasan minimal 85 %', '-', 0, '-', '-', 'Belum Mulai')
            ]),
            prog('Hasil Kegiatan SAS', [
                sub('Pelaksanaan SAS', 'SAS terlaksana sesuai kalender akademik', 'Desember 2026', 'Panitia Ujian', 'SAS terlaksana 100 %', '-', 0, '-', '-', 'Belum Mulai')
            ]),
            prog('Hasil Kegiatan TKA', [
                sub('Simulasi TKA Kelas XII', 'Siswa kelas XII mengikuti simulasi TKA', 'September - November 2026', 'Waka Kurikulum & Proktor', '100 % siswa kelas XII mengikuti simulasi', '2 dari 5 sesi', 40, 'Kapasitas lab komputer terbatas', 'Sesi simulasi bergilir per rombel', 'Berjalan')
            ])
        ],
        kesiswaan: [
            prog('Program PPDB', [
                sub('Persiapan PPDB', 'Mensosialisasikan program PPDB ke panitia PPDB', 'Juli 2026', 'Waka Kurikulum', 'Memperoleh 150 siswa Tahun ajaran 2026 - 2027', '20 %', 20, 'Promosi belum maksimal', 'Evaluasi Promosi Pendekatan ke SMP swasta & negeri', 'Berjalan'),
                sub('Roadshow ke SMP', 'Kunjungan promosi ke SMP sekitar', 'Agustus - Oktober 2026', 'Tim PPDB & OSIS', 'Kunjungan ke 20 SMP', '8 SMP', 40, 'Jadwal SMP padat menjelang ujian', 'Promosi daring & open house', 'Berjalan')
            ]),
            prog('Pembentukan Karakter IMTAQ', [
                sub('Sholat Dhuha Berjamaah', 'Siswa mengikuti sholat dhuha terjadwal per kelas', 'Setiap hari', 'Wali Kelas & Guru PAI', 'Kehadiran 90 % siswa', '86 %', 86, 'Mushola tidak menampung semua kelas', 'Jadwal bergilir per tingkat', 'Berjalan'),
                sub('Tadarus Pagi', 'Literasi Al-Quran 15 menit sebelum KBM', 'Senin - Kamis', 'Wali Kelas', 'Seluruh kelas melaksanakan', '34 dari 36 kelas', 94, '2 kelas belum konsisten', 'Monitoring oleh wali kelas', 'Berjalan')
            ]),
            prog('Pembentukan Karakter KEWARGAAN', [
                sub('Upacara & Hari Besar Nasional', 'Upacara bendera dan peringatan hari besar nasional', 'Setiap Senin & hari besar', 'Pembina OSIS', '100 % kelas bertugas bergiliran', '100 %', 100, '-', '-', 'Selesai')
            ]),
            prog('Pembentukan Karakter KEMANDIRIAN', [
                sub('Market Day Kewirausahaan', 'Siswa membuat & menjual produk', 'November 2026', 'Guru PKK & OSIS', 'Seluruh kelas XI ikut berjualan', '-', 10, 'Modal awal siswa terbatas', 'Kerja sama koperasi sekolah', 'Belum Mulai')
            ]),
            prog('Pembentukan Karakter KESEHATAN MENTAL', [
                sub('Screening Kesehatan Mental', 'Siswa kelas X mengisi angket kesehatan mental', 'September 2026', 'Guru BK', '100 % siswa kelas X', '180 dari 200 siswa', 90, 'Sebagian siswa belum mengisi', 'Pengisian susulan saat jam BK', 'Berjalan')
            ]),
            prog('Pembinaan Organisasi dan Kepemimpinan', [
                sub('LDKS Pengurus OSIS', 'Latihan dasar kepemimpinan pengurus OSIS & MPK', 'Agustus 2026', 'Pembina OSIS', '45 pengurus mengikuti LDKS', '45 pengurus', 100, '-', 'Evaluasi program kerja OSIS', 'Selesai'),
                sub('Pembinaan Ekstrakurikuler', 'Ekskul aktif berlatih rutin', 'Sepanjang semester', 'Pembina Ekskul', '12 ekskul aktif', '11 ekskul aktif', 90, 'Pembina ekskul robotik belum tersedia', 'Kerja sama pelatih dari IDUKA', 'Berjalan')
            ])
        ],
        humas: [
            prog('Kemitraan IDUKA', [
                sub('Penjaringan Mitra Baru', 'MoU baru dengan perusahaan IT/DUDI', 'Juli - Desember 2026', 'Waka Humas', 'Kerja sama dengan 30 Perusahaan IT/DUDI', '24 Mitra', 80, 'Penyesuaian jadwal industri dengan kalender akademik', 'MoU Lanjutan', 'Berjalan'),
                sub('Perpanjangan MoU', 'MoU yang akan berakhir diperpanjang', 'Oktober 2026', 'Waka Humas & TU', '3 MoU diperpanjang', '1 MoU', 33, 'Menunggu tanda tangan direksi mitra', 'Kunjungan ke mitra', 'Berjalan')
            ]),
            prog('Penempatan PKL Siswa', [
                sub('Penempatan PKL Kelas XI', 'Siswa kelas XI ditempatkan di mitra', 'Juli 2026', 'Waka Humas & Kaprog', '100 % siswa kelas XI', '162 dari 170 siswa', 95, '8 siswa belum memenuhi syarat kedisiplinan', 'Koordinasi dengan Waka Kesiswaan', 'Berjalan')
            ]),
            prog('Kerja Sama Masyarakat Luas', [
                sub('Bakti Sosial', 'Kegiatan bersama warga sekitar sekolah', 'November 2026', 'Waka Humas & OSIS', 'Minimal 2 kegiatan per semester', '1 kegiatan', 50, 'Menunggu jadwal kelurahan', 'Koordinasi dengan kelurahan', 'Berjalan')
            ]),
            prog('Jejaring Alumni & Tracer Study', [
                sub('Tracer Study Angkatan 2025', 'Alumni mengisi formulir tracer study', 'September - Desember 2026', 'Waka Humas & BKK', '80 % alumni angkatan 2025', '62 %', 78, 'Kontak alumni banyak yang berubah', 'Sebar formulir via grup angkatan', 'Berjalan')
            ])
        ],
        sarpras: [
            prog('Stok Opname Inventaris Laboratorium', [
                sub('Lab Komputer', 'Perangkat lab komputer terdata dan siap pakai', 'Juli 2026', 'Waka Sarpras & Teknisi', '100 % perangkat siap pakai', '33 Unit', 94, '2 Unit PC memerlukan penggantian sparepart', 'Perbaikan Teknisi', 'Berjalan'),
                sub('Bengkel / Lab Praktik', 'Alat praktik terdata beserta kondisinya', 'Agustus 2026', 'Waka Sarpras & Kaprog', '100 % alat praktik terdata', '120 dari 130 alat', 92, 'Alat lama belum berlabel', 'Cetak label QR aset', 'Berjalan')
            ]),
            prog('Stok Opname Inventaris Non Laboratorium', [
                sub('Ruang Kelas & Fasilitas Umum', 'Aset ruang kelas & fasilitas umum terdata', 'Agustus 2026', 'Waka Sarpras', '100 % aset terdata', '410 dari 450 item', 91, 'Label aset lama banyak yang hilang', 'Cetak ulang label QR aset', 'Berjalan')
            ]),
            prog('Pendataan Ruang Sekolah', [
                sub('Pendataan Ruang', 'Data kapasitas, kondisi, dan fasilitas tiap ruang', 'Juli 2026', 'Waka Sarpras', 'Seluruh ruang terdata', '42 dari 42 ruang', 100, '-', 'Sinkron ke Dapodik', 'Selesai')
            ])
        ],
        keuangan: [
            prog('Administrasi Keuangan Siswa', [
                sub('Validasi Administrasi Semester Ganjil', 'Pembayaran siswa tervalidasi', 'Juli - Desember 2026', 'Bendahara', '100% Validasi administrasi siswa semester ganjil', '90 % Lunas', 90, '124 Siswa mengajukan surat perjanjian keringanan', 'Validasi Cicilan', 'Selesai')
            ])
        ]
    };

    // ---------- Penyimpanan ----------
    const salin = o => JSON.parse(JSON.stringify(o));

    // Data versi lama (tanpa sub program): setiap program lama menjadi program dengan 1 sub program
    function migrasiLama() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY_LAMA);
            if (!raw) return null;
            const lama = JSON.parse(raw); const data = {};
            Object.keys(DATA_AWAL).forEach(k => {
                const b = lama[k];
                data[k] = b ? {
                    foto: b.foto || '',
                    program: b.program.map(pr => ({ nama: pr.nama, sub: [{ nama: pr.nama, indikator: '-', jadwal: '-', pelaksana: BIDANG[k].jabatan, target: pr.target, realisasi: pr.realisasi, progres: pr.progres, kendala: pr.kendala, tindakLanjut: pr.tindakLanjut, status: pr.status, terkirim: pr.terkirim, catatanKS: pr.catatanKS || '', lampiran: pr.lampiran || [] }] }))
                } : { foto: '', program: salin(DATA_AWAL[k]) };
            });
            return data;
        } catch (e) { return null; }
    }

    function muat() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const data = JSON.parse(raw);
                Object.keys(DATA_AWAL).forEach(k => { if (!data[k]) data[k] = { program: salin(DATA_AWAL[k]), foto: '' }; });
                return data;
            }
            const migrasi = migrasiLama();
            if (migrasi) { simpan(migrasi); return migrasi; }
        } catch (e) { /* storage tidak tersedia: pakai data awal */ }
        const data = {};
        Object.keys(DATA_AWAL).forEach(k => data[k] = { program: salin(DATA_AWAL[k]), foto: '' });
        return data;
    }

    function simpan(data) {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); return true; }
        catch (e) { return false; }
    }

    // ---------- Util ----------
    const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const sel = 'p-2.5 border border-slate-300 align-top';
    const ukuranTeks = b => b >= 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB';
    const ikonFile = nama => {
        const ext = (nama.split('.').pop() || '').toLowerCase();
        if (ext === 'pdf') return 'fa-file-pdf text-rose-500';
        if (['doc', 'docx'].includes(ext)) return 'fa-file-word text-blue-600';
        if (['xls', 'xlsx'].includes(ext)) return 'fa-file-excel text-emerald-600';
        if (['ppt', 'pptx'].includes(ext)) return 'fa-file-powerpoint text-orange-500';
        if (['jpg', 'jpeg', 'png'].includes(ext)) return 'fa-file-image text-purple-500';
        return 'fa-file text-slate-500';
    };
    const warnaProgres = v => v >= 80 ? 'bg-emerald-500' : v >= 50 ? 'bg-amber-500' : 'bg-rose-500';

    // ---------- Modal (disuntikkan sekali per halaman) ----------
    function bukaModal(judul, html) {
        let m = document.getElementById('lwModal');
        if (!m) {
            m = document.createElement('div');
            m.id = 'lwModal';
            m.className = 'fixed inset-0 bg-slate-900/60 z-[60] hidden flex items-center justify-center p-4';
            m.innerHTML = `
                <div class="bg-white rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
                    <div class="flex justify-between items-center border-b pb-3">
                        <h3 id="lwModalJudul" class="font-bold text-slate-800 text-base"></h3>
                        <button onclick="LaporanWaka.tutup()" class="text-slate-400 hover:text-slate-600"><i class="fa-solid fa-xmark text-lg"></i></button>
                    </div>
                    <div id="lwModalIsi" class="text-xs text-slate-700 space-y-3"></div>
                </div>`;
            m.addEventListener('click', e => { if (e.target === m) tutup(); });
            document.body.appendChild(m);
        }
        document.getElementById('lwModalJudul').innerText = judul;
        document.getElementById('lwModalIsi').innerHTML = html;
        m.classList.remove('hidden');
    }

    function tutup() {
        const m = document.getElementById('lwModal');
        if (m) m.classList.add('hidden');
    }

    // ---------- Render utama ----------
    // opsi.mode: 'waka' (bisa kelola program & sub program) atau 'kepsek' (hanya sub program terkirim + catatan)
    const instans = {};

    function render(containerId, bidang, opsi) {
        instans[containerId] = { bidang, mode: (opsi && opsi.mode) || 'waka', pilih: 0 };
        gambar(containerId);
    }

    // Program beserta sub program yang boleh dilihat sesuai mode
    function daftarTerlihat(st, data) {
        const isWaka = st.mode === 'waka';
        return data[st.bidang].program
            .map((pr, pIdx) => ({ ...pr, pIdx, sub: pr.sub.map((s, sIdx) => ({ ...s, sIdx })).filter(s => isWaka || s.terkirim) }))
            .filter(pr => isWaka || pr.sub.length);
    }

    function gambar(containerId) {
        const st = instans[containerId];
        const el = document.getElementById(containerId);
        if (!st || !el) return;
        const data = muat();
        const info = BIDANG[st.bidang];
        const isWaka = st.mode === 'waka';
        const program = daftarTerlihat(st, data);
        if (!program.some(pr => pr.pIdx === st.pilih)) st.pilih = program.length ? program[0].pIdx : -1;
        const aktif = program.find(pr => pr.pIdx === st.pilih);
        const jumlahDraft = data[st.bidang].program.reduce((n, pr) => n + pr.sub.filter(s => !s.terkirim).length, 0);
        const semuaSub = program.flatMap(pr => pr.sub);
        const rata = semuaSub.length ? Math.round(semuaSub.reduce((a, s) => a + (Number(s.progres) || 0), 0) / semuaSub.length) : 0;
        const foto = data[st.bidang].foto;

        el.innerHTML = `
            <div class="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4 text-xs">
                <div class="grid grid-cols-1 md:grid-cols-[1fr_1.4fr_auto] gap-4 items-start bg-white p-4 rounded-lg border border-slate-200">
                    <div class="space-y-3">
                        <h4 class="text-slate-800 text-sm">Program Kerja <strong>${esc(info.judul)}</strong> :</h4>
                        <select onchange="LaporanWaka.pilihProgram('${containerId}', this.value)" class="w-full md:w-64 border-2 border-blue-400 rounded-lg px-3 py-2 font-semibold text-slate-700 bg-white focus:ring-2 focus:ring-blue-500">
                            ${program.length ? program.map((pr, i) => `<option value="${pr.pIdx}" ${pr.pIdx === st.pilih ? 'selected' : ''}>${i + 1}. ${esc(pr.nama)}</option>`).join('') : '<option>PROGRAM KERJA</option>'}
                        </select>
                        <p class="text-slate-500">${program.length} program &middot; ${semuaSub.length} sub program &middot; rata-rata progres <strong class="text-slate-800">${rata}%</strong></p>
                        ${isWaka ? `
                        <div class="flex flex-wrap gap-2">
                            <button onclick="LaporanWaka.formProgram('${containerId}', null)" class="bg-white border border-blue-600 text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded font-medium"><i class="fa-solid fa-folder-plus mr-1"></i> Tambah Program</button>
                            <button onclick="LaporanWaka.kirim('${containerId}')" class="${jumlahDraft ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-300 cursor-not-allowed'} text-white px-3 py-1.5 rounded font-medium" ${jumlahDraft ? '' : 'disabled'}><i class="fa-solid fa-paper-plane mr-1"></i> Kirim ke Kepala Sekolah${jumlahDraft ? ` (${jumlahDraft})` : ''}</button>
                        </div>` : ''}
                    </div>
                    <ol class="space-y-1 text-[13px] border border-slate-300 rounded p-3 bg-white">
                        ${program.length ? program.map((pr, i) => `
                            <li><button onclick="LaporanWaka.pilihProgram('${containerId}', ${pr.pIdx})" class="text-left hover:underline ${pr.pIdx === st.pilih ? 'text-rose-700 font-bold' : 'text-slate-700'}">${i + 1}. ${esc(pr.nama)}</button>
                            ${isWaka && pr.sub.some(s => !s.terkirim) ? '<span class="text-[10px] bg-amber-100 text-amber-800 px-1.5 rounded ml-1">Draft</span>' : ''}</li>`).join('')
                            : '<li class="text-slate-400">Belum ada program kerja yang dikirim.</li>'}
                    </ol>
                    <div class="flex flex-col items-center gap-1">
                        <div class="w-24 h-28 rounded-xl border-2 border-blue-400 overflow-hidden bg-slate-100 flex items-center justify-center">
                            ${foto ? `<img src="${foto}" alt="Foto ${esc(info.jabatan)}" class="w-full h-full object-cover">` : `<div class="text-center text-slate-400"><i class="fa-solid fa-user-tie text-3xl"></i><span class="block text-[10px] mt-1">Foto</span></div>`}
                        </div>
                        <span class="text-[10px] font-semibold text-slate-600">${esc(info.jabatan)}</span>
                        ${isWaka ? `<label class="text-[10px] text-blue-600 font-medium cursor-pointer hover:underline">Ganti Foto<input type="file" accept="image/*" class="hidden" onchange="LaporanWaka.gantiFoto('${containerId}', this)"></label>` : ''}
                    </div>
                </div>

                ${aktif ? `
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <h5 class="font-bold text-slate-800 text-sm"><i class="fa-solid fa-folder-open text-blue-600 mr-1"></i> ${esc(aktif.nama)} <span class="font-normal text-slate-500">(${aktif.sub.length} sub program)</span></h5>
                    ${isWaka ? `
                    <div class="flex flex-wrap gap-2">
                        <button onclick="LaporanWaka.formSub('${containerId}', ${aktif.pIdx}, null)" class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded font-medium"><i class="fa-solid fa-plus mr-1"></i> Tambah Sub Program</button>
                        <button onclick="LaporanWaka.formProgram('${containerId}', ${aktif.pIdx})" class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded font-medium"><i class="fa-solid fa-pen mr-1"></i> Ubah Nama Program</button>
                        <button onclick="LaporanWaka.hapusProgram('${containerId}', ${aktif.pIdx})" class="bg-slate-100 hover:bg-rose-100 text-rose-700 px-3 py-1.5 rounded font-medium"><i class="fa-solid fa-trash mr-1"></i> Hapus Program</button>
                    </div>` : ''}
                </div>` : ''}

                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse border border-slate-300 min-w-[1100px] bg-white">
                        <thead>
                            <tr class="bg-emerald-100 text-slate-800 font-bold">
                                <th class="${sel}">Sub Program</th>
                                <th class="${sel}">Indikator Kegiatan</th>
                                <th class="${sel}">Jadwal</th>
                                <th class="${sel}">Pelaksana</th>
                                <th class="${sel}">Target</th>
                                <th class="${sel}">Realisasi</th>
                                <th class="${sel}">Progres</th>
                                <th class="${sel}">Kendala</th>
                                <th class="${sel}">Tindak Lanjut</th>
                                <th class="${sel} text-center">Status</th>
                                <th class="${sel} text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${aktif && aktif.sub.length ? aktif.sub.map(s => `
                                <tr class="${s.terkirim ? '' : 'bg-amber-50/60'}">
                                    <td class="${sel} font-medium">${esc(s.nama)}${!s.terkirim ? '<span class="block text-[10px] text-amber-700 font-semibold">Draft, belum dikirim</span>' : ''}</td>
                                    <td class="${sel}">${esc(s.indikator)}</td>
                                    <td class="${sel}">${esc(s.jadwal)}</td>
                                    <td class="${sel}">${esc(s.pelaksana)}</td>
                                    <td class="${sel}">${esc(s.target)}</td>
                                    <td class="${sel}">${esc(s.realisasi)}</td>
                                    <td class="${sel}">
                                        <span class="font-semibold">${Number(s.progres) || 0} %</span>
                                        <div class="w-14 bg-slate-200 rounded-full h-1.5 mt-1"><div class="h-1.5 rounded-full ${warnaProgres(Number(s.progres) || 0)}" style="width:${Math.min(100, Number(s.progres) || 0)}%"></div></div>
                                    </td>
                                    <td class="${sel} ${s.kendala && s.kendala !== '-' ? 'text-rose-600' : ''}">${esc(s.kendala)}</td>
                                    <td class="${sel} font-semibold text-purple-700">${esc(s.tindakLanjut)}</td>
                                    <td class="${sel} text-center"><span class="${WARNA_STATUS[s.status] || WARNA_STATUS['Belum Mulai']} px-2 py-0.5 rounded font-medium whitespace-nowrap">${esc(s.status)}</span></td>
                                    <td class="${sel} text-center whitespace-nowrap">
                                        <button onclick="LaporanWaka.detail('${containerId}', ${aktif.pIdx}, ${s.sIdx})" class="text-blue-600 font-semibold underline">Lihat Detail</button>
                                        <div class="mt-1 space-x-2 text-slate-500">
                                            ${(s.lampiran || []).length ? `<span title="${s.lampiran.length} lampiran"><i class="fa-solid fa-paperclip"></i> ${s.lampiran.length}</span>` : ''}
                                            ${s.catatanKS ? '<i class="fa-solid fa-comment-dots text-purple-500" title="Ada catatan Kepala Sekolah"></i>' : ''}
                                            ${isWaka ? `
                                                <button onclick="LaporanWaka.formSub('${containerId}', ${aktif.pIdx}, ${s.sIdx})" class="hover:text-blue-600" title="Ubah"><i class="fa-solid fa-pen"></i></button>
                                                <button onclick="LaporanWaka.hapusSub('${containerId}', ${aktif.pIdx}, ${s.sIdx})" class="hover:text-rose-600" title="Hapus"><i class="fa-solid fa-trash"></i></button>` : ''}
                                        </div>
                                    </td>
                                </tr>`).join('') : `<tr><td colspan="11" class="${sel} text-center text-slate-400 py-6">${aktif ? 'Belum ada sub program. ' + (isWaka ? 'Klik "Tambah Sub Program".' : '') : 'Belum ada program kerja.'}</td></tr>`}
                        </tbody>
                    </table>
                </div>
                ${isWaka ? '<p class="text-[11px] text-slate-500 italic"><i class="fa-solid fa-circle-info mr-1"></i>Sub program baru atau yang diubah tersimpan sebagai draft. Klik "Kirim ke Kepala Sekolah" agar tampil di menu Laporan pada dashboard Kepala Sekolah.</p>' : ''}
            </div>`;
    }

    function pilihProgram(containerId, pIdx) {
        instans[containerId].pilih = Number(pIdx);
        gambar(containerId);
    }

    // ---------- Program ----------
    const kelasInput = 'w-full border border-slate-300 rounded px-2 py-1.5 focus:ring-2 focus:ring-blue-500 focus:outline-none';

    function formProgram(containerId, pIdx) {
        const pr = pIdx == null ? null : muat()[instans[containerId].bidang].program[pIdx];
        bukaModal(pr ? 'Ubah Nama Program' : 'Tambah Program Kerja - ' + BIDANG[instans[containerId].bidang].jabatan, `
            <form onsubmit="event.preventDefault(); LaporanWaka.simpanProgram('${containerId}', ${pIdx == null ? 'null' : pIdx}, this)" class="space-y-3">
                <label class="block"><span class="font-semibold block mb-1">Nama Program *</span><input name="nama" required value="${esc(pr ? pr.nama : '')}" placeholder="Contoh: Program PPDB" class="${kelasInput}"></label>
                ${pr ? '' : '<p class="text-slate-500">Setelah program dibuat, tambahkan sub program beserta indikator, jadwal, pelaksana, dan capaiannya.</p>'}
                <div class="flex justify-end gap-2 pt-2 border-t">
                    <button type="button" onclick="LaporanWaka.tutup()" class="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded font-medium">Batal</button>
                    <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium"><i class="fa-solid fa-floppy-disk mr-1"></i> Simpan</button>
                </div>
            </form>`);
    }

    function simpanProgram(containerId, pIdx, form) {
        const data = muat();
        const daftar = data[instans[containerId].bidang].program;
        const nama = new FormData(form).get('nama').trim();
        if (pIdx == null) { daftar.push({ nama, sub: [] }); instans[containerId].pilih = daftar.length - 1; }
        else daftar[pIdx].nama = nama;
        if (!simpan(data)) alert('Penyimpanan browser tidak tersedia; perubahan hanya tampil sampai halaman ditutup.');
        tutup();
        gambar(containerId);
        if (pIdx == null) formSub(containerId, daftar.length - 1, null);
    }

    function hapusProgram(containerId, pIdx) {
        const data = muat();
        const daftar = data[instans[containerId].bidang].program;
        const pr = daftar[pIdx];
        if (!confirm(`Hapus program "${pr.nama}" beserta ${pr.sub.length} sub programnya?`)) return;
        daftar.splice(pIdx, 1);
        simpan(data);
        instans[containerId].pilih = 0;
        gambar(containerId);
    }

    // ---------- Sub program ----------
    function formSub(containerId, pIdx, sIdx) {
        const pr = muat()[instans[containerId].bidang].program[pIdx];
        const v = sIdx == null
            ? { nama: '', indikator: '', jadwal: '', pelaksana: BIDANG[instans[containerId].bidang].jabatan, target: '', realisasi: '', progres: 0, kendala: '', tindakLanjut: '', status: 'Berjalan' }
            : pr.sub[sIdx];
        bukaModal((sIdx == null ? 'Tambah Sub Program' : 'Ubah Sub Program') + ' - ' + pr.nama, `
            <form onsubmit="event.preventDefault(); LaporanWaka.simpanSub('${containerId}', ${pIdx}, ${sIdx == null ? 'null' : sIdx}, this)" class="space-y-3">
                <label class="block"><span class="font-semibold block mb-1">Nama Sub Program *</span><input name="nama" required value="${esc(v.nama)}" placeholder="Contoh: Persiapan PPDB" class="${kelasInput}"></label>
                <label class="block"><span class="font-semibold block mb-1">Indikator Kegiatan *</span><textarea name="indikator" required rows="2" class="${kelasInput}" placeholder="Contoh: Mensosialisasikan program PPDB ke panitia PPDB">${esc(v.indikator)}</textarea></label>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label class="block"><span class="font-semibold block mb-1">Jadwal *</span><input name="jadwal" required value="${esc(v.jadwal)}" placeholder="Contoh: Juli 2026" class="${kelasInput}"></label>
                    <label class="block"><span class="font-semibold block mb-1">Pelaksana *</span><input name="pelaksana" required value="${esc(v.pelaksana)}" placeholder="Contoh: Waka Kesiswaan & Tim PPDB" class="${kelasInput}"></label>
                </div>
                <label class="block"><span class="font-semibold block mb-1">Target *</span><textarea name="target" required rows="2" class="${kelasInput}" placeholder="Contoh: Memperoleh 150 siswa Tahun ajaran 2026 - 2027">${esc(v.target)}</textarea></label>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <label class="block"><span class="font-semibold block mb-1">Realisasi</span><input name="realisasi" value="${esc(v.realisasi)}" placeholder="Contoh: 20 % / 8 SMP" class="${kelasInput}"></label>
                    <label class="block"><span class="font-semibold block mb-1">Progres (%)</span><input name="progres" type="number" min="0" max="100" value="${Number(v.progres) || 0}" class="${kelasInput}"></label>
                    <label class="block"><span class="font-semibold block mb-1">Status</span><select name="status" class="${kelasInput}">${STATUS.map(s => `<option ${s === v.status ? 'selected' : ''}>${s}</option>`).join('')}</select></label>
                </div>
                <label class="block"><span class="font-semibold block mb-1">Kendala</span><textarea name="kendala" rows="2" class="${kelasInput}" placeholder="Hambatan yang dihadapi">${esc(v.kendala)}</textarea></label>
                <label class="block"><span class="font-semibold block mb-1">Tindak Lanjut</span><input name="tindakLanjut" value="${esc(v.tindakLanjut)}" placeholder="Contoh: Evaluasi promosi, pendekatan ke SMP" class="${kelasInput}"></label>
                <div class="flex justify-end gap-2 pt-2 border-t">
                    <button type="button" onclick="LaporanWaka.tutup()" class="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded font-medium">Batal</button>
                    <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium"><i class="fa-solid fa-floppy-disk mr-1"></i> Simpan Draft</button>
                </div>
            </form>`);
    }

    function simpanSub(containerId, pIdx, sIdx, form) {
        const data = muat();
        const daftar = data[instans[containerId].bidang].program[pIdx].sub;
        const f = new FormData(form);
        const lama = sIdx == null ? null : daftar[sIdx];
        const baru = {
            nama: f.get('nama').trim(),
            indikator: f.get('indikator').trim(),
            jadwal: f.get('jadwal').trim(),
            pelaksana: f.get('pelaksana').trim(),
            target: f.get('target').trim(),
            realisasi: f.get('realisasi').trim() || '-',
            progres: Math.max(0, Math.min(100, Number(f.get('progres')) || 0)),
            kendala: f.get('kendala').trim() || '-',
            tindakLanjut: f.get('tindakLanjut').trim() || '-',
            status: f.get('status'),
            terkirim: false,
            catatanKS: lama ? lama.catatanKS : '',
            lampiran: lama ? (lama.lampiran || []) : []
        };
        if (sIdx == null) daftar.push(baru); else daftar[sIdx] = baru;
        if (!simpan(data)) alert('Penyimpanan browser tidak tersedia; perubahan hanya tampil sampai halaman ditutup.');
        instans[containerId].pilih = pIdx;
        tutup();
        gambar(containerId);
    }

    function hapusSub(containerId, pIdx, sIdx) {
        const data = muat();
        const daftar = data[instans[containerId].bidang].program[pIdx].sub;
        if (!confirm('Hapus sub program "' + daftar[sIdx].nama + '"?')) return;
        daftar.splice(sIdx, 1);
        simpan(data);
        gambar(containerId);
    }

    function kirim(containerId) {
        const data = muat();
        let jumlah = 0;
        data[instans[containerId].bidang].program.forEach(pr => pr.sub.forEach(s => { if (!s.terkirim) { s.terkirim = true; jumlah++; } }));
        if (!jumlah) return;
        simpan(data);
        gambar(containerId);
        alert(jumlah + ' sub program terkirim ke Kepala Sekolah dan tampil di menu Laporan.');
    }

    // ---------- Detail ----------
    function ambilSub(containerId, pIdx, sIdx) {
        return muat()[instans[containerId].bidang].program[pIdx].sub[sIdx];
    }

    function detail(containerId, pIdx, sIdx) {
        const st = instans[containerId];
        const pr = muat()[st.bidang].program[pIdx];
        const s = pr.sub[sIdx];
        const baris = (label, isi) => `<div class="grid grid-cols-3 gap-2 border-b border-slate-100 pb-2"><span class="text-slate-500">${label}</span><span class="col-span-2 font-medium">${isi}</span></div>`;
        const catatan = st.mode === 'kepsek'
            ? `<div class="bg-purple-50 border border-purple-200 rounded p-3 space-y-2">
                    <span class="font-bold text-purple-800 uppercase text-[10px]">Catatan / Arahan Kepala Sekolah</span>
                    <textarea id="lwCatatan" rows="3" class="w-full border border-purple-300 rounded px-2 py-1.5" placeholder="Tulis arahan untuk ${esc(BIDANG[st.bidang].jabatan)}...">${esc(s.catatanKS)}</textarea>
                    <button onclick="LaporanWaka.simpanCatatan('${containerId}', ${pIdx}, ${sIdx})" class="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded font-medium">Simpan Catatan</button>
               </div>`
            : `<div class="bg-purple-50 border border-purple-200 rounded p-3">
                    <span class="font-bold text-purple-800 uppercase text-[10px] block mb-1">Catatan / Arahan Kepala Sekolah</span>
                    <p>${s.catatanKS ? esc(s.catatanKS) : '<span class="text-slate-400">Belum ada catatan.</span>'}</p>
               </div>`;
        bukaModal(s.nama, `
            ${baris('Program', esc(pr.nama))}
            ${baris('Bidang', esc(BIDANG[st.bidang].jabatan))}
            ${baris('Indikator Kegiatan', esc(s.indikator))}
            ${baris('Jadwal', esc(s.jadwal))}
            ${baris('Pelaksana', esc(s.pelaksana))}
            ${baris('Target', esc(s.target))}
            ${baris('Realisasi', esc(s.realisasi))}
            ${baris('Progres', (Number(s.progres) || 0) + ' %')}
            ${baris('Kendala', esc(s.kendala))}
            ${baris('Tindak Lanjut', esc(s.tindakLanjut))}
            ${baris('Status', `<span class="${WARNA_STATUS[s.status]} px-2 py-0.5 rounded">${esc(s.status)}</span> ${s.terkirim ? '<span class="text-emerald-700">&middot; Terkirim ke Kepala Sekolah</span>' : '<span class="text-amber-700">&middot; Draft</span>'}`)}
            ${lampiranHtml(containerId, pIdx, sIdx, s, st.mode === 'waka')}
            ${catatan}
            <div class="flex justify-end gap-2 pt-2 border-t">
                <button onclick="alert('Mengunduh laporan sub program (PDF/Excel).')" class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded font-medium"><i class="fa-solid fa-download mr-1"></i> Download PDF / Excel</button>
                <button onclick="LaporanWaka.tutup()" class="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded font-medium">Tutup</button>
            </div>`);
    }

    function simpanCatatan(containerId, pIdx, sIdx) {
        const data = muat();
        data[instans[containerId].bidang].program[pIdx].sub[sIdx].catatanKS = document.getElementById('lwCatatan').value.trim();
        simpan(data);
        tutup();
        gambar(containerId);
    }

    // ---------- Lampiran laporan detail ----------
    function lampiranHtml(containerId, pIdx, sIdx, s, bisaUbah) {
        const daftar = s.lampiran || [];
        return `
            <div class="border border-slate-200 rounded p-3 space-y-2">
                <div class="flex justify-between items-center gap-2">
                    <span class="font-bold text-slate-700 uppercase text-[10px]"><i class="fa-solid fa-paperclip mr-1"></i> Lampiran Laporan Detail (${daftar.length})</span>
                    ${bisaUbah ? `<label class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded font-medium cursor-pointer whitespace-nowrap">
                        <i class="fa-solid fa-upload mr-1"></i> Unggah File
                        <input type="file" multiple accept="${FORMAT_DITERIMA}" class="hidden" onchange="LaporanWaka.unggahLampiran('${containerId}', ${pIdx}, ${sIdx}, this)">
                    </label>` : ''}
                </div>
                ${daftar.length ? `<ul class="divide-y divide-slate-100">${daftar.map((f, i) => `
                    <li class="flex items-center justify-between gap-2 py-2">
                        <div class="flex items-center gap-2 min-w-0">
                            <i class="fa-solid ${ikonFile(f.nama)} text-lg"></i>
                            <div class="min-w-0">
                                <span class="font-medium block truncate">${esc(f.nama)}</span>
                                <span class="text-slate-400">${ukuranTeks(f.ukuran)} &middot; ${esc(f.tanggal)}${f.data ? '' : f.besar ? ' &middot; <i>terlalu besar, hanya nama file</i>' : ' &middot; <i>contoh</i>'}</span>
                            </div>
                        </div>
                        <div class="flex items-center gap-3 whitespace-nowrap">
                            <button onclick="LaporanWaka.unduhLampiran('${containerId}', ${pIdx}, ${sIdx}, ${i})" class="text-blue-600 font-medium"><i class="fa-solid fa-download mr-1"></i>Unduh</button>
                            ${bisaUbah ? `<button onclick="LaporanWaka.hapusLampiran('${containerId}', ${pIdx}, ${sIdx}, ${i})" class="text-slate-500 hover:text-rose-600" title="Hapus"><i class="fa-solid fa-trash"></i></button>` : ''}
                        </div>
                    </li>`).join('')}</ul>`
                : `<p class="text-slate-400">${bisaUbah ? 'Belum ada lampiran. Unggah laporan detail sesuai format sekolah (PDF, Word, Excel, PowerPoint, atau gambar).' : 'Waka belum melampirkan file laporan detail.'}</p>`}
            </div>`;
    }

    function unggahLampiran(containerId, pIdx, sIdx, input) {
        const files = [...(input.files || [])];
        if (!files.length) return;
        const tanggal = new Date().toISOString().slice(0, 10);
        let besar = 0;
        Promise.all(files.map(file => new Promise(resolve => {
            if (file.size > MAKS_UKURAN_SIMPAN) { besar++; return resolve({ nama: file.name, ukuran: file.size, tanggal, data: '', besar: true }); }
            const reader = new FileReader();
            reader.onload = () => resolve({ nama: file.name, ukuran: file.size, tanggal, data: reader.result });
            reader.onerror = () => resolve({ nama: file.name, ukuran: file.size, tanggal, data: '' });
            reader.readAsDataURL(file);
        }))).then(hasil => {
            const data = muat();
            const s = data[instans[containerId].bidang].program[pIdx].sub[sIdx];
            s.lampiran = (s.lampiran || []).concat(hasil);
            if (!simpan(data)) {
                // Penyimpanan penuh: simpan nama file saja
                hasil.forEach(f => { f.data = ''; f.besar = true; });
                besar = hasil.length;
                if (!simpan(data)) { alert('Lampiran gagal disimpan: penyimpanan browser penuh.'); return; }
            }
            if (besar) alert(besar + ' file terlalu besar untuk prototype ini, jadi hanya nama filenya yang dicatat. Pada sistem asli file akan diunggah ke server.');
            detail(containerId, pIdx, sIdx);
            gambar(containerId);
        });
    }

    function unduhLampiran(containerId, pIdx, sIdx, i) {
        const f = (ambilSub(containerId, pIdx, sIdx).lampiran || [])[i];
        if (!f) return;
        if (!f.data) { alert('"' + f.nama + '" ' + (f.besar ? 'terlalu besar untuk disimpan di prototype ini' : 'adalah file contoh') + ', jadi isinya tidak tersedia untuk diunduh.'); return; }
        const a = document.createElement('a');
        a.href = f.data;
        a.download = f.nama;
        document.body.appendChild(a);
        a.click();
        a.remove();
    }

    function hapusLampiran(containerId, pIdx, sIdx, i) {
        const data = muat();
        const s = data[instans[containerId].bidang].program[pIdx].sub[sIdx];
        if (!confirm('Hapus lampiran "' + s.lampiran[i].nama + '"?')) return;
        s.lampiran.splice(i, 1);
        simpan(data);
        detail(containerId, pIdx, sIdx);
        gambar(containerId);
    }

    // ---------- Foto waka ----------
    function gantiFoto(containerId, input) {
        const file = input.files && input.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const img = new Image();
            img.onload = () => {
                // Perkecil foto agar muat di penyimpanan browser
                const skala = Math.min(1, 240 / Math.max(img.width, img.height));
                const c = document.createElement('canvas');
                c.width = Math.round(img.width * skala);
                c.height = Math.round(img.height * skala);
                c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
                const data = muat();
                data[instans[containerId].bidang].foto = c.toDataURL('image/jpeg', 0.8);
                if (!simpan(data)) alert('Foto tidak dapat disimpan di penyimpanan browser.');
                gambar(containerId);
            };
            img.src = reader.result;
        };
        reader.readAsDataURL(file);
    }

    window.LaporanWaka = {
        render, pilihProgram, formProgram, simpanProgram, hapusProgram, formSub, simpanSub, hapusSub, kirim,
        detail, simpanCatatan, unggahLampiran, unduhLampiran, hapusLampiran, gantiFoto, tutup
    };
})();
