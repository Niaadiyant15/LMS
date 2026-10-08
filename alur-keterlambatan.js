// =====================================================================
// Alur laporan keterlambatan siswa:
//   Guru Piket (catat & laporkan) -> Guru BK (tindak lanjut) -> Waka Kesiswaan (rekap & tinjau)
// Dipakai oleh piket.html, bk.html, dan kesiswaan.html.
//
// Prototype: data disimpan di localStorage browser agar laporan yang
// dikirim di satu halaman langsung terlihat di halaman berikutnya.
// =====================================================================
(function () {
    const STORAGE_KEY = 'lms_alur_terlambat_v1';
    const HARI_INI = '2026-10-08';

    const TAHAP = {
        dicatat: { label: 'Dicatat Piket', warna: 'bg-slate-100 text-slate-700' },
        bk: { label: 'Diterima BK', warna: 'bg-amber-100 text-amber-800' },
        ditindak: { label: 'Ditindaklanjuti BK', warna: 'bg-blue-100 text-blue-800' },
        kesiswaan: { label: 'Dilaporkan ke Kesiswaan', warna: 'bg-emerald-100 text-emerald-800' }
    };
    const TINDAKAN = ['Teguran lisan', 'Konseling individu', 'Panggilan orang tua', 'Rujuk ke wali kelas', 'Pembinaan kelompok'];
    const BATAS_BERULANG = 3;

    let urut = 100;
    const r = (tanggal, jam, nama, kelas, alasan, tahap, tindakan, catatanBK) =>
        ({ id: ++urut, tanggal, jam, nama, kelas, alasan, tahap, tindakan: tindakan || '', catatanBK: catatanBK || '', piket: 'Guru Piket', ditinjau: tahap === 'kesiswaan' });

    const DATA_AWAL = [
        r('2026-09-28', '07.20', 'Fajar Nugroho', 'X TKJ', 'Bangun kesiangan', 'kesiswaan', 'Teguran lisan', 'Diberi teguran dan diingatkan jam masuk 07.00.'),
        r('2026-09-30', '07.30', 'Fajar Nugroho', 'X TKJ', 'Tidak ada alasan jelas', 'kesiswaan', 'Konseling individu', 'Siswa sering begadang main game. Disepakati target tidur sebelum 22.00.'),
        r('2026-10-01', '07.10', 'Nabila Putri', 'X PPLG', 'Angkot mogok', 'kesiswaan', 'Teguran lisan', 'Keterlambatan pertama, alasan wajar.'),
        r('2026-10-02', '07.35', 'Fajar Nugroho', 'X TKJ', 'Bangun kesiangan', 'kesiswaan', 'Panggilan orang tua', 'Keterlambatan ke-3. Orang tua dipanggil untuk kesepakatan pembinaan di rumah.'),
        r('2026-10-05', '07.25', 'Fajar Nugroho', 'X TKJ', 'Mengantar adik', 'bk'),
        r('2026-10-06', '07.40', 'Dimas Saputra', 'XI AKL 2', 'Tidak ada alasan jelas', 'bk'),
        r('2026-10-08', '07.25', 'Fajar Nugroho', 'X TKJ', 'Bangun kesiangan', 'dicatat'),
        r('2026-10-08', '07.15', 'Dina Larasati', 'X TKJ', 'Ban motor bocor', 'dicatat')
    ];

    // ---------- Penyimpanan ----------
    function muat() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) return JSON.parse(raw);
        } catch (e) { /* storage tidak tersedia */ }
        return JSON.parse(JSON.stringify(DATA_AWAL));
    }
    function simpan(data) {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); return true; } catch (e) { return false; }
    }

    // ---------- Util ----------
    const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const tgl = s => { const [y, m, d] = s.split('-'); return `${Number(d)} ${BULAN[Number(m) - 1]} ${y}`; };
    const badge = tahap => `<span class="${TAHAP[tahap].warna} px-2 py-0.5 rounded font-semibold whitespace-nowrap">${TAHAP[tahap].label}</span>`;
    const td = 'p-2.5 align-top';
    // Jumlah keterlambatan per siswa (semua tahap) untuk penanda "berulang"
    const hitung = data => data.reduce((m, x) => (m[x.nama] = (m[x.nama] || 0) + 1, m), {});
    const tandaBerulang = (n) => n >= BATAS_BERULANG ? `<span class="ml-1 bg-rose-100 text-rose-700 text-[10px] px-1.5 rounded font-semibold">${n}x terlambat</span>` : `<span class="ml-1 text-[10px] text-slate-400">${n}x</span>`;

    const instans = {};
    function gambarUlang() { Object.keys(instans).forEach(id => instans[id]()); }

    // ---------- Modal ----------
    function bukaModal(judul, html) {
        let m = document.getElementById('atModal');
        if (!m) {
            m = document.createElement('div');
            m.id = 'atModal';
            m.className = 'fixed inset-0 bg-slate-900/60 z-[60] hidden flex items-center justify-center p-4';
            m.innerHTML = `<div class="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center border-b pb-3"><h3 id="atModalJudul" class="font-bold text-slate-800 text-base"></h3>
                <button onclick="AlurTerlambat.tutup()" class="text-slate-400 hover:text-slate-600"><i class="fa-solid fa-xmark text-lg"></i></button></div>
                <div id="atModalIsi" class="text-xs text-slate-700 space-y-3"></div></div>`;
            m.addEventListener('click', e => { if (e.target === m) tutup(); });
            document.body.appendChild(m);
        }
        document.getElementById('atModalJudul').innerText = judul;
        document.getElementById('atModalIsi').innerHTML = html;
        m.classList.remove('hidden');
    }
    function tutup() { const m = document.getElementById('atModal'); if (m) m.classList.add('hidden'); }

    const alurBar = aktif => {
        const langkah = [['piket', 'fa-clipboard-user', 'Guru Piket mencatat'], ['bk', 'fa-hand-holding-heart', 'Guru BK menindaklanjuti'], ['kesiswaan', 'fa-user-shield', 'Waka Kesiswaan meninjau']];
        return `<div class="flex flex-wrap items-center gap-2 text-[11px]">${langkah.map(([k, ikon, teks], i) =>
            `${i ? '<i class="fa-solid fa-arrow-right text-slate-300"></i>' : ''}<span class="px-2 py-1 rounded-full border ${k === aktif ? 'bg-slate-800 text-white border-slate-800 font-semibold' : 'bg-white text-slate-500 border-slate-200'}"><i class="fa-solid ${ikon} mr-1"></i>${teks}</span>`).join('')}</div>`;
    };
    const tombolReset = `<button onclick="AlurTerlambat.reset()" class="text-[11px] text-slate-400 hover:text-slate-600 underline">Reset data contoh</button>`;

    // =================== GURU PIKET ===================
    function renderPiket(id) {
        instans[id] = () => {
            const el = document.getElementById(id); if (!el) return;
            const data = muat(); const n = hitung(data);
            const draft = data.filter(x => x.tahap === 'dicatat');
            const riwayat = data.slice().sort((a, b) => (b.tanggal + b.jam).localeCompare(a.tanggal + a.jam));
            el.innerHTML = `
                <div class="space-y-4 text-xs">
                    <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        ${alurBar('piket')}
                        <div class="flex flex-wrap gap-2">
                            <button onclick="AlurTerlambat.formCatat()" class="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded font-medium"><i class="fa-solid fa-plus mr-1"></i> Catat Siswa Terlambat</button>
                            <button onclick="AlurTerlambat.kirimKeBK()" ${draft.length ? '' : 'disabled'} class="${draft.length ? 'bg-rose-600 hover:bg-rose-700' : 'bg-slate-300 cursor-not-allowed'} text-white px-3 py-1.5 rounded font-medium"><i class="fa-solid fa-paper-plane mr-1"></i> Laporkan ke Guru BK${draft.length ? ` (${draft.length})` : ''}</button>
                        </div>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse min-w-[680px]">
                            <thead><tr class="bg-slate-50 text-slate-500 uppercase border-b border-slate-200">
                                <th class="${td}">Tanggal / Jam Datang</th><th class="${td}">Siswa</th><th class="${td}">Alasan</th><th class="${td} text-center">Status Laporan</th><th class="${td} text-center">Aksi</th>
                            </tr></thead>
                            <tbody class="divide-y divide-slate-100">
                                ${riwayat.map(x => `<tr class="${x.tahap === 'dicatat' ? 'bg-amber-50/60' : ''}">
                                    <td class="${td}">${tgl(x.tanggal)}<span class="block text-slate-500">${esc(x.jam)} WIB</span></td>
                                    <td class="${td} font-medium">${esc(x.nama)}${tandaBerulang(n[x.nama])}<span class="block text-slate-400 font-normal">${esc(x.kelas)}</span></td>
                                    <td class="${td}">${esc(x.alasan)}</td>
                                    <td class="${td} text-center">${badge(x.tahap)}</td>
                                    <td class="${td} text-center whitespace-nowrap">${x.tahap === 'dicatat'
                                        ? `<button onclick="alert('Izin masuk kelas untuk ${esc(x.nama)} dicetak.')" class="text-amber-700 font-medium">Izin Masuk</button>
                                           <button onclick="AlurTerlambat.hapus(${x.id})" class="text-slate-500 hover:text-rose-600 ml-2" title="Hapus"><i class="fa-solid fa-trash"></i></button>`
                                        : '<span class="text-slate-400">Terkirim</span>'}</td>
                                </tr>`).join('')}
                            </tbody>
                        </table>
                    </div>
                    <div class="flex justify-between items-center"><p class="text-[11px] text-slate-500 italic"><i class="fa-solid fa-circle-info mr-1"></i>Siswa yang terlambat ${BATAS_BERULANG}x atau lebih ditandai merah agar diprioritaskan BK.</p>${tombolReset}</div>
                </div>`;
        };
        instans[id]();
    }

    function formCatat() {
        const input = 'w-full border border-slate-300 rounded px-2 py-1.5 focus:ring-2 focus:ring-amber-500 focus:outline-none';
        bukaModal('Catat Siswa Terlambat', `
            <form onsubmit="event.preventDefault(); AlurTerlambat.simpanCatat(this)" class="space-y-3">
                <label class="block"><span class="font-semibold block mb-1">Nama Siswa *</span><input name="nama" required list="atDaftarSiswa" class="${input}" placeholder="Ketik nama siswa"></label>
                <datalist id="atDaftarSiswa">${[...new Set(muat().map(x => x.nama + '|' + x.kelas))].map(s => `<option value="${esc(s.split('|')[0])}">${esc(s.split('|')[1])}</option>`).join('')}</datalist>
                <div class="grid grid-cols-2 gap-3">
                    <label class="block"><span class="font-semibold block mb-1">Kelas *</span><input name="kelas" required class="${input}" placeholder="Contoh: X TKJ"></label>
                    <label class="block"><span class="font-semibold block mb-1">Jam Datang *</span><input name="jam" type="time" required class="${input}"></label>
                </div>
                <label class="block"><span class="font-semibold block mb-1">Alasan</span><input name="alasan" class="${input}" placeholder="Contoh: Bangun kesiangan"></label>
                <div class="flex justify-end gap-2 pt-2 border-t">
                    <button type="button" onclick="AlurTerlambat.tutup()" class="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded font-medium">Batal</button>
                    <button type="submit" class="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded font-medium">Simpan & Beri Izin Masuk</button>
                </div>
            </form>`);
        // input time memakai format 24 jam HH:MM
        document.querySelector('#atModal input[name=jam]').value = '07:20';
        const nama = document.querySelector('#atModal input[name=nama]');
        nama.addEventListener('change', () => {
            const ada = muat().find(x => x.nama.toLowerCase() === nama.value.trim().toLowerCase());
            if (ada) document.querySelector('#atModal input[name=kelas]').value = ada.kelas;
        });
    }

    function simpanCatat(form) {
        const f = new FormData(form); const data = muat();
        data.push({ id: Date.now(), tanggal: HARI_INI, jam: String(f.get('jam')).replace(':', '.'), nama: f.get('nama').trim(), kelas: f.get('kelas').trim(), alasan: f.get('alasan').trim() || 'Tidak ada alasan jelas', tahap: 'dicatat', tindakan: '', catatanBK: '', piket: 'Guru Piket', ditinjau: false });
        if (!simpan(data)) alert('Penyimpanan browser tidak tersedia; data hanya tampil sampai halaman ditutup.');
        tutup(); gambarUlang();
    }

    function hapus(id) {
        const data = muat(); const x = data.find(d => d.id === id);
        if (!x || !confirm(`Hapus catatan keterlambatan ${x.nama}?`)) return;
        simpan(data.filter(d => d.id !== id)); gambarUlang();
    }

    function kirimKeBK() {
        const data = muat(); let n = 0;
        data.forEach(x => { if (x.tahap === 'dicatat') { x.tahap = 'bk'; n++; } });
        if (!n) return;
        simpan(data); gambarUlang();
        alert(n + ' laporan keterlambatan terkirim ke Guru BK.');
    }

    // =================== GURU BK ===================
    function renderBK(id) {
        instans[id] = () => {
            const el = document.getElementById(id); if (!el) return;
            const data = muat(); const n = hitung(data);
            const masuk = data.filter(x => x.tahap === 'bk' || x.tahap === 'ditindak').sort((a, b) => (n[b.nama] - n[a.nama]) || a.tanggal.localeCompare(b.tanggal));
            const siapKirim = data.filter(x => x.tahap === 'ditindak').length;
            const belum = data.filter(x => x.tahap === 'bk').length;
            el.innerHTML = `
                <div class="space-y-4 text-xs">
                    <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        ${alurBar('bk')}
                        <button onclick="AlurTerlambat.kirimKeKesiswaan()" ${siapKirim ? '' : 'disabled'} class="${siapKirim ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-300 cursor-not-allowed'} text-white px-3 py-1.5 rounded font-medium"><i class="fa-solid fa-paper-plane mr-1"></i> Laporkan ke Waka Kesiswaan${siapKirim ? ` (${siapKirim})` : ''}</button>
                    </div>
                    <div class="grid grid-cols-3 gap-3">
                        <div class="bg-amber-50 border border-amber-200 p-3 rounded-lg text-center"><span class="text-slate-500 block">Belum Ditindaklanjuti</span><strong class="text-amber-700 text-lg">${belum}</strong></div>
                        <div class="bg-blue-50 border border-blue-200 p-3 rounded-lg text-center"><span class="text-slate-500 block">Siap Dilaporkan</span><strong class="text-blue-700 text-lg">${siapKirim}</strong></div>
                        <div class="bg-rose-50 border border-rose-200 p-3 rounded-lg text-center"><span class="text-slate-500 block">Siswa Terlambat &ge; ${BATAS_BERULANG}x</span><strong class="text-rose-700 text-lg">${Object.values(n).filter(v => v >= BATAS_BERULANG).length}</strong></div>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse min-w-[720px]">
                            <thead><tr class="bg-slate-50 text-slate-500 uppercase border-b border-slate-200">
                                <th class="${td}">Laporan dari Piket</th><th class="${td}">Siswa</th><th class="${td}">Alasan</th><th class="${td}">Tindak Lanjut BK</th><th class="${td} text-center">Aksi</th>
                            </tr></thead>
                            <tbody class="divide-y divide-slate-100">
                                ${masuk.length ? masuk.map(x => `<tr class="${x.tahap === 'bk' ? 'bg-amber-50/60' : ''}">
                                    <td class="${td}">${tgl(x.tanggal)}<span class="block text-slate-500">${esc(x.jam)} WIB</span></td>
                                    <td class="${td} font-medium">${esc(x.nama)}${tandaBerulang(n[x.nama])}<span class="block text-slate-400 font-normal">${esc(x.kelas)}</span></td>
                                    <td class="${td}">${esc(x.alasan)}</td>
                                    <td class="${td}">${x.tindakan ? `<strong>${esc(x.tindakan)}</strong><span class="block text-slate-500">${esc(x.catatanBK)}</span>` : badge('bk')}</td>
                                    <td class="${td} text-center"><button onclick="AlurTerlambat.formTindak(${x.id})" class="${x.tindakan ? 'text-rose-600' : 'bg-rose-600 hover:bg-rose-700 text-white px-2 py-0.5 rounded'} font-medium whitespace-nowrap">${x.tindakan ? 'Ubah' : 'Tindak Lanjut'}</button></td>
                                </tr>`).join('') : `<tr><td colspan="5" class="${td} text-center text-slate-400 py-6">Tidak ada laporan keterlambatan yang menunggu. Laporan baru dari Guru Piket akan muncul di sini.</td></tr>`}
                            </tbody>
                        </table>
                    </div>
                    <div class="flex justify-between items-center"><p class="text-[11px] text-slate-500 italic"><i class="fa-solid fa-lock mr-1"></i>Waka Kesiswaan hanya menerima ringkasan tindak lanjut, bukan isi lengkap catatan konseling.</p>${tombolReset}</div>
                </div>`;
        };
        instans[id]();
    }

    function formTindak(id) {
        const x = muat().find(d => d.id === id); const n = hitung(muat())[x.nama];
        const input = 'w-full border border-slate-300 rounded px-2 py-1.5 focus:ring-2 focus:ring-rose-500 focus:outline-none';
        const saran = n >= 5 ? 'Panggilan orang tua' : n >= BATAS_BERULANG ? 'Konseling individu' : 'Teguran lisan';
        bukaModal('Tindak Lanjut Keterlambatan', `
            <div class="bg-slate-50 border border-slate-200 rounded p-3">
                <strong class="text-sm">${esc(x.nama)}</strong> <span class="text-slate-500">(${esc(x.kelas)})</span>
                <p class="text-slate-600 mt-1">${tgl(x.tanggal)}, ${esc(x.jam)} WIB &middot; ${esc(x.alasan)}</p>
                <p class="mt-1 ${n >= BATAS_BERULANG ? 'text-rose-700 font-semibold' : 'text-slate-500'}">Total keterlambatan: ${n}x &middot; Saran tindakan: ${saran}</p>
            </div>
            <form onsubmit="event.preventDefault(); AlurTerlambat.simpanTindak(${id}, this)" class="space-y-3">
                <label class="block"><span class="font-semibold block mb-1">Tindak Lanjut *</span>
                    <select name="tindakan" class="${input}">${TINDAKAN.map(t => `<option ${t === (x.tindakan || saran) ? 'selected' : ''}>${t}</option>`).join('')}</select></label>
                <label class="block"><span class="font-semibold block mb-1">Ringkasan untuk Waka Kesiswaan *</span>
                    <textarea name="catatan" required rows="3" class="${input}" placeholder="Ringkasan singkat, tanpa detail rahasia konseling">${esc(x.catatanBK)}</textarea></label>
                <div class="flex justify-end gap-2 pt-2 border-t">
                    <button type="button" onclick="AlurTerlambat.tutup()" class="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded font-medium">Batal</button>
                    <button type="submit" class="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded font-medium">Simpan Tindak Lanjut</button>
                </div>
            </form>`);
    }

    function simpanTindak(id, form) {
        const f = new FormData(form); const data = muat(); const x = data.find(d => d.id === id);
        x.tindakan = f.get('tindakan'); x.catatanBK = f.get('catatan').trim(); x.tahap = 'ditindak';
        simpan(data); tutup(); gambarUlang();
    }

    function kirimKeKesiswaan() {
        const data = muat(); let n = 0;
        data.forEach(x => { if (x.tahap === 'ditindak') { x.tahap = 'kesiswaan'; x.ditinjau = false; n++; } });
        if (!n) return;
        simpan(data); gambarUlang();
        alert(n + ' laporan tindak lanjut keterlambatan terkirim ke Waka Kesiswaan.');
    }

    // =================== WAKA KESISWAAN ===================
    function renderKesiswaan(id) {
        instans[id] = () => {
            const el = document.getElementById(id); if (!el) return;
            const data = muat(); const total = hitung(data);
            const lapor = data.filter(x => x.tahap === 'kesiswaan');
            // Kelompokkan per siswa
            const per = {};
            lapor.forEach(x => { (per[x.nama] = per[x.nama] || { nama: x.nama, kelas: x.kelas, list: [] }).list.push(x); });
            const siswa = Object.values(per).map(s => ({ ...s, list: s.list.sort((a, b) => a.tanggal.localeCompare(b.tanggal)) })).sort((a, b) => b.list.length - a.list.length);
            const baru = lapor.filter(x => !x.ditinjau).length;
            const rekapTindakan = TINDAKAN.map(t => [t, lapor.filter(x => x.tindakan === t).length]).filter(([, v]) => v);
            const diProses = data.filter(x => x.tahap !== 'kesiswaan').length;
            el.innerHTML = `
                <div class="space-y-4 text-xs">
                    <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        ${alurBar('kesiswaan')}
                        <button onclick="AlurTerlambat.tandaiDitinjau()" ${baru ? '' : 'disabled'} class="${baru ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-300 cursor-not-allowed'} text-white px-3 py-1.5 rounded font-medium"><i class="fa-solid fa-check-double mr-1"></i> Tandai Semua Sudah Ditinjau${baru ? ` (${baru})` : ''}</button>
                    </div>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div class="bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-center"><span class="text-slate-500 block">Laporan dari BK</span><strong class="text-emerald-700 text-lg">${lapor.length}</strong></div>
                        <div class="bg-amber-50 border border-amber-200 p-3 rounded-lg text-center"><span class="text-slate-500 block">Laporan Baru</span><strong class="text-amber-700 text-lg">${baru}</strong></div>
                        <div class="bg-rose-50 border border-rose-200 p-3 rounded-lg text-center"><span class="text-slate-500 block">Siswa Terlambat &ge; ${BATAS_BERULANG}x</span><strong class="text-rose-700 text-lg">${siswa.filter(s => s.list.length >= BATAS_BERULANG).length}</strong></div>
                        <div class="bg-slate-50 border border-slate-200 p-3 rounded-lg text-center"><span class="text-slate-500 block">Masih di Piket / BK</span><strong class="text-slate-700 text-lg">${diProses}</strong></div>
                    </div>
                    ${rekapTindakan.length ? `<div class="flex flex-wrap gap-2 items-center"><span class="text-slate-500">Rekap tindak lanjut BK:</span>${rekapTindakan.map(([t, v]) => `<span class="bg-white border border-slate-200 px-2 py-0.5 rounded">${t}: <strong>${v}</strong></span>`).join('')}</div>` : ''}
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse min-w-[720px]">
                            <thead><tr class="bg-slate-50 text-slate-500 uppercase border-b border-slate-200">
                                <th class="${td}">Siswa</th><th class="${td} text-center">Terlambat (Dilaporkan BK)</th><th class="${td}">Riwayat & Tindak Lanjut BK</th><th class="${td} text-center">Aksi Waka</th>
                            </tr></thead>
                            <tbody class="divide-y divide-slate-100">
                                ${siswa.length ? siswa.map(s => {
                                    const adaBaru = s.list.some(x => !x.ditinjau);
                                    return `<tr class="${adaBaru ? 'bg-amber-50/60' : ''}">
                                        <td class="${td} font-medium">${esc(s.nama)}${adaBaru ? ' <span class="bg-amber-500 text-white text-[10px] px-1.5 rounded">Baru</span>' : ''}<span class="block text-slate-400 font-normal">${esc(s.kelas)}</span></td>
                                        <td class="${td} text-center"><span class="${s.list.length >= BATAS_BERULANG ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'} px-2 py-0.5 rounded font-bold">${s.list.length}x</span>${total[s.nama] > s.list.length ? `<span class="block text-[10px] text-slate-500 mt-1">+${total[s.nama] - s.list.length} masih diproses Piket/BK</span>` : ''}</td>
                                        <td class="${td}"><ul class="space-y-1">${s.list.map(x => `<li><span class="text-slate-500">${tgl(x.tanggal)} ${esc(x.jam)}</span> &middot; <strong>${esc(x.tindakan)}</strong><span class="block text-slate-500">${esc(x.catatanBK)}</span></li>`).join('')}</ul></td>
                                        <td class="${td} text-center whitespace-nowrap">${s.list.length >= BATAS_BERULANG
                                            ? `<button onclick="alert('Pengajuan Surat Peringatan untuk ${esc(s.nama)} masuk ke tabel Persetujuan Tindakan Lanjutan.')" class="bg-rose-600 hover:bg-rose-700 text-white px-2 py-0.5 rounded font-medium">Proses SP</button>`
                                            : '<span class="text-slate-400">Pantau</span>'}</td>
                                    </tr>`;
                                }).join('') : `<tr><td colspan="4" class="${td} text-center text-slate-400 py-6">Belum ada laporan keterlambatan dari Guru BK.</td></tr>`}
                            </tbody>
                        </table>
                    </div>
                    <div class="flex justify-end">${tombolReset}</div>
                </div>`;
        };
        instans[id]();
    }

    function tandaiDitinjau() {
        const data = muat();
        data.forEach(x => { if (x.tahap === 'kesiswaan') x.ditinjau = true; });
        simpan(data); gambarUlang();
    }

    function reset() {
        if (!confirm('Kembalikan data keterlambatan ke contoh awal?')) return;
        try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* abaikan */ }
        gambarUlang();
    }

    window.AlurTerlambat = { renderPiket, renderBK, renderKesiswaan, formCatat, simpanCatat, hapus, kirimKeBK, formTindak, simpanTindak, kirimKeKesiswaan, tandaiDitinjau, reset, tutup };
})();
