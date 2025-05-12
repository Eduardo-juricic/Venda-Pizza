import { promises as fs } from "fs";
import path from "path";
import jwt from "jsonwebtoken";

const PENDING_ORDERS_FILE = path.join(
  process.cwd(),
  "data",
  "pending_orders.json"
);
const JWT_SECRET = process.env.JWT_SECRET || "suaChaveSecretaSuperSegura";

const readPendingOrders = async () => {
  try {
    const data = await fs.readFile(PENDING_ORDERS_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Erro ao ler pedidos pendentes:", error);
    return [];
  }
};

const writePendingOrders = async (orders) => {
  try {
    await fs.writeFile(
      PENDING_ORDERS_FILE,
      JSON.stringify(orders, null, 2),
      "utf8"
    );
    return true;
  } catch (error) {
    console.error("Erro ao escrever pedidos pendentes:", error);
    return false;
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
  if (req.method === "DELETE") {
    if (!authenticate(req)) {
      return res
        .status(401)
        .json({ message: "Token de autorização inválido." });
    }

    const { timestamp } = req.query;
    const timestampToRemove = parseInt(timestamp);

    if (isNaN(timestampToRemove)) {
      return res.status(400).json({ message: "Timestamp inválido." });
    }

    try {
      const pendingOrders = await readPendingOrders();
      const initialOrderCount = pendingOrders.length;
      const updatedOrders = pendingOrders.filter(
        (order) => order.timestamp !== timestampToRemove
      );

      if (updatedOrders.length === initialOrderCount) {
        return res.status(404).json({ message: "Pedido não encontrado." });
      }

      if (await writePendingOrders(updatedOrders)) {
        res.status(200).json({ message: "Pedido removido com sucesso." });
      } else {
        res.status(500).json({ message: "Erro ao remover o pedido." });
      }
    } catch (error) {
      console.error("Erro ao remover pedido:", error);
      res.status(500).json({ message: "Erro ao remover o pedido." });
    }
  } else {
    res.setHeader("Allow", ["DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
