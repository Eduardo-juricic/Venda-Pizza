import { promises as fs } from "fs";
import path from "path";
import jwt from "jsonwebtoken";

const PENDING_ORDERS_FILE = path.join(
  process.cwd(),
  "data",
  "pending_orders.json"
);
const JWT_SECRET = process.env.JWT_SECRET || "suaChaveSecretaSuperSegura";

// Certifique-se de que a pasta 'data' exista
fs.mkdir(path.join(process.cwd(), "data"), { recursive: true }).catch(
  console.error
);

const readPendingOrders = async () => {
  try {
    const data = await fs.readFile(PENDING_ORDERS_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Erro ao ler pedidos pendentes:", error);
    return [];
  }
};

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
  if (req.method === "GET") {
    if (!authenticate(req)) {
      return res
        .status(401)
        .json({ message: "Token de autorização inválido." });
    }

    try {
      const pedidos = await readPendingOrders();
      res.status(200).json(pedidos);
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
      res.status(500).json({ message: "Erro ao carregar os pedidos." });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
