# Aplikasi Timbangan

Aplikasi web untuk mengelola data timbangan dengan frontend HTML/CSS/JavaScript dan backend Node.js + MongoDB.

## Fitur

- ✅ Simulasi pengambilan data timbangan
- ✅ Menyimpan data ke database MongoDB
- ✅ Menampilkan data dalam tabel responsif
- ✅ Edit nama barang secara inline
- ✅ Hapus data timbangan
- ✅ UI responsif untuk mobile
- ✅ Modal popup untuk input dan tampilan data

## Teknologi

**Frontend:**
- HTML5
- CSS3 (Responsive design)
- Vanilla JavaScript

**Backend:**
- Node.js
- Express.js
- MongoDB dengan Mongoose
- CORS untuk API

## Instalasi

1. Clone repository ini:
```bash
git clone <url-repository>
cd Balanced-App
```

2. Install dependencies:
```bash
npm install
```

3. Buat file `.env` di root folder:
```env
MONGODB_URI=mongodb://localhost:27017/timbangan
PORT=5050
```

4. Pastikan MongoDB sudah berjalan di sistem Anda

5. Jalankan server:
```bash
npm start
```

6. Buka browser dan akses: `http://localhost:5050`

## Struktur Project

```
Balanced-App/
├── app.js              # Frontend JavaScript
├── index.html          # Halaman utama
├── style.css           # Styling
├── server.js           # Backend API server
├── package.json        # Dependencies
├── .env               # Environment variables (jangan di-commit)
├── .gitignore         # File yang diabaikan Git
└── README.md          # Dokumentasi
```

## API Endpoints

- `GET /api/weights` - Ambil semua data timbangan
- `POST /api/weights` - Simpan data timbangan baru
- `PATCH /api/weights/:scaleId` - Update nama barang
- `DELETE /api/weights/:scaleId` - Hapus data timbangan

## Penggunaan

1. Klik "Ambil Data Timbangan" untuk simulasi pengambilan data
2. Klik "Simpan Data Timbangan" untuk menyimpan ke database
3. Klik "Lihat Data Tersimpan" untuk melihat semua data
4. Di tabel data, gunakan tombol "Edit" untuk mengubah nama barang
5. Gunakan tombol "Hapus" untuk menghapus data

## Kontribusi

Silakan buat issue atau pull request untuk perbaikan dan fitur baru.

## Lisensi

MIT License
