<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ModuleRevisiController extends Controller
{
    // === KEPEGAWAIAN (HRD) ===
    public function getPegawai(Request $request)
    {
        $user = $request->user();
        $userRole = $user->role;

        $query = DB::table('pegawai');

        // Sensitive Data Access Control: Guru / Staff only see their own profile
        if (in_array($userRole, ['guru', 'siswa', 'wali_santri'])) {
            $query->where('email', $user->email)->orWhere('nama_lengkap', 'LIKE', '%' . $user->name . '%');
        }

        $pegawai = $query->orderBy('id', 'desc')->get();
        return response()->json(['status' => 'success', 'data' => $pegawai]);
    }

    public function storePegawai(Request $request)
    {
        $request->validate([
            'nama_lengkap' => 'required|string',
            'jabatan' => 'required|string',
        ]);

        DB::table('pegawai')->insert([
            'nip' => $request->nip ?: null,
            'nama_lengkap' => $request->nama_lengkap,
            'jabatan' => $request->jabatan,
            'status_kepegawaian' => $request->status_kepegawaian ?: null,
            'no_hp' => $request->no_hp ?: null,
            'email' => $request->email ?: null,
            'tgl_masuk' => $request->tgl_masuk ?: null,
            'pendidikan' => $request->pendidikan ?: null,
            'gaji_pokok' => $request->gaji_pokok ? (float)$request->gaji_pokok : null,
            'tunjangan' => $request->tunjangan ? (float)$request->tunjangan : null,
            'no_sk_terakhir' => $request->no_sk_terakhir ?: null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['status' => 'success', 'message' => 'Data pegawai berhasil ditambahkan.']);
    }

    public function updatePegawai(Request $request, $id)
    {
        $request->validate([
            'nama_lengkap' => 'required|string',
            'jabatan' => 'required|string',
        ]);

        DB::table('pegawai')->where('id', $id)->update([
            'nip' => $request->nip ?: null,
            'nama_lengkap' => $request->nama_lengkap,
            'jabatan' => $request->jabatan,
            'status_kepegawaian' => $request->status_kepegawaian ?: null,
            'no_hp' => $request->no_hp ?: null,
            'email' => $request->email ?: null,
            'pendidikan' => $request->pendidikan ?: null,
            'gaji_pokok' => $request->gaji_pokok ? (float)$request->gaji_pokok : null,
            'tunjangan' => $request->tunjangan ? (float)$request->tunjangan : null,
            'no_sk_terakhir' => $request->no_sk_terakhir ?: null,
            'updated_at' => now(),
        ]);

        return response()->json(['status' => 'success', 'message' => 'Data kepegawaian berhasil diperbarui.']);
    }

    public function getPengajuanKepegawaian(Request $request)
    {
        $userRole = $request->user()->role;
        $query = DB::table('pengajuan_kepegawaian')
            ->join('pegawai', 'pengajuan_kepegawaian.pegawai_id', '=', 'pegawai.id')
            ->select('pengajuan_kepegawaian.*', 'pegawai.nama_lengkap', 'pegawai.nip', 'pegawai.jabatan');

        if (in_array($userRole, ['guru', 'siswa'])) {
            $query->where('pegawai.email', $request->user()->email);
        }

        $pengajuan = $query->orderBy('pengajuan_kepegawaian.id', 'desc')->get();
        return response()->json(['status' => 'success', 'data' => $pengajuan]);
    }

    public function storePengajuanKepegawaian(Request $request)
    {
        $request->validate([
            'pegawai_id' => 'required|exists:pegawai,id',
            'jenis' => 'required|in:Cuti,Izin,SK,Mutasi',
            'alasan' => 'required|string',
            'tgl_mulai' => 'required|date',
        ]);

        DB::table('pengajuan_kepegawaian')->insert([
            'pegawai_id' => $request->pegawai_id,
            'jenis' => $request->jenis,
            'alasan' => $request->alasan,
            'tgl_mulai' => $request->tgl_mulai,
            'tgl_selesai' => $request->tgl_selesai,
            'status_ktu' => 'Pending',
            'status_kepsek' => 'Pending',
            'catatan' => $request->catatan,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['status' => 'success', 'message' => 'Pengajuan kepegawaian berhasil diajukan.']);
    }

    public function updateApprovalKepegawaian(Request $request, $id)
    {
        $userRole = $request->user()->role;
        $status = $request->status ?? 'Disetujui';

        if (in_array($userRole, ['kepala_tu', 'admin', 'kepala_sekolah', 'kepegawaian'])) {
            if ($userRole === 'kepala_tu') {
                DB::table('pengajuan_kepegawaian')->where('id', $id)->update([
                    'status_ktu' => $status,
                    'catatan' => $request->catatan ?? 'Berkas diverifikasi Kepala TU',
                    'updated_at' => now(),
                ]);
            } else if ($userRole === 'kepala_sekolah') {
                DB::table('pengajuan_kepegawaian')->where('id', $id)->update([
                    'status_kepsek' => $status,
                    'catatan' => $request->catatan ?? 'Disetujui Kepala Sekolah',
                    'updated_at' => now(),
                ]);
            } else {
                DB::table('pengajuan_kepegawaian')->where('id', $id)->update([
                    'status_ktu' => $status,
                    'status_kepsek' => $status,
                    'updated_at' => now(),
                ]);
            }
            return response()->json(['status' => 'success', 'message' => 'Status approval kepegawaian berhasil diperbarui.']);
        }

        return response()->json(['status' => 'error', 'message' => 'Anda tidak memiliki hak akses approval.'], 403);
    }

    public function getRiwayatJabatan()
    {
        $riwayat = DB::table('pegawai_riwayat_jabatan')
            ->join('pegawai', 'pegawai_riwayat_jabatan.pegawai_id', '=', 'pegawai.id')
            ->select('pegawai_riwayat_jabatan.*', 'pegawai.nama_lengkap', 'pegawai.nip')
            ->orderBy('pegawai_riwayat_jabatan.id', 'desc')
            ->get();
        return response()->json(['status' => 'success', 'data' => $riwayat]);
    }

    public function storeRiwayatJabatan(Request $request)
    {
        $request->validate([
            'pegawai_id' => 'required|exists:pegawai,id',
            'jabatan' => 'required|string',
        ]);

        DB::table('pegawai_riwayat_jabatan')->insert([
            'pegawai_id' => $request->pegawai_id,
            'jabatan' => $request->jabatan,
            'no_sk' => $request->no_sk ?? 'SK/YAS/AWH/2026/' . rand(100, 999),
            'tgl_sk' => $request->tgl_sk ?? now()->toDateString(),
            'keterangan' => $request->keterangan ?? 'Promosi / Mutasi Jabatan',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Synchronize main pegawai jabatan
        DB::table('pegawai')->where('id', $request->pegawai_id)->update([
            'jabatan' => $request->jabatan,
            'no_sk_terakhir' => $request->no_sk ?? 'SK/YAS/AWH/2026/' . rand(100, 999),
            'updated_at' => now(),
        ]);

        return response()->json(['status' => 'success', 'message' => 'Riwayat jabatan & SK berhasil dicatat.']);
    }

    public function getPenilaianKinerja()
    {
        $kinerja = DB::table('pegawai_penilaian_kinerja')
            ->join('pegawai', 'pegawai_penilaian_kinerja.pegawai_id', '=', 'pegawai.id')
            ->select('pegawai_penilaian_kinerja.*', 'pegawai.nama_lengkap', 'pegawai.nip', 'pegawai.jabatan')
            ->orderBy('pegawai_penilaian_kinerja.id', 'desc')
            ->get();
        return response()->json(['status' => 'success', 'data' => $kinerja]);
    }

    public function storePenilaianKinerja(Request $request)
    {
        $request->validate([
            'pegawai_id' => 'required|exists:pegawai,id',
            'skor_kinerja' => 'required|integer|min:0|max:100',
        ]);

        $skor = $request->skor_kinerja;
        $predikat = 'Baik';
        if ($skor >= 90) $predikat = 'Sangat Baik';
        else if ($skor >= 75) $predikat = 'Baik';
        else if ($skor >= 60) $predikat = 'Cukup';
        else $predikat = 'Kurang';

        DB::table('pegawai_penilaian_kinerja')->insert([
            'pegawai_id' => $request->pegawai_id,
            'periode' => $request->periode ?? 'Semester Ganjil 2026/2027',
            'skor_kinerja' => $skor,
            'predikat' => $predikat,
            'catatan_evaluasi' => $request->catatan_evaluasi ?? 'Evaluasi kinerja berkala pegawai.',
            'penilai' => $request->user()->name ?? 'Kepala TU & Kepsek',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['status' => 'success', 'message' => 'Penilaian kinerja pegawai berhasil disimpan.']);
    }

    // === BK (BIMBINGAN KONSELING) ===
    public function getBKSiswaList()
    {
        $siswa = DB::table('siswa')
            ->leftJoin('anggota_kelas', 'siswa.id', '=', 'anggota_kelas.siswa_id')
            ->leftJoin('kelas', 'anggota_kelas.kelas_id', '=', 'kelas.id')
            ->select('siswa.id', 'siswa.nama', 'siswa.nis', 'kelas.nama_kelas as kelas')
            ->orderBy('siswa.nama', 'asc')
            ->get();

        return response()->json(['status' => 'success', 'data' => $siswa]);
    }

    public function getBKCatatan(Request $request)
    {
        $userRole = strtolower($request->user()->role ?? '');
        $hasPrivilegedAccess = in_array($userRole, ['bk', 'guru_bk', 'kepala_sekolah', 'waka_kesiswaan', 'waka', 'kesiswaan', 'admin']);

        $catatan = DB::table('bk_catatan')
            ->join('siswa', 'bk_catatan.siswa_id', '=', 'siswa.id')
            ->leftJoin('anggota_kelas', 'siswa.id', '=', 'anggota_kelas.siswa_id')
            ->leftJoin('kelas', 'anggota_kelas.kelas_id', '=', 'kelas.id')
            ->select('bk_catatan.*', 'siswa.nama as nama_siswa', 'siswa.nis', 'kelas.nama_kelas as kelas')
            ->orderBy('bk_catatan.id', 'desc')
            ->get();

        if (!$hasPrivilegedAccess) {
            $catatan->transform(function ($item) {
                $item->catatan_rahasia = '[DETAIL CATATAN RAHASIA - HANYA DIBUKA KEPALA SEKOLAH & GURU BK]';
                return $item;
            });
        }

        return response()->json(['status' => 'success', 'data' => $catatan]);
    }

    public function storeBKCatatan(Request $request)
    {
        $request->validate([
            'siswa_id' => 'required|exists:siswa,id',
            'judul' => 'required|string',
            'catatan_rahasia' => 'required|string',
        ]);

        DB::table('bk_catatan')->insert([
            'siswa_id' => $request->siswa_id,
            'tanggal' => $request->tanggal ?? now()->toDateString(),
            'kategori' => $request->kategori ?? 'Konseling',
            'judul' => $request->judul,
            'catatan_rahasia' => $request->catatan_rahasia,
            'status_publik' => $request->status_publik ?? 'Sedang ditangani BK',
            'ditangani_oleh' => $request->user()->name ?? 'Guru BK',
            'status' => $request->status ?? 'Proses',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['status' => 'success', 'message' => 'Catatan BK rahasia berhasil disimpan.']);
    }

    public function getBKPelanggaran(Request $request)
    {
        $userRole = strtolower($request->user()->role ?? '');
        $hasPrivilegedAccess = in_array($userRole, ['bk', 'guru_bk', 'kepala_sekolah', 'waka_kesiswaan', 'waka', 'kesiswaan', 'admin']);

        $pelanggaran = DB::table('bk_pelanggaran')
            ->join('siswa', 'bk_pelanggaran.siswa_id', '=', 'siswa.id')
            ->leftJoin('anggota_kelas', 'siswa.id', '=', 'anggota_kelas.siswa_id')
            ->leftJoin('kelas', 'anggota_kelas.kelas_id', '=', 'kelas.id')
            ->select('bk_pelanggaran.*', 'siswa.nama as nama_siswa', 'siswa.nis', 'kelas.nama_kelas as kelas')
            ->orderBy('bk_pelanggaran.id', 'desc')
            ->get();

        if (!$hasPrivilegedAccess) {
            $pelanggaran->transform(function ($item) {
                $item->catatan_rahasia = '[DETAIL KASUS RAHASIA - HANYA DIBUKA KEPALA SEKOLAH & GURU BK]';
                return $item;
            });
        }

        return response()->json(['status' => 'success', 'data' => $pelanggaran]);
    }

    public function storeBKPelanggaran(Request $request)
    {
        $request->validate([
            'siswa_id' => 'required|exists:siswa,id',
            'jenis_pelanggaran' => 'required|string',
        ]);

        DB::table('bk_pelanggaran')->insert([
            'siswa_id' => $request->siswa_id,
            'jenis_pelanggaran' => $request->jenis_pelanggaran,
            'kategori_bobot' => $request->kategori_bobot ?? 'Ringan',
            'poin' => $request->poin ?? 10,
            'tanggal' => $request->tanggal ?? now()->toDateString(),
            'tindakan_penanganan' => $request->tindakan_penanganan ?? 'Pembinaan Wali Kelas & BK',
            'status_kasus' => $request->status_kasus ?? 'Dalam Penanganan BK',
            'catatan_rahasia' => $request->catatan_rahasia ?? 'Kasus dicatat dan ditangani BK.',
            'status_publik' => 'Sedang ditangani BK',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['status' => 'success', 'message' => 'Data pelanggaran & kasus berhasil dicatat.']);
    }

    public function getBKPrestasi()
    {
        $prestasi = DB::table('bk_prestasi')
            ->join('siswa', 'bk_prestasi.siswa_id', '=', 'siswa.id')
            ->leftJoin('anggota_kelas', 'siswa.id', '=', 'anggota_kelas.siswa_id')
            ->leftJoin('kelas', 'anggota_kelas.kelas_id', '=', 'kelas.id')
            ->select('bk_prestasi.*', 'siswa.nama as nama_siswa', 'siswa.nis', 'kelas.nama_kelas as kelas')
            ->orderBy('bk_prestasi.id', 'desc')
            ->get();

        return response()->json(['status' => 'success', 'data' => $prestasi]);
    }

    public function storeBKPrestasi(Request $request)
    {
        $request->validate([
            'siswa_id' => 'required|exists:siswa,id',
            'nama_prestasi' => 'required|string',
        ]);

        DB::table('bk_prestasi')->insert([
            'siswa_id' => $request->siswa_id,
            'nama_prestasi' => $request->nama_prestasi,
            'tingkat' => $request->tingkat ?? 'Provinsi',
            'peringkat' => $request->peringkat ?? 'Juara 1',
            'penyelenggara' => $request->penyelenggara ?? 'Dinas Pendidikan',
            'tanggal' => $request->tanggal ?? now()->toDateString(),
            'catatan' => $request->catatan ?? 'Apresiasi & Pembinaan Bakat Siswa',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['status' => 'success', 'message' => 'Data prestasi siswa berhasil disimpan.']);
    }

    public function getBKStudiLanjut()
    {
        $studi = DB::table('bk_studi_lanjut')
            ->join('siswa', 'bk_studi_lanjut.siswa_id', '=', 'siswa.id')
            ->leftJoin('anggota_kelas', 'siswa.id', '=', 'anggota_kelas.siswa_id')
            ->leftJoin('kelas', 'anggota_kelas.kelas_id', '=', 'kelas.id')
            ->select('bk_studi_lanjut.*', 'siswa.nama as nama_siswa', 'siswa.nis', 'kelas.nama_kelas as kelas')
            ->orderBy('bk_studi_lanjut.id', 'desc')
            ->get();

        return response()->json(['status' => 'success', 'data' => $studi]);
    }

    public function storeBKStudiLanjut(Request $request)
    {
        $request->validate([
            'siswa_id' => 'required|exists:siswa,id',
            'pilihan_karir' => 'required|string',
        ]);

        DB::table('bk_studi_lanjut')->insert([
            'siswa_id' => $request->siswa_id,
            'tahun_lulus' => $request->tahun_lulus ?? '2026',
            'pilihan_karir' => $request->pilihan_karir,
            'target_universitas_perusahaan' => $request->target_universitas_perusahaan ?? 'Universitas Brawijaya / ITS',
            'jurusan_diminati' => $request->jurusan_diminati ?? 'Teknik / Farmasi',
            'status_tracing' => $request->status_tracing ?? 'Terdata',
            'catatan_bimbingan_karir' => $request->catatan_bimbingan_karir ?? 'Bimbingan seleksi SNBP / SNBT 2026',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['status' => 'success', 'message' => 'Rencana studi lanjut & bimbingan karir berhasil dicatat.']);
    }

    public function getBKAbsensi()
    {
        $absensi = DB::table('bk_absensi')
            ->join('siswa', 'bk_absensi.siswa_id', '=', 'siswa.id')
            ->leftJoin('anggota_kelas', 'siswa.id', '=', 'anggota_kelas.siswa_id')
            ->leftJoin('kelas', 'anggota_kelas.kelas_id', '=', 'kelas.id')
            ->select('bk_absensi.*', 'siswa.nama as nama_siswa', 'siswa.nis', 'kelas.nama_kelas as kelas')
            ->orderBy('bk_absensi.id', 'desc')
            ->get();

        return response()->json(['status' => 'success', 'data' => $absensi]);
    }

    public function storeBKAbsensi(Request $request)
    {
        $request->validate([
            'siswa_id' => 'required|exists:siswa,id',
            'status_absensi' => 'required|string',
        ]);

        DB::table('bk_absensi')->insert([
            'siswa_id' => $request->siswa_id,
            'tanggal' => $request->tanggal ?? now()->toDateString(),
            'status_absensi' => $request->status_absensi,
            'keterangan' => $request->keterangan ?? 'Membolos jam pelajaran ke-3',
            'ditindaklanjuti_bk' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['status' => 'success', 'message' => 'Data absensi BK berhasil dicatat.']);
    }

    public function updateBKCatatan(Request $request, $id)
    {
        DB::table('bk_catatan')->where('id', $id)->update([
            'siswa_id' => $request->siswa_id,
            'judul' => $request->judul,
            'catatan_rahasia' => $request->catatan_rahasia,
            'status_publik' => $request->status_publik ?? 'Sedang ditangani BK',
            'updated_at' => now(),
        ]);
        return response()->json(['status' => 'success', 'message' => 'Catatan BK berhasil diperbarui.']);
    }

    public function deleteBKCatatan($id)
    {
        DB::table('bk_catatan')->where('id', $id)->delete();
        return response()->json(['status' => 'success', 'message' => 'Catatan BK berhasil dihapus.']);
    }

    public function updateBKPelanggaran(Request $request, $id)
    {
        DB::table('bk_pelanggaran')->where('id', $id)->update([
            'siswa_id' => $request->siswa_id,
            'jenis_pelanggaran' => $request->jenis_pelanggaran,
            'kategori_bobot' => $request->kategori_bobot,
            'poin' => $request->poin,
            'status_kasus' => $request->status_kasus,
            'tindakan_penanganan' => $request->tindakan_penanganan,
            'catatan_rahasia' => $request->catatan_rahasia,
            'updated_at' => now(),
        ]);
        return response()->json(['status' => 'success', 'message' => 'Data pelanggaran berhasil diperbarui.']);
    }

    public function deleteBKPelanggaran($id)
    {
        DB::table('bk_pelanggaran')->where('id', $id)->delete();
        return response()->json(['status' => 'success', 'message' => 'Data pelanggaran berhasil dihapus.']);
    }

    public function updateBKPrestasi(Request $request, $id)
    {
        DB::table('bk_prestasi')->where('id', $id)->update([
            'siswa_id' => $request->siswa_id,
            'nama_prestasi' => $request->nama_prestasi,
            'tingkat' => $request->tingkat,
            'peringkat' => $request->peringkat,
            'penyelenggara' => $request->penyelenggara,
            'catatan' => $request->catatan,
            'updated_at' => now(),
        ]);
        return response()->json(['status' => 'success', 'message' => 'Data prestasi berhasil diperbarui.']);
    }

    public function deleteBKPrestasi($id)
    {
        DB::table('bk_prestasi')->where('id', $id)->delete();
        return response()->json(['status' => 'success', 'message' => 'Data prestasi berhasil dihapus.']);
    }

    public function updateBKStudiLanjut(Request $request, $id)
    {
        DB::table('bk_studi_lanjut')->where('id', $id)->update([
            'siswa_id' => $request->siswa_id,
            'pilihan_karir' => $request->pilihan_karir,
            'target_universitas_perusahaan' => $request->target_universitas_perusahaan,
            'jurusan_diminati' => $request->jurusan_diminati,
            'status_tracing' => $request->status_tracing,
            'catatan_bimbingan_karir' => $request->catatan_bimbingan_karir,
            'updated_at' => now(),
        ]);
        return response()->json(['status' => 'success', 'message' => 'Data tracing study berhasil diperbarui.']);
    }

    public function deleteBKStudiLanjut($id)
    {
        DB::table('bk_studi_lanjut')->where('id', $id)->delete();
        return response()->json(['status' => 'success', 'message' => 'Data tracing study berhasil dihapus.']);
    }

    public function updateBKAbsensi(Request $request, $id)
    {
        DB::table('bk_absensi')->where('id', $id)->update([
            'siswa_id' => $request->siswa_id,
            'tanggal' => $request->tanggal,
            'status_absensi' => $request->status_absensi,
            'keterangan' => $request->keterangan,
            'updated_at' => now(),
        ]);
        return response()->json(['status' => 'success', 'message' => 'Data absensi BK berhasil diperbarui.']);
    }

    public function deleteBKAbsensi($id)
    {
        DB::table('bk_absensi')->where('id', $id)->delete();
        return response()->json(['status' => 'success', 'message' => 'Data absensi berhasil dihapus.']);
    }

    // === SARANA & PRASARANA ===
    public function getInventaris()
    {
        $barang = DB::table('inventaris_barang')->orderBy('id', 'desc')->get();
        return response()->json(['status' => 'success', 'data' => $barang]);
    }

    public function storeInventaris(Request $request)
    {
        $request->validate([
            'nama_barang' => 'required|string',
            'kategori' => 'required|string',
            'jumlah' => 'required|integer|min:1',
        ]);

        $kode = $request->kode_barang;
        if (!$kode) {
            $count = DB::table('inventaris_barang')->count() + 1;
            $kode = 'AST-' . strtoupper(substr(preg_replace('/[^A-Za-z0-9]/', '', $request->kategori), 0, 3)) . '-' . sprintf('%03d', $count);
        }

        DB::table('inventaris_barang')->insert([
            'kode_barang' => $kode,
            'nama_barang' => $request->nama_barang,
            'kategori' => $request->kategori,
            'jumlah' => $request->jumlah,
            'kondisi' => $request->kondisi ?? 'Baik',
            'lokasi' => $request->lokasi ?? 'Gudang Sarana',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['status' => 'success', 'message' => 'Barang inventaris berhasil ditambahkan.']);
    }

    public function getPeminjamanInventaris()
    {
        $peminjaman = DB::table('peminjaman_inventaris')
            ->join('inventaris_barang', 'peminjaman_inventaris.inventaris_id', '=', 'inventaris_barang.id')
            ->select('peminjaman_inventaris.*', 'inventaris_barang.nama_barang', 'inventaris_barang.kode_barang')
            ->orderBy('peminjaman_inventaris.id', 'desc')
            ->get();
        return response()->json(['status' => 'success', 'data' => $peminjaman]);
    }

    public function storePeminjamanInventaris(Request $request)
    {
        $request->validate([
            'inventaris_id' => 'required|exists:inventaris_barang,id',
            'peminjam_nama' => 'required|string',
        ]);

        DB::table('peminjaman_inventaris')->insert([
            'inventaris_id' => $request->inventaris_id,
            'peminjam_nama' => $request->peminjam_nama,
            'peminjam_role' => $request->peminjam_role ?? 'Guru',
            'tgl_pinjam' => $request->tgl_pinjam ?? now()->toDateString(),
            'tgl_kembali' => $request->tgl_kembali,
            'status' => 'Dipinjam',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['status' => 'success', 'message' => 'Peminjaman barang berhasil dicatat.']);
    }

    public function kembalikanInventaris(Request $request, $id)
    {
        DB::table('peminjaman_inventaris')->where('id', $id)->update([
            'status' => 'Dikembalikan',
            'tgl_kembali' => now()->toDateString(),
            'updated_at' => now(),
        ]);

        return response()->json(['status' => 'success', 'message' => 'Barang berhasil dikembalikan.']);
    }

    public function getSaranaMutasi()
    {
        $mutasi = DB::table('sarana_mutasi')
            ->join('inventaris_barang', 'sarana_mutasi.inventaris_id', '=', 'inventaris_barang.id')
            ->select('sarana_mutasi.*', 'inventaris_barang.nama_barang', 'inventaris_barang.kode_barang')
            ->orderBy('sarana_mutasi.id', 'desc')
            ->get();
        return response()->json(['status' => 'success', 'data' => $mutasi]);
    }

    public function storeSaranaMutasi(Request $request)
    {
        $request->validate([
            'inventaris_id' => 'required|exists:inventaris_barang,id',
            'jenis' => 'required|in:Masuk,Keluar',
            'jumlah' => 'required|integer|min:1',
        ]);

        DB::table('sarana_mutasi')->insert([
            'inventaris_id' => $request->inventaris_id,
            'jenis' => $request->jenis,
            'jumlah' => $request->jumlah,
            'tanggal' => $request->tanggal ?? now()->toDateString(),
            'keterangan' => $request->keterangan ?? ($request->jenis === 'Masuk' ? 'Pengadaan Baru' : 'Barang Keluar/Digunakan'),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        if ($request->jenis === 'Masuk') {
            DB::table('inventaris_barang')->where('id', $request->inventaris_id)->increment('jumlah', $request->jumlah);
        } else {
            DB::table('inventaris_barang')->where('id', $request->inventaris_id)->decrement('jumlah', $request->jumlah);
        }

        return response()->json(['status' => 'success', 'message' => 'Mutasi barang berhasil dicatat.']);
    }

    public function getSaranaPerawatan()
    {
        $perawatan = DB::table('sarana_perawatan')
            ->join('inventaris_barang', 'sarana_perawatan.inventaris_id', '=', 'inventaris_barang.id')
            ->select('sarana_perawatan.*', 'inventaris_barang.nama_barang', 'inventaris_barang.kode_barang')
            ->orderBy('sarana_perawatan.id', 'desc')
            ->get();
        return response()->json(['status' => 'success', 'data' => $perawatan]);
    }

    public function storeSaranaPerawatan(Request $request)
    {
        $request->validate([
            'inventaris_id' => 'required|exists:inventaris_barang,id',
            'jenis_perawatan' => 'required|string',
        ]);

        DB::table('sarana_perawatan')->insert([
            'inventaris_id' => $request->inventaris_id,
            'jenis_perawatan' => $request->jenis_perawatan,
            'biaya' => $request->biaya ?? 0,
            'teknisi' => $request->teknisi ?? 'Teknisi Sekolah',
            'tgl_perawatan' => $request->tgl_perawatan ?? now()->toDateString(),
            'status' => 'Proses',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['status' => 'success', 'message' => 'Log perawatan barang berhasil dicatat.']);
    }

    public function updateStatusPerawatan(Request $request, $id)
    {
        DB::table('sarana_perawatan')->where('id', $id)->update([
            'status' => $request->status ?? 'Selesai',
            'updated_at' => now(),
        ]);

        return response()->json(['status' => 'success', 'message' => 'Status perawatan berhasil diperbarui.']);
    }

    public function getSaranaPenghapusan()
    {
        $penghapusan = DB::table('sarana_penghapusan')
            ->join('inventaris_barang', 'sarana_penghapusan.inventaris_id', '=', 'inventaris_barang.id')
            ->select('sarana_penghapusan.*', 'inventaris_barang.nama_barang', 'inventaris_barang.kode_barang')
            ->orderBy('sarana_penghapusan.id', 'desc')
            ->get();
        return response()->json(['status' => 'success', 'data' => $penghapusan]);
    }

    public function storeSaranaPenghapusan(Request $request)
    {
        $request->validate([
            'inventaris_id' => 'required|exists:inventaris_barang,id',
            'alasan' => 'required|string',
        ]);

        DB::table('sarana_penghapusan')->insert([
            'inventaris_id' => $request->inventaris_id,
            'jumlah' => $request->jumlah ?? 1,
            'alasan' => $request->alasan,
            'status_ktu' => 'Pending',
            'status_kepsek' => 'Pending',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['status' => 'success', 'message' => 'Pengajuan penghapusan barang berhasil diajukan.']);
    }

    public function approvePenghapusan(Request $request, $id)
    {
        $userRole = $request->user()->role;
        $status = $request->status ?? 'Disetujui';

        if (in_array($userRole, ['kepala_tu', 'admin', 'kepala_sekolah', 'sarana'])) {
            if ($userRole === 'kepala_tu') {
                DB::table('sarana_penghapusan')->where('id', $id)->update([
                    'status_ktu' => $status,
                    'updated_at' => now(),
                ]);
            } else if ($userRole === 'kepala_sekolah') {
                DB::table('sarana_penghapusan')->where('id', $id)->update([
                    'status_kepsek' => $status,
                    'updated_at' => now(),
                ]);
            } else {
                DB::table('sarana_penghapusan')->where('id', $id)->update([
                    'status_ktu' => $status,
                    'status_kepsek' => $status,
                    'updated_at' => now(),
                ]);
            }
            return response()->json(['status' => 'success', 'message' => 'Approval penghapusan aset berhasil diperbarui.']);
        }

        return response()->json(['status' => 'error', 'message' => 'Anda tidak memiliki hak akses approval.'], 403);
    }

    // === PERSURATAN & ARCHIVING ===
    private function getRomanMonth($month)
    {
        $map = [
            1 => 'I', 2 => 'II', 3 => 'III', 4 => 'IV', 5 => 'V',
            6 => 'VI', 7 => 'VII', 8 => 'VIII', 9 => 'IX', 10 => 'X',
            11 => 'XI', 12 => 'XII'
        ];
        return $map[(int)$month] ?? 'IX';
    }

    public function getSurat(Request $request)
    {
        $query = DB::table('surat');

        if ($request->has('jenis') && $request->jenis != '') {
            $query->where('jenis', $request->jenis);
        }
        if ($request->has('kategori') && $request->kategori != '') {
            $query->where('kategori', $request->kategori);
        }
        if ($request->has('search') && $request->search != '') {
            $s = '%' . $request->search . '%';
            $query->where(function($q) use ($s) {
                $q->where('no_surat', 'like', $s)
                  ->orWhere('perihal', 'like', $s)
                  ->orWhere('pengirim_penerima', 'like', $s)
                  ->orWhere('lokasi_arsip', 'like', $s);
            });
        }

        $surat = $query->orderBy('created_at', 'desc')->get();
        return response()->json(['status' => 'success', 'data' => $surat]);
    }

    public function generateNomorSurat(Request $request)
    {
        $jenis = $request->jenis ?? 'Surat Keluar';
        $count = DB::table('surat')->whereYear('created_at', date('Y'))->count() + 1;
        $romanMonth = $this->getRomanMonth(date('n'));
        $code = ($jenis === 'Surat Masuk') ? 'SM' : 'SK';
        $noSurat = sprintf('%03d/SMA-AWH/%s/%s/%s', $count, $code, $romanMonth, date('Y'));

        return response()->json([
            'status' => 'success',
            'no_surat' => $noSurat
        ]);
    }

    public function storeSurat(Request $request)
    {
        $request->validate([
            'perihal' => 'required|string',
            'pengirim_penerima' => 'required|string',
        ]);

        $count = DB::table('surat')->whereYear('created_at', date('Y'))->count() + 1;
        $romanMonth = $this->getRomanMonth(date('n'));
        $code = ($request->jenis === 'Surat Masuk') ? 'SM' : 'SK';
        $defaultNoSurat = sprintf('%03d/SMA-AWH/%s/%s/%s', $count, $code, $romanMonth, date('Y'));
        $noSurat = $request->no_surat ?: $defaultNoSurat;

        $id = DB::table('surat')->insertGetId([
            'no_surat' => $noSurat,
            'jenis' => $request->jenis ?? 'Surat Keluar',
            'kategori' => $request->kategori ?? 'Umum',
            'kerahasiaan' => $request->kerahasiaan ?? 'Biasa',
            'perihal' => $request->perihal,
            'pengirim_penerima' => $request->pengirim_penerima,
            'tanggal' => $request->tanggal ?? now()->toDateString(),
            'isi_surat' => $request->isi_surat ?? null,
            'file_path' => $request->file_path ?? null,
            'lokasi_arsip' => $request->lokasi_arsip ?? 'Box Arsip Utama / Lemari 1',
            'metadata_json' => $request->metadata_json ? json_encode($request->metadata_json) : null,
            'status' => $request->status ?? 'Diarsipkan',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Dokumen surat berhasil disimpan dengan No. ' . $noSurat,
            'id' => $id,
            'no_surat' => $noSurat
        ]);
    }

    public function updateSurat(Request $request, $id)
    {
        $request->validate([
            'perihal' => 'required|string',
            'pengirim_penerima' => 'required|string',
        ]);

        DB::table('surat')->where('id', $id)->update([
            'no_surat' => $request->no_surat,
            'jenis' => $request->jenis ?? 'Surat Keluar',
            'kategori' => $request->kategori ?? 'Umum',
            'kerahasiaan' => $request->kerahasiaan ?? 'Biasa',
            'perihal' => $request->perihal,
            'pengirim_penerima' => $request->pengirim_penerima,
            'tanggal' => $request->tanggal ?? now()->toDateString(),
            'isi_surat' => $request->isi_surat ?? null,
            'lokasi_arsip' => $request->lokasi_arsip ?? 'Box Arsip Utama',
            'status' => $request->status ?? 'Diarsipkan',
            'updated_at' => now(),
        ]);

        return response()->json(['status' => 'success', 'message' => 'Data dokumen surat berhasil diperbarui.']);
    }

    public function deleteSurat($id)
    {
        DB::table('surat')->where('id', $id)->delete();
        return response()->json(['status' => 'success', 'message' => 'Dokumen surat berhasil dihapus dari arsip.']);
    }

    public function getTemplateSurat()
    {
        $templates = DB::table('template_surat')->get();
        if ($templates->isEmpty()) {
            // Seed default templates if empty
            $defaults = [
                [
                    'kode_template' => 'SK-AKTIF',
                    'nama_template' => 'Surat Keterangan Siswa Aktif',
                    'kategori' => 'Kesiswaan',
                    'format_konten' => 'Yang bertanda tangan di bawah ini Kepala SMA KH. A. Wahid Hasyim Tebuireng menerangkan bahwa [NAMA_SISWA] (NIS: [NIS_SISWA]) adalah benar-benar siswa aktif kelas [KELAS] tahun ajaran 2026/2027.',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'kode_template' => 'UND-ORTU',
                    'nama_template' => 'Surat Undangan Orang Tua / Wali Santri',
                    'kategori' => 'Humas',
                    'format_konten' => 'Mengharap kehadiran Bapak/Ibu Wali Santri pada Acara Pertemuan Orang Tua dan Sosialisasi Program Sekolah yang akan dilaksanakan pada [TANGGAL_ACARA] bertempat di Aula Sekolah.',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'kode_template' => 'ST-GURU',
                    'nama_template' => 'Surat Tugas / Pengantar Dinas Guru',
                    'kategori' => 'Kepegawaian',
                    'format_konten' => 'Kepala Sekolah menugaskan [NAMA_GURU] (NIP: [NIP_GURU]) untuk menghadiri Pelatihan dan Workshop Manajemen Sekolah yang diselenggarakan di [LOKASI_TUGAS] pada [TANGGAL_PELAKSANAAN].',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'kode_template' => 'SK-BEASISWA',
                    'nama_template' => 'Surat Rekomendasi Beasiswa',
                    'kategori' => 'Kesiswaan',
                    'format_konten' => 'Pihak Sekolah memberikan rekomendasi penuh kepada [NAMA_SISWA] untuk mengajukan Permohonan Beasiswa Prestasi Akademik Tahap I Tahun 2026.',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            ];
            DB::table('template_surat')->insert($defaults);
            $templates = DB::table('template_surat')->get();
        }
        return response()->json(['status' => 'success', 'data' => $templates]);
    }

    // === HUMAS & BRANDING ===
    public function getHumasKonten()
    {
        $konten = DB::table('humas_konten')->get();
        return response()->json(['status' => 'success', 'data' => $konten]);
    }

    // === PERPUSTAKAAN DIGITAL ===
    public function getBuku()
    {
        $buku = DB::table('buku_perpustakaan')->orderBy('id', 'desc')->get();
        return response()->json(['status' => 'success', 'data' => $buku]);
    }

    public function storeBuku(Request $request)
    {
        $request->validate([
            'judul' => 'required|string',
            'pengarang' => 'required|string',
            'stok' => 'required|integer|min:0',
        ]);

        $kode = $request->kode_buku;
        if (!$kode) {
            $count = DB::table('buku_perpustakaan')->count() + 1;
            $kode = 'BK-' . sprintf('%04d', $count);
        }

        DB::table('buku_perpustakaan')->insert([
            'kode_buku' => $kode,
            'judul' => $request->judul,
            'pengarang' => $request->pengarang,
            'penerbit' => $request->penerbit ?? 'Penerbit Utama',
            'isbn' => $request->isbn,
            'kategori' => $request->kategori ?? 'Umum',
            'lokasi_rak' => $request->lokasi_rak ?? 'Rak Utama',
            'stok' => $request->stok,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['status' => 'success', 'message' => 'Buku berhasil ditambahkan ke katalog.']);
    }

    public function updateBuku(Request $request, $id)
    {
        DB::table('buku_perpustakaan')->where('id', $id)->update([
            'kode_buku' => $request->kode_buku,
            'judul' => $request->judul,
            'pengarang' => $request->pengarang,
            'penerbit' => $request->penerbit,
            'isbn' => $request->isbn,
            'kategori' => $request->kategori,
            'lokasi_rak' => $request->lokasi_rak,
            'stok' => $request->stok,
            'updated_at' => now(),
        ]);

        return response()->json(['status' => 'success', 'message' => 'Data buku berhasil diperbarui.']);
    }

    public function deleteBuku($id)
    {
        DB::table('buku_perpustakaan')->where('id', $id)->delete();
        return response()->json(['status' => 'success', 'message' => 'Buku berhasil dihapus dari katalog.']);
    }

    public function getPeminjamanBuku()
    {
        $peminjaman = DB::table('peminjaman_buku')
            ->join('buku_perpustakaan', 'peminjaman_buku.buku_id', '=', 'buku_perpustakaan.id')
            ->join('siswa', 'peminjaman_buku.siswa_id', '=', 'siswa.id')
            ->leftJoin('anggota_kelas', 'siswa.id', '=', 'anggota_kelas.siswa_id')
            ->leftJoin('kelas', 'anggota_kelas.kelas_id', '=', 'kelas.id')
            ->select(
                'peminjaman_buku.*',
                'buku_perpustakaan.judul as judul_buku',
                'buku_perpustakaan.kode_buku',
                'siswa.nama as nama_siswa',
                'siswa.nis',
                'kelas.nama_kelas as kelas'
            )
            ->orderBy('peminjaman_buku.id', 'desc')
            ->get();

        return response()->json(['status' => 'success', 'data' => $peminjaman]);
    }

    public function storePeminjamanBuku(Request $request)
    {
        $request->validate([
            'buku_id' => 'required|exists:buku_perpustakaan,id',
            'siswa_id' => 'required|exists:siswa,id',
        ]);

        $buku = DB::table('buku_perpustakaan')->where('id', $request->buku_id)->first();
        if ($buku && $buku->stok <= 0) {
            return response()->json(['status' => 'error', 'message' => 'Stok buku ini sedang habis.'], 422);
        }

        DB::table('peminjaman_buku')->insert([
            'buku_id' => $request->buku_id,
            'siswa_id' => $request->siswa_id,
            'tgl_pinjam' => $request->tgl_pinjam ?? now()->toDateString(),
            'tgl_tenggat' => $request->tgl_tenggat ?? now()->addDays(7)->toDateString(),
            'tgl_kembali' => null,
            'denda' => 0,
            'status_denda' => 'Tidak Ada',
            'status' => 'Dipinjam',
            'catatan' => $request->catatan ?? 'Peminjaman rutin perpustakaan',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('buku_perpustakaan')->where('id', $request->buku_id)->decrement('stok', 1);

        return response()->json(['status' => 'success', 'message' => 'Transaksi peminjaman buku berhasil dicatat.']);
    }

    public function updatePeminjamanBuku(Request $request, $id)
    {
        DB::table('peminjaman_buku')->where('id', $id)->update([
            'buku_id' => $request->buku_id,
            'siswa_id' => $request->siswa_id,
            'tgl_pinjam' => $request->tgl_pinjam,
            'tgl_tenggat' => $request->tgl_tenggat,
            'catatan' => $request->catatan,
            'updated_at' => now(),
        ]);

        return response()->json(['status' => 'success', 'message' => 'Data peminjaman berhasil diperbarui.']);
    }

    public function kembalikanBuku(Request $request, $id)
    {
        $pinjam = DB::table('peminjaman_buku')->where('id', $id)->first();
        if (!$pinjam) {
            return response()->json(['status' => 'error', 'message' => 'Peminjaman tidak ditemukan.'], 404);
        }

        $denda = 0;
        $tglTenggat = \Carbon\Carbon::parse($pinjam->tgl_tenggat)->startOfDay();
        $tglKembali = now()->startOfDay();
        if ($tglKembali->gt($tglTenggat)) {
            $selisihHari = (int) $tglTenggat->diffInDays($tglKembali);
            $denda = $selisihHari * 1000; // Rp 1.000 / hari keterlambatan
        }

        DB::table('peminjaman_buku')->where('id', $id)->update([
            'status' => 'Dikembalikan',
            'tgl_kembali' => $tglKembali->toDateString(),
            'denda' => $denda,
            'status_denda' => $denda > 0 ? 'Belum Lunas' : 'Tidak Ada',
            'updated_at' => now(),
        ]);

        DB::table('buku_perpustakaan')->where('id', $pinjam->buku_id)->increment('stok', 1);

        return response()->json(['status' => 'success', 'message' => 'Buku berhasil dikembalikan.' . ($denda > 0 ? ' Denda keterlambatan: Rp ' . number_format($denda, 0, ',', '.') : '')]);
    }

    public function deletePeminjamanBuku($id)
    {
        DB::table('peminjaman_buku')->where('id', $id)->delete();
        return response()->json(['status' => 'success', 'message' => 'Sirkulasi peminjaman berhasil dihapus.']);
    }

    public function getDendaPerpustakaan()
    {
        $denda = DB::table('peminjaman_buku')
            ->join('buku_perpustakaan', 'peminjaman_buku.buku_id', '=', 'buku_perpustakaan.id')
            ->join('siswa', 'peminjaman_buku.siswa_id', '=', 'siswa.id')
            ->leftJoin('anggota_kelas', 'siswa.id', '=', 'anggota_kelas.siswa_id')
            ->leftJoin('kelas', 'anggota_kelas.kelas_id', '=', 'kelas.id')
            ->where('peminjaman_buku.denda', '>', 0)
            ->orWhere('peminjaman_buku.status_denda', 'Belum Lunas')
            ->select(
                'peminjaman_buku.*',
                'buku_perpustakaan.judul as judul_buku',
                'siswa.nama as nama_siswa',
                'siswa.nis',
                'kelas.nama_kelas as kelas'
            )
            ->orderBy('peminjaman_buku.id', 'desc')
            ->get();

        return response()->json(['status' => 'success', 'data' => $denda]);
    }

    public function bayarDenda(Request $request, $id)
    {
        DB::table('peminjaman_buku')->where('id', $id)->update([
            'status_denda' => 'Lunas',
            'updated_at' => now(),
        ]);

        return response()->json(['status' => 'success', 'message' => 'Denda keterlambatan berhasil dilunasi.']);
    }

    public function getKunjunganPerpustakaan()
    {
        $kunjungan = DB::table('kunjungan_perpustakaan')
            ->join('siswa', 'kunjungan_perpustakaan.siswa_id', '=', 'siswa.id')
            ->leftJoin('anggota_kelas', 'siswa.id', '=', 'anggota_kelas.siswa_id')
            ->leftJoin('kelas', 'anggota_kelas.kelas_id', '=', 'kelas.id')
            ->select(
                'kunjungan_perpustakaan.*',
                'siswa.nama as nama_siswa',
                'siswa.nis',
                'kelas.nama_kelas as kelas'
            )
            ->orderBy('kunjungan_perpustakaan.id', 'desc')
            ->get();

        return response()->json(['status' => 'success', 'data' => $kunjungan]);
    }

    public function storeKunjunganPerpustakaan(Request $request)
    {
        $request->validate([
            'siswa_id' => 'required|exists:siswa,id',
        ]);

        DB::table('kunjungan_perpustakaan')->insert([
            'siswa_id' => $request->siswa_id,
            'tanggal' => $request->tanggal ?? now()->toDateString(),
            'jam_masuk' => $request->jam_masuk ?? now()->format('H:i'),
            'tujuan' => $request->tujuan ?? 'Membaca Buku',
            'catatan' => $request->catatan ?? 'Kunjungan rutin siswa',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['status' => 'success', 'message' => 'Presensi kunjungan perpustakaan berhasil dicatat.']);
    }

    public function updateKunjunganPerpustakaan(Request $request, $id)
    {
        DB::table('kunjungan_perpustakaan')->where('id', $id)->update([
            'siswa_id' => $request->siswa_id,
            'tanggal' => $request->tanggal,
            'jam_masuk' => $request->jam_masuk,
            'tujuan' => $request->tujuan,
            'catatan' => $request->catatan,
            'updated_at' => now(),
        ]);

        return response()->json(['status' => 'success', 'message' => 'Data kunjungan berhasil diperbarui.']);
    }

    public function deleteKunjunganPerpustakaan($id)
    {
        DB::table('kunjungan_perpustakaan')->where('id', $id)->delete();
        return response()->json(['status' => 'success', 'message' => 'Log kunjungan berhasil dihapus.']);
    }
}
