db.createUser({
  user: 'admin',
  pwd: 'dn7Gpo7bB4TU',
  roles: [{ role: 'dbOwner', db: 'main' }]
});
db.users.insertOne({
  name: "Tamerlan",
  email: "tamerlan@gmail.com",
  passwordHash: "$2y$10$ZdysR3ktXXfrBiDilDtjVe0LrKg1A6fPBWRlozIq0zwj2bReY4opK",
  roles: ["admin", "client"],
})