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
    const menuCollection = db.collection("menu");

    if (req.method === "GET") {
      const { homepage } = req.query;
      const menu = await menuCollection.find().toArray();
      if (homepage === "true") {
        const homepageMenu = menu.filter((item) => item.isOnHomepage);
        res.status(200).json(homepageMenu);
      } else {
        res.status(200).json(menu);
      }
    } else if (req.method === "POST") {
      if (!authenticate(req)) {
        return res
          .status(401)
          .json({ message: "Token de autorização inválido." });
      }

      const { name, description, price, imagePath, category } = req.body;
      const isOnHomepage =
        req.body.isOnHomepage === true ||
        req.body.isOnHomepage === "true" ||
        false;

      const newItem = {
        name,
        description,
        price,
        imagePath,
        category,
        isOnHomepage: isOnHomepage,
        id: Date.now(), // Gerar um ID único no servidor
      };

      const result = await menuCollection.insertOne(newItem);
      res.status(201).json(result.ops[0]);
    } else {
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error("Erro no handler de /api/menu:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
}
