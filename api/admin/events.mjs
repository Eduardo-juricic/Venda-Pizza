// api/events.js
import { promises as fs } from "fs";
import path from "path";
import jwt from "jsonwebtoken";

const PENDING_ORDERS_FILE = path.join(
  process.cwd(),
  "data",
  "pending_orders.json"
);
const JWT_SECRET = process.env.JWT_SECRET || "suaChaveSecretaSuperSegura";

// Array para armazenar os clientes conectados via SSE
let adminClients = [];

const readPendingOrders = async () => {
  try {
    const data = await fs.readFile(PENDING_ORDERS_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Erro ao ler pedidos pendentes:", error);
    return [];
  }
};

const authenticate = (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      jwt.verify(token, JWT_SECRET);
      return true;
    } catch (err) {
      res.status(401).send({ message: "Token de autorização inválido." });
      return false;
    }
  } else {
    res.status(401).send({ message: "Token de autorização não encontrado." });
    return false;
  }
  return false;
};

export default async function handler(req, res) {
  if (req.method === "GET") {
    if (!authenticate(req, res)) {
      return; // A autenticação já enviou a resposta de erro
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const clientId = Date.now();
    const newClient = {
      id: clientId,
      res,
    };
    adminClients.push(newClient);
    console.log(`Admin cliente ${clientId} conectado via SSE`);

    // Envia um evento de "ping" inicial para manter a conexão ativa
    res.write(`event: ping\ndata: {}\n\n`);

    req.on("close", () => {
      adminClients = adminClients.filter((client) => client.id !== clientId);
      console.log(`Admin cliente ${clientId} desconectado do SSE`);
    });
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// Função para enviar notificação de novo pedido para todos os clientes SSE conectados
export const sendNewOrderNotification = async (newOrder) => {
  adminClients.forEach((client) => {
    client.res.write(`event: newOrder\ndata: ${JSON.stringify(newOrder)}\n\n`);
  });
  console.log(
    "Notificação de novo pedido enviada para os admins via SSE:",
    newOrder
  );
};
