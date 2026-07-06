# Sequelize Association Keys

| **Key**        | **Description**                                                                                                                                                                                                        | **Where It’s Used**                               | **Example Usage**                                                                                                                                             |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **foreignKey** | The column in the **target table** that stores a reference to the **source table**. <br><br>**Source:** `User (id)`<br>**Target:** `Post (authorId)`                                                                   | `belongsTo`, `hasOne`, `hasMany`, `belongsToMany` | `User.hasMany(Post, { foreignKey: 'authorId' });`<br><br> → The `Post` table has `authorId` referencing `id` in `User`.                                       |
| **otherKey**   | The foreign key in the **pivot table** that refers to the **other model** in a many-to-many association. <br><br>**Source:** `User (userId)`<br>**Target:** `Role (roleId)`<br>**Pivot:** `UserRoles (userId, roleId)` | `belongsToMany`                                   | `User.belongsToMany(Role, { through: 'UserRoles', foreignKey: 'userId', otherKey: 'roleId' });`<br><br> → The `UserRoles` table stores `userId` and `roleId`. |
| **sourceKey**  | The column in the **source table** that should be used as the primary identifier instead of the default primary key. <br><br>**Source:** `User (uuid)`<br>**Target:** `Post (authorId)`                                | `hasOne`, `hasMany`                               | `User.hasMany(Post, { foreignKey: 'authorId', sourceKey: 'uuid' });`<br><br> → `Post.authorId` references `User.uuid` instead of the default `id`.            |
| **targetKey**  | The column in the **target table** that the **foreign key** refers to. <br><br>**Source:** `User (uuid)`<br>**Target:** `Post (authorId)`                                                                              | `belongsTo`                                       | `Post.belongsTo(User, { foreignKey: 'authorId', targetKey: 'uuid' });`<br><br> → `Post.authorId` references `User.uuid`.                                      |
| **as**         | Defines an alias for the association, useful when multiple associations exist between the same models. Required when using `include` in queries. <br><br>**Source:** `User (id)`<br>**Target:** `Post (authorId)`      | `belongsTo`, `hasOne`, `hasMany`, `belongsToMany` | `User.hasMany(Post, { foreignKey: 'authorId', as: 'Articles' });`<br><br> → Now, `user.getArticles()` is used instead of `user.getPosts()`.                   |

# Penjelasan konbinasi foreignKey, sourceKey, dan targetKey

| **Association Type** | **foreignKey (Target Table)** | **sourceKey (Source Table)** | **targetKey (Target Table)** |
| -------------------- | ----------------------------- | ---------------------------- | ---------------------------- |
| **hasMany / hasOne** | ✅ Yes (child table)          | ✅ Yes (parent table)        | ❌ No                        |
| **belongsTo**        | ✅ Yes (child table)          | ❌ No                        | ✅ Yes (parent table)        |

# Catatan kecil untuk foreignKey

- ForeignKey dalam relasi hasMany, hasOne, belongsTo SELALU MENUNJUK KE kolom FK
- sedangkan
- ForeignKey dalam relasi belongsToMany SELALU MENUNJUK KE kolom pada model itu sendiri

# BelongsToMany KHUSUS UNTUK RELASI MANY - TO - MANY TIDAK BOLEH YANG LAIN

# Astaga susah banget sumpah

- Kapan kita BUTUH pakai sourceKey dan targetKey?
  - Kalau NAMA KOLOM dari primaryKey dan foreignKey beda
  - SOLUSI GAMPANG?
    - makanya kalau buat kolom di database yang kompak, NAMA KOLOM PRIMARY KEY DAN FOREIGN KEY SAMA
    - mainan prefix! jadi misalnya kategori one-to-many buku, maka primary key dan foreign key pakai nama kategori_id
