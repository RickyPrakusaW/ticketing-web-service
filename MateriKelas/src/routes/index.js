// index.js didalam folder apapun, dalam kasus ini adalah folder routes
// akan bertugas sebagai aggregator
// anggaplah index.js ini adalah file yang bertugas untuk mendaftar/mencatat di dalam folder tersebut ada file apa aja

const minggu2Router = require("./minggu2");
const bukuRawRouter = require("./bukuRaw");
const bukuORMRouter = require("./bukuORM");
const authRouter = require("./auth");
const contohMiddlewareRouter = require("./contohMiddleware");
const uploadFileRouter = require("./uploadFile");

module.exports = {
  minggu2Router,
  bukuRawRouter,
  bukuORMRouter,
  authRouter,
  contohMiddlewareRouter,
  uploadFileRouter,
};
