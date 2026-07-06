// shortcut nex
// import express, import function express dari library express
const express = require("express");
const {
  minggu2Router,
  bukuRawRouter,
  bukuORMRouter,
  authRouter,
  contohMiddlewareRouter,
  uploadFileRouter,
} = require("./src/routes");

// untuk menggunakan function express, dimasukkan ke variable app
// contoh : const hasiltambah = tambah(1,3)
const app = express();

// mysql 3306, apache 80
const port = 3001;

// aktifkan kemampuan libraty dotenv untuk membaca file .env
require("dotenv").config();

// SECARA DEFAULT BODY, TIDAK BISA DIAMBIL, HARUS MENGAKTIFKAN KEMAMPUAN BERIKUT
app.use(express.urlencoded({ extended: true }));
// SECARA DEFAULT BODY dalam bentuk JSON, TIDAK BISA DIAMBIL, HARUS MENGAKTIFKAN KEMAMPUAN BERIKUT
// HATI-HATI tulisan express.json() HARUS ditutup dengan ()
app.use(express.json());

/**
 * Supaya koding express kita bisa baca cookie, aktifkan kemampuan cookie parser
 */
const cookieParser = require("cookie-parser");
app.use(cookieParser());

// Membuat sebuah route (url) http://localhost:3000/
// jika sebuah arrow function tidak ada {}, maka dia mode return
app.get("/", (req, res) => res.send("tugas minggu sudah kerja"));

// jika sebuah arrow function punya {}, maka dia bukan mode return, dan wajib return
app.get("/biodata", (req, res) => {
  return res.json("Jolyne Joestar");
});

// localhost:3000/api/v1/minggu2
// localhost:3000/api/v1/minggu2
app.use("/api/v1/minggu2", minggu2Router);
app.use("/api/v1/bukuraw", bukuRawRouter);
app.use("/api/v1/bukuorm", bukuORMRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/contohmiddleware", contohMiddlewareRouter);
app.use("/api/v1/uploadfile", uploadFileRouter);

// untuk menjalakan server node (express), jalan di port 3000
app.listen(port, () => console.log(`Example app listening on port ${port}!`));

/**
 * SELECT -> GET http://localhost:3000/
 * INSERT -> POST http://localhost:3000
 * UPDATE -> PUT/PATCH http://localhost:3000
 * DELETE -> DELETE http://localhost:3000
 */
