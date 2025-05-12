// api/login.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs").promises;
const path = require("path");

const JWT_SECRET = "suaChaveSecretaSuperSegura"; // *** SUBSTITUA PELA SUA CHAVE SECRETA REAL ***
const ADMINS_FILE = path.join(process.cwd(), "public", "admins.json");

const readAdmins = async () => {
  try {
    const data = await fs.readFile(ADMINS_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Erro ao ler admins:", error);
    return [];
  }
};

module.exports = async (req, res) => {
  if (req.method === "POST") {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Nome de usuário e senha são obrigatórios." });
    }
    const admins = await readAdmins();
    const admin = admins.find((admin) => admin.username === username);

    if (admin && (await bcrypt.compare(password, admin.password))) {
      const token = jwt.sign({ adminId: admin.username }, JWT_SECRET, {
        expiresIn: "1h",
      });
      res.status(200).json({ token });
    } else {
      res.status(401).json({ message: "Credenciais inválidas." });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
