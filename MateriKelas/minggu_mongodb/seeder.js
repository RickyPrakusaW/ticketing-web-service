// npm init -y
// npm i express mongodb
// npm install --save-dev @faker-js/faker
// https://v10.fakerjs.dev/api/

// #1 Buat koneksi dulu
// mongodb://localhost:27017/

const { faker } = require("@faker-js/faker");

faker.seed(67);

const { MongoClient } = require("mongodb");
// ambil connection string dari mongodb compass
const url = "mongodb://localhost:27017/";
// family itu konek pakai ipv4 atau ipv6
const client = new MongoClient(url, { family: 4 });
const dbname = "kuliah_ws_inf";

// untuk buat 1 data account
const createRandomAccount = () => {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  return {
    _id: faker.internet.username({ firstName, lastName }),
    email: faker.internet.email({ firstName, lastName }),
    fullName: `${firstName} ${lastName}`,
    gender: faker.person.sexType(),
    avatar: faker.image.avatar(),
    birthday: faker.date.birthdate(),
  };
};

// function "Factory" untuk membuat banyak account
const accountFactory = (jumlah) => {
  const hasil = [];
  for (let index = 0; index < jumlah; index++) {
    hasil.push(createRandomAccount());
  }
  return hasil;
};

// untuk buat 1 data postingan
const createRandomPost = () => {
  const n = faker.number.int({ min: 0, max: 10 });
  const comments = [];
  const postDate = faker.date.recent({ days: 365 });
  for (let i = 0; i < n; i++) {
    comments.push({
      content: faker.lorem.sentence(),
      createdAt: faker.date.soon({ days: 100, refDate: postDate }),
    });
  }
  return {
    title: faker.lorem.sentence(),
    content: faker.lorem.paragraph(),
    createdAt: postDate,
    comments: comments,
  };
};

// function "Factory" untuk buat banyak postingan
const postFactory = (jumlah, accounts) => {
  const posts = [];
  const usernames = accounts.map((a) => a._id);
  const accountsSmall = accounts.map((a) => ({
    _id: a._id,
    avatar: a.avatar,
  }));
  for (let i = 0; i < jumlah; i++) {
    const post = createRandomPost();
    // [jojo,giorno,bruno] ==== giorno
    post.author = faker.helpers.arrayElement(usernames);

    // [jojo,giorno,bruno] 2 ==== jojo bruno
    post.likes = faker.helpers.arrayElements(
      usernames,
      faker.number.int({ min: 0, max: 10 }),
    );
    for (let j = 0; j < post.comments.length; j++) {
      post.comments[j].commenter = faker.helpers.arrayElement(accountsSmall);
    }
    posts.push(post);
  }
  return posts;
};

// #2 Konek ke database + melakukan seeder
const main = async () => {
  try {
    // #3 Konek database dulu
    await client.connect();
    // #4 Pakai database kuliah_ws_inf
    const database = client.db(dbname);
    // #5 Bersihkan / drop database kita, supaya ketika di seeder datanya balik kosongan lagi
    await database.dropDatabase();

    // #6 Buat isi data
    const accounts = accountFactory(10);
    await database.collection("accounts").insertMany(accounts);

    // #7 Buat isi post
    const posts = postFactory(50, accounts);
    await database.collection("posts").insertMany(posts);

    console.log("OK");
  } catch (error) {
    console.log(error);
  } finally {
    await client.close();
    process.exit(0);
  }
};
// jangan lupa jalankan function main
main();

// cara untuk run tinggal, node seeder.js
