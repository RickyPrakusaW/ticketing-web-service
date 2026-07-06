# Penjelasan Opsi Cookie (`httpOnly`, `sameSite`, `secure`, `maxAge`)

Cookie adalah data kecil yang disimpan di browser dan dikirim bersama request ke server. Pengaturan cookie sangat penting untuk keamanan dan fungsionalitas aplikasi. Berikut ini penjelasan mengenai beberapa opsi penting saat menyetel cookie di web:

---

## 🔐 `httpOnly`

- Jika `true`, maka cookie **tidak bisa diakses oleh JavaScript**.
- Meningkatkan keamanan terhadap serangan **XSS (Cross Site Scripting)**.
- Contoh:
  ```js
  console.log(document.cookie); // Tidak akan menampilkan cookie yang httpOnly
  ```

---

## 🌐 `sameSite`

Mengatur apakah cookie dikirim saat request berasal dari domain lain (cross-site request).

| Nilai    | Penjelasan                                                                                                                        | Contoh                                                                                        |
| -------- | --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `None`   | Cookie dikirim dalam **semua request**, termasuk dari domain lain.                                                                | `frontend.abc.com` ke `backend.abc.com` ✅<br>`another.def.com` ke `abc.com` ✅               |
|          | Harus disertai dengan `secure: true`, jika tidak maka cookie akan **ditolak oleh browser modern**.                                |                                                                                               |
| `Lax`    | Cookie dikirim untuk **same-site** dan juga untuk navigasi lintas situs **yang dimulai oleh user** seperti klik link/form submit. | Klik link dari `abc.com` ke `shop.abc.com` ✅<br>Script/iframe dari `another.def.com` ❌      |
| `Strict` | Cookie hanya dikirim untuk request yang berasal dari **origin yang sama**.                                                        | Navigasi antar halaman di `admin.abc.com` ✅<br>Klik link dari `abc.com` ke `shop.abc.com` ❌ |

---

## ✅ `secure`

- Jika `true`, cookie hanya akan dikirim melalui koneksi **HTTPS**.
- Jika `false`, cookie bisa dikirim melalui **HTTP**, namun ini **tidak disarankan** karena rentan disadap.

---

## ⏳ `maxAge`

- Menentukan **umur** cookie (dalam milidetik atau detik, tergantung implementasi).
- Setelah waktu ini habis, cookie akan **otomatis kedaluwarsa** dan dihapus oleh browser.

---

## 💡 Contoh Penggunaan (Node.js + Express)

```js
res.cookie("sessionId", "abc123", {
  httpOnly: true,
  sameSite: "Lax",
  secure: true,
  maxAge: 3600000, // 1 jam
});
```

---

## 📌 Tips Keamanan

- Gunakan `httpOnly: true` untuk cookie yang menyimpan data sensitif (seperti token login).
- Gunakan `secure: true` saat aplikasi berjalan di production dengan HTTPS.
- Hindari `sameSite: None` kecuali benar-benar diperlukan (misalnya untuk integrasi lintas domain).

---

## 📚 Referensi

- [MDN Web Docs - Set-Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie)
- [OWASP Cookie Security](https://owasp.org/www-community/controls/SecureCookieAttribute)
