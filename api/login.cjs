// api/login.cjs
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { MongoClient } from "mongodb";

const JWT_SECRET = process.env.JWT_SECRET || "suaChaveSecretaSuperSegura";
const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = "delicia-pizza-db"; // Certifique-se de usar o nome correto do seu banco
const ADMINS_COLLECTION = "administradores";

async function connectDB() {
  if (!MONGODB_URI) {
    throw new Error("A variável de ambiente MONGODB_URI não está definida.");
  }
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
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
      const admin = await adminsCollection.findOne({ username });

      if (admin && (await bcrypt.compare(password, admin.password))) {
        const token = jwt.sign({ adminId: admin._id }, JWT_SECRET, {
          // Use _id do MongoDB
          expiresIn: "1h",
        });
        res.status(200).json({ token });
      } else {
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
