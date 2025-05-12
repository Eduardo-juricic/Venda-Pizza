const bcrypt = require("bcrypt");

async function generateHash(password) {
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  console.log("Hash da senha:", hash);
}

generateHash("211204"); // Substitua 'suaSenhaAdmin' pela senha desejada
