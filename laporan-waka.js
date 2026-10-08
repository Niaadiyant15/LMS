// =====================================================================
// Laporan Kerja Waka ke Kepala Sekolah (dipakai bersama oleh halaman
// depkur, kesiswaan, waka humas, sarpras, dan kepala sekolah).
//
// Prototype: data disimpan di localStorage browser supaya program kerja
// yang ditambahkan/dikirim waka bisa langsung terlihat di halaman Kepala
// Sekolah (selama dibuka di browser & alamat yang sama).
// =====================================================================
(function () {
    const STORAGE_KEY = 'lms_laporan_waka_v1';

    const BIDANG = {
        kurikulum: { judul: 'Laporan Kerja Wakil Kurikulum', jabatan: 'Waka Kurikulum' },
        kesiswaan: { judul: 'Laporan Kerja Wakil Kesiswaan', jabatan: 'Waka Kesiswaan' },
        humas: { judul: 'Laporan Kerja Wakil Hubungan Industri / HUBIN', jabatan: 'Waka Humas / Hubin' },
        sarpras: { judul: 'Laporan Kerja Wakil Sarana Prasarana', jabatan: 'Waka Sarpras' },
        keuangan: { judul: 'Laporan Kerja Bendahara / Keuangan Sekolah', jabatan: 'Bendahara' }
    };

    const STATUS = ['Belum Mulai', 'Berjalan', 'Selesai', 'Tertunda'];
    const WARNA_STATUS = {
        'Belum Mulai': 'bg-slate-100 text-slate-700',
        'Berjalan': 'bg-emerald-100 text-emerald-800',
        'Selesai': 'bg-blue-100 text-blue-800',
        'Tertunda': 'bg-amber-100 text-amber-800'
    };

    const p = (nama, target, realisasi, progres, kendala, tindakLanjut, status) =>
        ({ nama, target, realisasi, progres, kendala, tindakLanjut, status, terkirim: true, catatanKS: '' });

    const DATA_AWAL = {
        kurikulum: [
            p('Raker Persiapan Mengajar', '100 % Guru Mempersiapkan bahan ajar / Modul Deep Learning', '85 %', 85, 'Masih ada guru pemula yang belum menguasai pembuatan modul', 'PIGP', 'Berjalan'),
            p('Induksi Guru Pemula', '100 % guru pemula mengikuti program induksi & pendampingan mentor', '4 dari 5 guru', 80, 'Jadwal mentor bentrok dengan jam mengajar', 'Pendampingan dijadwalkan tiap Sabtu', 'Berjalan'),
            p('Hasil Penelaahan Modul Deep Learning', '100 % modul ajar guru ditelaah & disetujui', '30 dari 38 modul', 79, '8 modul masih perlu revisi asesmen', 'Klinik modul bersama tim kurikulum', 'Berjalan'),
            p('Hasil Kegiatan STS', 'STS terlaksana 100 % dengan ketuntasan minimal 85 %', 'Persiapan soal', 20, 'Masih ada guru yang terlambat menyerahkan soal', 'Pengingat tenggat soal ke guru mapel', 'Berjalan'),
            p('Hasil Kegiatan SAS', 'SAS terlaksana 100 % sesuai kalender akademik', '-', 0, '-', '-', 'Belum Mulai'),
            p('Hasil Kegiatan TKA', '100 % siswa kelas XII mengikuti simulasi TKA', '2 dari 5 sesi', 40, 'Kapasitas lab komputer terbatas', 'Sesi simulasi bergilir per rombel', 'Berjalan')
        ],
        kesiswaan: [
            p('Pembinaan Kedisiplinan & Tata Tertib', '100 % siswa menaati tata tertib & tingkat kehadiran 95 %', '92 %', 92, 'Beberapa siswa terlambat datang ke sekolah', 'Home Visit & BK', 'Berjalan'),
            p('Perkembangan Karakter Peserta Didik', 'Pembiasaan pagi (literasi & ibadah) di seluruh kelas', '34 dari 36 kelas', 94, '2 kelas belum konsisten', 'Monitoring oleh wali kelas', 'Berjalan'),
            p('Ekstrakurikuler & OSIS', '12 ekskul aktif & program kerja OSIS terlaksana', '11 ekskul aktif', 90, 'Pembina ekskul robotik belum tersedia', 'Kerja sama pelatih dari IDUKA', 'Berjalan'),
            p('Peran Konseling (BK) & Wali Kelas', 'Seluruh kasus pelanggaran sedang tertangani < 7 hari', '15 dari 16 kasus', 94, '1 kasus menunggu kehadiran orang tua', 'Panggilan orang tua ke-2', 'Berjalan')
        ],
        humas: [
            p('Kemitraan IDUKA', 'Kerja sama dengan 30 Perusahaan IT/DUDI', '24 Mitra', 80, 'Penyesuaian jadwal industri dengan kalender akademik', 'MoU Lanjutan', 'Berjalan'),
            p('Penempatan PKL Siswa', '100 % siswa kelas XI ditempatkan PKL', '162 dari 170 siswa', 95, '8 siswa belum memenuhi syarat kedisiplinan', 'Koordinasi dengan Waka Kesiswaan', 'Berjalan'),
            p('Kerja Sama Masyarakat Luas', 'Minimal 2 kegiatan bersama masyarakat per semester', '1 kegiatan', 50, 'Menunggu jadwal kelurahan', 'Bakti sosial November', 'Berjalan'),
            p('Jejaring Alumni & Tracer Study', 'Tracer study 80 % alumni angkatan 2025', '62 %', 78, 'Kontak alumni banyak yang berubah', 'Sebar formulir via grup angkatan', 'Berjalan')
        ],
        sarpras: [
            p('Stok Opname Inventaris Laboratorium', '100 % perangkat lab komputer & praktik terdata dan siap pakai', '33 Unit', 94, '2 Unit PC memerlukan penggantian sparepart', 'Perbaikan Teknisi', 'Berjalan'),
            p('Stok Opname Inventaris Non Laboratorium', '100 % aset ruang kelas & fasilitas umum terdata', '410 dari 450 item', 91, 'Label aset lama banyak yang hilang', 'Cetak ulang label QR aset', 'Berjalan'),
            p('Pendataan Ruang Sekolah', 'Data seluruh ruang (kapasitas, kondisi, fasilitas) mutakhir', '42 dari 42 ruang', 100, '-', 'Sinkron ke Dapodik', 'Selesai')
        ],
        keuangan: [
            p('Administrasi Keuangan Siswa', '100% Validasi administrasi siswa semester ganjil', '90 % Lunas', 90, '124 Siswa mengajukan surat perjanjian keringanan', 'Validasi Cicilan', 'Selesai')
        ]
    };

    // ---------- Penyimpanan ----------
    function muat() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const data = JSON.parse(raw);
                Object.keys(DATA_AWAL).forEach(k => { if (!data[k]) data[k] = { program: DATA_AWAL[k], foto: '' }; });
                return data;
            }
        } catch (e) { /* storage tidak tersedia: pakai data awal */ }
        const data = {};
        Object.keys(DATA_AWAL).forEach(k => data[k] = { program: JSON.parse(JSON.stringify(DATA_AWAL[k])), foto: '' });
        return data;
    }

    function simpan(data) {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); return true; }
        catch (e) { return false; }
    }

    // ---------- Util ----------
    const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const sel = 'p-2.5 border border-slate-200 align-top';

    // ---------- Modal (disuntikkan sekali per halaman) ----------
    function pastikanModal() {
        if (document.getElementById('lwModal')) return;
        const m = document.createElement('div');
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

    function bukaModal(judul, html) {
        pastikanModal();
        document.getElementById('lwModalJudul').innerText = judul;
        document.getElementById('lwModalIsi').innerHTML = html;
        document.getElementById('lwModal').classList.remove('hidden');
    }

    function tutup() {
        const m = document.getElementById('lwModal');
        if (m) m.classList.add('hidden');
    }

    // ---------- Render utama ----------
    // opsi.mode: 'waka' (bisa tambah/edit/kirim) atau 'kepsek' (hanya program terkirim + catatan)
    const instans = {};

    function render(containerId, bidang, opsi) {
        instans[containerId] = { bidang, mode: (opsi && opsi.mode) || 'waka', filter: 'semua' };
        gambar(containerId);
    }

    function gambar(containerId) {
        const st = instans[containerId];
        const el = document.getElementById(containerId);
        if (!st || !el) return;
        const data = muat();
        const info = BIDANG[st.bidang];
        const isWaka = st.mode === 'waka';
        const semua = data[st.bidang].program.map((pr, i) => ({ ...pr, idx: i }));
        const terlihat = isWaka ? semua : semua.filter(pr => pr.terkirim);
        const ditampilkan = st.filter === 'semua' ? terlihat : terlihat.filter(pr => String(pr.idx) === st.filter);
        const jumlahDraft = semua.filter(pr => !pr.terkirim).length;
        const rataProgres = terlihat.length ? Math.round(terlihat.reduce((a, b) => a + Number(b.progres || 0), 0) / terlihat.length) : 0;
        const foto = data[st.bidang].foto;

        el.innerHTML = `
            <div class="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4 text-xs">
                <div class="grid grid-cols-1 md:grid-cols-[1fr_1.4fr_auto] gap-4 items-start bg-white p-4 rounded-lg border border-slate-200">
                    <div class="space-y-3">
                        <h4 class="font-bold text-slate-800 text-sm">${esc(info.judul)} :</h4>
                        <label class="block">
                            <span class="sr-only">Program Kerja</span>
                            <select onchange="LaporanWaka.filter('${containerId}', this.value)" class="w-full md:w-60 border-2 border-blue-400 rounded-lg px-3 py-2 font-semibold text-slate-700 bg-white focus:ring-2 focus:ring-blue-500">
                                <option value="semua">PROGRAM KERJA (Semua)</option>
                                ${terlihat.map(pr => `<option value="${pr.idx}" ${st.filter === String(pr.idx) ? 'selected' : ''}>${esc(pr.nama)}</option>`).join('')}
                            </select>
                        </label>
                        <p class="text-slate-500">Rata-rata progres: <strong class="text-slate-800">${rataProgres}%</strong> &middot; ${terlihat.length} program</p>
                        ${isWaka ? `
                        <div class="flex flex-wrap gap-2">
                            <button onclick="LaporanWaka.formTambah('${containerId}')" class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded font-medium"><i class="fa-solid fa-plus mr-1"></i> Tambah Program Kerja</button>
                            <button onclick="LaporanWaka.kirim('${containerId}')" class="${jumlahDraft ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-300 cursor-not-allowed'} text-white px-3 py-1.5 rounded font-medium" ${jumlahDraft ? '' : 'disabled'}><i class="fa-solid fa-paper-plane mr-1"></i> Kirim ke Kepala Sekolah${jumlahDraft ? ` (${jumlahDraft})` : ''}</button>
                        </div>` : ''}
                    </div>
                    <ol class="list-decimal list-inside space-y-1 text-slate-700 text-[13px] border border-slate-300 rounded p-3 bg-white">
                        ${terlihat.length ? terlihat.map(pr => `<li>${esc(pr.nama)}${!pr.terkirim ? ' <span class="text-[10px] bg-amber-100 text-amber-800 px-1.5 rounded">Draft</span>' : ''}</li>`).join('') : '<li class="list-none text-slate-400">Belum ada program kerja yang dikirim.</li>'}
                    </ol>
                    <div class="flex flex-col items-center gap-1">
                        <div class="w-24 h-28 rounded-xl border-2 border-blue-400 overflow-hidden bg-slate-100 flex items-center justify-center">
                            ${foto ? `<img src="${foto}" alt="Foto ${esc(info.jabatan)}" class="w-full h-full object-cover">` : `<div class="text-center text-slate-400"><i class="fa-solid fa-user-tie text-3xl"></i><span class="block text-[10px] mt-1">Foto</span></div>`}
                        </div>
                        <span class="text-[10px] font-semibold text-slate-600">${esc(info.jabatan)}</span>
                        ${isWaka ? `<label class="text-[10px] text-blue-600 font-medium cursor-pointer hover:underline">Ganti Foto<input type="file" accept="image/*" class="hidden" onchange="LaporanWaka.gantiFoto('${containerId}', this)"></label>` : ''}
                    </div>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse border border-slate-200 min-w-[760px]">
                        <thead>
                            <tr class="bg-emerald-100 text-slate-800 font-bold">
                                <th class="${sel}">Program</th>
                                <th class="${sel}">Target</th>
                                <th class="${sel}">Realisasi</th>
                                <th class="${sel}">Progres</th>
                                <th class="${sel}">Kendala</th>
                                <th class="${sel}">Tindak Lanjut</th>
                                <th class="${sel} text-center">Status</th>
                                <th class="${sel} text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white">
                            ${ditampilkan.length ? ditampilkan.map(pr => `
                                <tr class="${pr.terkirim ? '' : 'bg-amber-50/60'}">
                                    <td class="${sel} font-medium">${esc(pr.nama)}${!pr.terkirim ? '<span class="block text-[10px] text-amber-700 font-semibold">Draft, belum dikirim</span>' : ''}</td>
                                    <td class="${sel}">${esc(pr.target)}</td>
                                    <td class="${sel}">${esc(pr.realisasi)}</td>
                                    <td class="${sel}">
                                        <span class="font-semibold">${Number(pr.progres) || 0} %</span>
                                        <div class="w-16 bg-slate-200 rounded-full h-1.5 mt-1"><div class="h-1.5 rounded-full ${Number(pr.progres) >= 80 ? 'bg-emerald-500' : Number(pr.progres) >= 50 ? 'bg-amber-500' : 'bg-rose-500'}" style="width:${Math.min(100, Number(pr.progres) || 0)}%"></div></div>
                                    </td>
                                    <td class="${sel} ${pr.kendala && pr.kendala !== '-' ? 'text-rose-600' : ''}">${esc(pr.kendala)}</td>
                                    <td class="${sel} font-semibold text-purple-700">${esc(pr.tindakLanjut)}</td>
                                    <td class="${sel} text-center"><span class="${WARNA_STATUS[pr.status] || WARNA_STATUS['Belum Mulai']} px-2 py-0.5 rounded font-medium whitespace-nowrap">${esc(pr.status)}</span></td>
                                    <td class="${sel} text-center whitespace-nowrap">
                                        <button onclick="LaporanWaka.detail('${containerId}', ${pr.idx})" class="text-blue-600 font-semibold underline">Lihat Detail</button>
                                        ${pr.catatanKS ? '<i class="fa-solid fa-comment-dots text-purple-500 ml-1" title="Ada catatan Kepala Sekolah"></i>' : ''}
                                        ${isWaka ? `
                                            <div class="mt-1 space-x-2">
                                                <button onclick="LaporanWaka.formEdit('${containerId}', ${pr.idx})" class="text-slate-600 hover:text-blue-600" title="Ubah"><i class="fa-solid fa-pen"></i></button>
                                                <button onclick="LaporanWaka.hapus('${containerId}', ${pr.idx})" class="text-slate-600 hover:text-rose-600" title="Hapus"><i class="fa-solid fa-trash"></i></button>
                                            </div>` : ''}
                                    </td>
                                </tr>`).join('') : `<tr><td colspan="8" class="${sel} text-center text-slate-400 py-6">Belum ada program kerja.</td></tr>`}
                        </tbody>
                    </table>
                </div>
                ${isWaka ? '<p class="text-[11px] text-slate-500 italic"><i class="fa-solid fa-circle-info mr-1"></i>Program baru tersimpan sebagai draft. Klik "Kirim ke Kepala Sekolah" agar tampil di menu Laporan pada dashboard Kepala Sekolah.</p>' : ''}
            </div>`;
    }

    // ---------- Aksi ----------
    function filter(containerId, nilai) {
        instans[containerId].filter = nilai;
        gambar(containerId);
    }

    function formHtml(containerId, pr, idx) {
        const v = pr || { nama: '', target: '', realisasi: '', progres: 0, kendala: '', tindakLanjut: '', status: 'Berjalan' };
        const input = 'w-full border border-slate-300 rounded px-2 py-1.5 focus:ring-2 focus:ring-blue-500 focus:outline-none';
        return `
            <form onsubmit="event.preventDefault(); LaporanWaka.simpanForm('${containerId}', ${idx == null ? 'null' : idx}, this)" class="space-y-3">
                <label class="block"><span class="font-semibold block mb-1">Nama Program Kerja *</span><input name="nama" required value="${esc(v.nama)}" placeholder="Contoh: Raker Persiapan Mengajar" class="${input}"></label>
                <label class="block"><span class="font-semibold block mb-1">Target *</span><textarea name="target" required rows="2" class="${input}" placeholder="Contoh: 100 % guru mempersiapkan modul ajar">${esc(v.target)}</textarea></label>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <label class="block"><span class="font-semibold block mb-1">Realisasi</span><input name="realisasi" value="${esc(v.realisasi)}" placeholder="Contoh: 85 % / 24 Mitra" class="${input}"></label>
                    <label class="block"><span class="font-semibold block mb-1">Progres (%)</span><input name="progres" type="number" min="0" max="100" value="${Number(v.progres) || 0}" class="${input}"></label>
                    <label class="block"><span class="font-semibold block mb-1">Status</span><select name="status" class="${input}">${STATUS.map(s => `<option ${s === v.status ? 'selected' : ''}>${s}</option>`).join('')}</select></label>
                </div>
                <label class="block"><span class="font-semibold block mb-1">Kendala</span><textarea name="kendala" rows="2" class="${input}" placeholder="Hambatan yang dihadapi">${esc(v.kendala)}</textarea></label>
                <label class="block"><span class="font-semibold block mb-1">Tindak Lanjut</span><input name="tindakLanjut" value="${esc(v.tindakLanjut)}" placeholder="Contoh: PIGP, Home Visit, MoU Lanjutan" class="${input}"></label>
                <div class="flex justify-end gap-2 pt-2 border-t">
                    <button type="button" onclick="LaporanWaka.tutup()" class="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded font-medium">Batal</button>
                    <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium"><i class="fa-solid fa-floppy-disk mr-1"></i> Simpan Draft</button>
                </div>
            </form>`;
    }

    function formTambah(containerId) {
        bukaModal('Tambah Program Kerja - ' + BIDANG[instans[containerId].bidang].jabatan, formHtml(containerId, null, null));
    }

    function formEdit(containerId, idx) {
        const pr = muat()[instans[containerId].bidang].program[idx];
        bukaModal('Ubah Program Kerja', formHtml(containerId, pr, idx));
    }

    function simpanForm(containerId, idx, form) {
        const data = muat();
        const daftar = data[instans[containerId].bidang].program;
        const f = new FormData(form);
        const baru = {
            nama: f.get('nama').trim(),
            target: f.get('target').trim(),
            realisasi: f.get('realisasi').trim() || '-',
            progres: Math.max(0, Math.min(100, Number(f.get('progres')) || 0)),
            kendala: f.get('kendala').trim() || '-',
            tindakLanjut: f.get('tindakLanjut').trim() || '-',
            status: f.get('status'),
            terkirim: false,
            catatanKS: idx == null ? '' : daftar[idx].catatanKS
        };
        if (idx == null) daftar.push(baru); else daftar[idx] = baru;
        if (!simpan(data)) alert('Penyimpanan browser tidak tersedia; perubahan hanya tampil sampai halaman ditutup.');
        tutup();
        gambar(containerId);
    }

    function hapus(containerId, idx) {
        const data = muat();
        const daftar = data[instans[containerId].bidang].program;
        if (!confirm('Hapus program kerja "' + daftar[idx].nama + '"?')) return;
        daftar.splice(idx, 1);
        simpan(data);
        instans[containerId].filter = 'semua';
        gambar(containerId);
    }

    function kirim(containerId) {
        const data = muat();
        const daftar = data[instans[containerId].bidang].program;
        const jumlah = daftar.filter(pr => !pr.terkirim).length;
        if (!jumlah) return;
        daftar.forEach(pr => pr.terkirim = true);
        simpan(data);
        gambar(containerId);
        alert(jumlah + ' program kerja terkirim ke Kepala Sekolah dan tampil di menu Laporan.');
    }

    function detail(containerId, idx) {
        const st = instans[containerId];
        const pr = muat()[st.bidang].program[idx];
        const baris = (label, isi) => `<div class="grid grid-cols-3 gap-2 border-b border-slate-100 pb-2"><span class="text-slate-500">${label}</span><span class="col-span-2 font-medium">${isi}</span></div>`;
        const catatan = st.mode === 'kepsek'
            ? `<div class="bg-purple-50 border border-purple-200 rounded p-3 space-y-2">
                    <span class="font-bold text-purple-800 uppercase text-[10px]">Catatan / Arahan Kepala Sekolah</span>
                    <textarea id="lwCatatan" rows="3" class="w-full border border-purple-300 rounded px-2 py-1.5" placeholder="Tulis arahan untuk ${esc(BIDANG[st.bidang].jabatan)}...">${esc(pr.catatanKS)}</textarea>
                    <button onclick="LaporanWaka.simpanCatatan('${containerId}', ${idx})" class="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded font-medium">Simpan Catatan</button>
               </div>`
            : `<div class="bg-purple-50 border border-purple-200 rounded p-3">
                    <span class="font-bold text-purple-800 uppercase text-[10px] block mb-1">Catatan / Arahan Kepala Sekolah</span>
                    <p>${pr.catatanKS ? esc(pr.catatanKS) : '<span class="text-slate-400">Belum ada catatan.</span>'}</p>
               </div>`;
        bukaModal(pr.nama, `
            ${baris('Bidang', esc(BIDANG[st.bidang].jabatan))}
            ${baris('Target', esc(pr.target))}
            ${baris('Realisasi', esc(pr.realisasi))}
            ${baris('Progres', (Number(pr.progres) || 0) + ' %')}
            ${baris('Kendala', esc(pr.kendala))}
            ${baris('Tindak Lanjut', esc(pr.tindakLanjut))}
            ${baris('Status', `<span class="${WARNA_STATUS[pr.status]} px-2 py-0.5 rounded">${esc(pr.status)}</span> ${pr.terkirim ? '<span class="text-emerald-700">&middot; Terkirim ke Kepala Sekolah</span>' : '<span class="text-amber-700">&middot; Draft</span>'}`)}
            ${catatan}
            <div class="flex justify-end gap-2 pt-2 border-t">
                <button onclick="alert('Mengunduh laporan program kerja (PDF/Excel).')" class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded font-medium"><i class="fa-solid fa-download mr-1"></i> Download PDF / Excel</button>
                <button onclick="LaporanWaka.tutup()" class="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded font-medium">Tutup</button>
            </div>`);
    }

    function simpanCatatan(containerId, idx) {
        const data = muat();
        data[instans[containerId].bidang].program[idx].catatanKS = document.getElementById('lwCatatan').value.trim();
        simpan(data);
        tutup();
        gambar(containerId);
    }

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

    window.LaporanWaka = { render, filter, formTambah, formEdit, simpanForm, hapus, kirim, detail, simpanCatatan, gantiFoto, tutup };
})();
