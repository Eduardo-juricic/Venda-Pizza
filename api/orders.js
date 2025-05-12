// api/orders.js
import { promises as fs } from "fs";
import path from "path";
// Importe a função de notificação (assumindo que o caminho está correto)
import { sendNewOrderNotification } from "./admin/events.js";

const PENDING_ORDERS_FILE = path.join(
  process.cwd(),
  "data",
  "pending_orders.json"
);

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

export default async function handler(req, res) {
  if (req.method === "POST") {
    const orderData = req.body;

    console.log("Dados do pedido recebidos:", orderData);

    try {
      const pendingOrders = await readPendingOrders();
      orderData.timestamp = Date.now();
      pendingOrders.push(orderData);
      await writePendingOrders(pendingOrders);

      // Notificar os administradores via SSE
      sendNewOrderNotification(orderData);

      res.status(201).json({ message: "Pedido recebido com sucesso!" });
    } catch (error) {
      console.error("Erro ao salvar o pedido:", error);
      res.status(500).json({ message: "Erro ao salvar o pedido." });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
