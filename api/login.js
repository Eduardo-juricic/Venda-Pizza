// api/login.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { MongoClient } from "mongodb";

const JWT_SECRET = process.env.JWT_SECRET || "suaChaveSecretaSuperSegura";
const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = "delicia-pizza-db";
const ADMINS_COLLECTION = "administradores";

async function connectDB() {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI não está definida!");
    throw new Error("A variável de ambiente MONGODB_URI não está definida.");
  }
  const client = new MongoClient(MONGODB_URI);
  try {
    console.log("Tentando conectar ao MongoDB...");
    await client.connect();
    console.log("Conexão ao MongoDB bem-sucedida!");
    return client.db(DATABASE_NAME);
  } catch (error) {
    console.error("Erro ao conectar ao MongoDB:", error);
    throw error;
  }
}

export default async (req, res) => {
  if (req.method === "POST") {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Nome de usuário e senha são obrigatórios." });
    }

    try {
      const db = await connectDB();
      const adminsCollection = db.collection(ADMINS_COLLECTION);
      console.log(`Buscando usuário: ${username}`);
      const admin = await adminsCollection.findOne({ username });
      console.log("Resultado da busca:", admin);

      if (admin && (await bcrypt.compare(password, admin.password))) {
        const token = jwt.sign({ adminId: admin._id }, JWT_SECRET, {
          expiresIn: "1h",
        });
        console.log("Login bem-sucedido, token gerado:", token);
        res.status(200).json({ token });
      } else {
        console.log("Credenciais inválidas.");
        res.status(401).json({ message: "Credenciais inválidas." });
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      res.status(500).json({ message: "Erro interno ao fazer login." });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
