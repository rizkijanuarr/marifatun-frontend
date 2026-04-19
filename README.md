# Marifatun Frontend

## Deskripsi

Marifatun merupakan kosakata yang diambil dari Arab yang mengartikan Pengetahuan, dengan tujuan untuk melakukan generating copywriting konten yang dapat di share di LinkedIn, X, Thread, Facebook, hingga ke Email Marketing. Dan juga melakukan scripting scenes untuk membuat Video.

## Menampilkan gambar (template)

Gunakan salah satu contoh berikut saat ingin menampilkan gambar di dokumentasi atau UI:

**Markdown:**

```markdown
![Deskripsi gambar](./path/ke/gambar.png)
```

**HTML:**

```html
<img src="./path/ke/gambar.png" alt="Deskripsi gambar" width="640" height="auto" />
```

**React (JSX):**

```tsx
<img src="/assets/contoh.png" alt="Deskripsi gambar" />
```

Sesuaikan `src` dengan path aset di folder `public/` (misalnya `/assets/nama-file.svg`) atau import dari `src/`.

## Instalasi

Pastikan di komputer lokal sudah terpasang:

- **Node.js** versi **v25.9.0**
- **Bun** versi **1.3.11**

Langkah menjalankan project:

```bash
cd marifatun-frontend
bun install
bun dev
```

Buka di browser: [http://localhost:5173/](http://localhost:5173/)
