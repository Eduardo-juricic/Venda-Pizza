// api/register.js
import bcrypt from "bcrypt";
import { promises as fs } from "fs";
import path from "path";
import { authenticate } from "./utils.js"; // Importe a função authenticate

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

const writeAdmins = async (admins) => {
  try {
    await fs.writeFile(ADMINS_FILE, JSON.stringify(admins, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error("Erro ao escrever admins:", error);
    return false;
  }
};

export default async (req, res) => {
  if (req.method === "POST") {
    // Se você quiser proteger a rota de registro, descomente o código abaixo
    // const adminId = authenticate(req, res);
    // if (!adminId) {
    //   return; // A função authenticate já enviou a resposta de erro
    // }

    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Nome de usuário e senha são obrigatórios." });
    }
    const admins = await readAdmins();
    if (admins.find((admin) => admin.username === username)) {
      return res.status(400).json({ message: "Nome de usuário já existe." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    admins.push({ username, password: hashedPassword });
    if (await writeAdmins(admins)) {
      res.status(201).json({ message: "Admin registrado com sucesso." });
    } else {
      res.status(500).json({ message: "Erro ao registrar o admin." });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
