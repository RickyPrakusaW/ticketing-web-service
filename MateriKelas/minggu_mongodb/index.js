const express = require("express");
const app = express();
const port = 3003;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/**
 * Siapkan koneksi
 */
const { MongoClient, ObjectId } = require("mongodb");
// ambil connection string dari mongodb compass
const url = "mongodb://localhost:27017/";
// family itu konek pakai ipv4 atau ipv6
const client = new MongoClient(url, { family: 4 });
const dbname = "kuliah_ws_inf";

app.get("/account", async (req, res) => {
  // untuk find (hasilnya bisa banyak), selalu pakai toArray()
  const hasil = await client
    .db(dbname)
    .collection("accounts")
    .find()
    .sort({ _id: -1 }) // 1 asc -1 desc
    .toArray();
  console.log(hasil);
  return res.status(200).json(hasil);
});

app.get("/post/:id", async (req, res) => {
  const { id } = req.params;
  console.log(id);

  const hasil = await client
    .db(dbname)
    .collection("posts")
    .findOne({ _id: new ObjectId(id) });
  return res.status(200).json(hasil);
});

app.post("/account", async (req, res) => {
  const { fullname, email, gender } = req.body;
  const hasil = await client
    .db(dbname)
    .collection("accounts")
    .insertOne({ fullname, email, gender });
  return res.status(200).json(hasil);
});

app.put("/account/:id", async (req, res) => {
  const { id } = req.params;
  const { fullname, email, gender } = req.body;
  const hasil = await client
    .db(dbname)
    .collection("accounts")
    .updateOne(
      { _id: new ObjectId(id) },
      { $set: { fullname, email, gender } },
    );
  return res.status(200).json(hasil);
});

app.delete("/account/:id", async (req, res) => {
  const { id } = req.params;
  const hasil = await client
    .db(dbname)
    .collection("accounts")
    .deleteOne({ _id: new ObjectId(id) });
  return res.status(200).json(hasil);
});

app.get("/tambahan", async (req, res) => {
  const db = client.db(dbname);

  // // contoh find yang punya filter
  //   const hasil = await db
  //     .collection("accounts")
  //     .find({
  //       fullName: new RegExp("ann"),
  //       birthday: { $gte: new Date("1940-01-01"), $lte: new Date("1950-01-01") },
  //     })
  //     .toArray();

  //   const hasil = await db
  //     .collection("accounts")
  //     .find()
  //     .sort({ gender: 1, fullName: -1 }) // 1 asc , -1 desc
  //     .project({
  //       email: 1,
  //       fullName: 1,
  //       _id: 0,
  //       emailbaru: { $concat: [{ $toUpper: "email saya " }, "$email"] },
  //     })
  //     .skip(5)
  //     .limit(3)
  //     .toArray();

  // 6a1fab5ce9ce21752a13c69d
  //   const idpost = "6a1fab5ce9ce21752a13c69d";
  //   const hasil = await db.collection("posts").findOne(
  //     { _id: new ObjectId(idpost) },
  //     {
  //       projection: {
  //         title: 1,
  //         content: 1,
  //         "comments.content": 1,
  //         "comments.commenter._id": 1,
  //       },
  //     },
  //   );

  const hasil = await db
    .collection("posts")
    .aggregate([
      { $project: { title: 1, author: 1, bolu: "ketan" } },
      { $project: { title: 1, author: 1, bolucaps: { $toUpper: "$bolu" } } },
      { $group: { _id: "$author", articles: { $sum: 1 } } },
      {
        $lookup: {
          from: "accounts",
          localField: "_id", // nama field hasil dari pipeline sebelumnya
          foreignField: "_id", // nama field dari collection tujuan (accounts)
          as: "account",
        },
      },
    ])
    .toArray();

  return res.status(200).json(hasil);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
