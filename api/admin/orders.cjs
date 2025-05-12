import { MongoClient } from "mongodb";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "suaChaveSecretaSuperSegura";
const MONGODB_URI = process.env.MONGODB_URI; // Sua variável de ambiente do Vercel
const DATABASE_NAME = "seu_banco_de_dados"; // Substitua pelo nome do seu banco de dados

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

const authenticate = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      jwt.verify(token, JWT_SECRET);
      return true;
    } catch (err) {
      return false;
    }
  }
  return false;
};

export default async function handler(req, res) {
  try {
    const db = await connectDB();
    const ordersCollection = db.collection("orders");

    if (req.method === "GET") {
      if (!authenticate(req)) {
        return res
          .status(401)
          .json({ message: "Token de autorização inválido." });
      }

      const pedidos = await ordersCollection
        .find({ status: "pending" })
        .toArray();
      res.status(200).json(pedidos);
    } else {
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error("Erro no handler de /api/admin/orders:", error);
    res.status(500).json({ message: "Erro ao carregar os pedidos." });
  }
}
