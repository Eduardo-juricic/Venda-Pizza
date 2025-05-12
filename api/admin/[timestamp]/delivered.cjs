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
  if (req.method === "PUT") {
    if (!authenticate(req)) {
      return res
        .status(401)
        .json({ message: "Token de autorização inválido." });
    }

    const { timestamp } = req.query;
    const timestampToUpdate = parseInt(timestamp);

    if (isNaN(timestampToUpdate)) {
      return res.status(400).json({ message: "Timestamp inválido." });
    }

    try {
      const pendingOrders = await readPendingOrders();
      const orderIndex = pendingOrders.findIndex(
        (order) => order.timestamp === timestampToUpdate
      );

      if (orderIndex === -1) {
        return res.status(404).json({ message: "Pedido não encontrado." });
      }

      // Simplesmente removemos o pedido da lista ao marcar como entregue
      const updatedOrders = pendingOrders.filter(
        (order) => order.timestamp !== timestampToUpdate
      );

      if (await writePendingOrders(updatedOrders)) {
        res.status(200).json({ message: "Pedido marcado como entregue." });
      } else {
        res.status(500).json({ message: "Erro ao atualizar os pedidos." });
      }
    } catch (error) {
      console.error("Erro ao marcar pedido como entregue:", error);
      res.status(500).json({ message: "Erro ao marcar pedido como entregue." });
    }
  } else {
    res.setHeader("Allow", ["PUT"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
