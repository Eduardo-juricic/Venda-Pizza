const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs").promises;
const path = require("path");
const multer = require("multer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const port = 5000;
const JWT_SECRET = "suaChaveSecretaSuperSegura";
const ADMINS_FILE = path.join(__dirname, "admins.json");
const IMAGE_STORAGE_PATH = path.join(__dirname, "public/images");
const MENU_FILE_PATH = path.join(__dirname, "../src/data/menu.json");
const PENDING_ORDERS_FILE = path.join(__dirname, "data", "pending_orders.json");

app.use(cors());
app.use(bodyParser.json());
app.use("/images", express.static(path.join(__dirname, "public/images")));

const storage = multer.diskStorage({
  destination: IMAGE_STORAGE_PATH,
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

const readMenu = async () => {
  try {
    const data = await fs.readFile(MENU_FILE_PATH, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Erro ao ler o menu:", error);
    return [];
  }
};

const writeMenu = async (menu) => {
  try {
    await fs.writeFile(MENU_FILE_PATH, JSON.stringify(menu, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error("Erro ao escrever o menu:", error);
    return false;
  }
};

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

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).send({ message: "Token inválido." });
      }
      req.adminId = decoded.adminId;
      next();
    });
  } else {
    res.status(401).send({ message: "Token de autorização não encontrado." });
  }
};

app.post("/api/admin/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .send({ message: "Nome de usuário e senha são obrigatórios." });
  }
  const admins = await readAdmins();
  if (admins.find((admin) => admin.username === username)) {
    return res.status(400).send({ message: "Nome de usuário já existe." });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  admins.push({ username, password: hashedPassword });
  await writeAdmins(admins);
  res.status(201).send({ message: "Admin registrado com sucesso." });
});

app.post("/api/admin/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .send({ message: "Nome de usuário e senha são obrigatórios." });
  }
  const admins = await readAdmins();
  const admin = admins.find((admin) => admin.username === username);

  if (admin && (await bcrypt.compare(password, admin.password))) {
    const token = jwt.sign({ adminId: admin.username }, JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token });
  } else {
    res.status(401).send({ message: "Credenciais inválidas." });
  }
});

app.get("/api/menu", async (req, res) => {
  const { homepage } = req.query;
  const menu = await readMenu();
  if (homepage === "true") {
    const homepageMenu = menu.filter((item) => item.isOnHomepage);
    res.json(homepageMenu);
  } else {
    res.json(menu);
  }
});

app.get("/api/menu/:id", async (req, res) => {
  const idToFind = parseInt(req.params.id);
  const menu = await readMenu();
  const pizza = menu.find((item) => item.id === idToFind);
  if (pizza) {
    res.json(pizza);
  } else {
    res.status(404).send({ message: "Pizza não encontrada" });
  }
});

app.post("/api/menu", authenticate, async (req, res) => {
  const { name, description, price, imagePath, category } = req.body;
  // Obtenha isOnHomepage do body, e use false como padrão se não estiver presente
  const isOnHomepage =
    req.body.isOnHomepage === true || req.body.isOnHomepage === "true" || false;

  const newItem = {
    name,
    description,
    price,
    imagePath,
    category,
    isOnHomepage: isOnHomepage,
  };
  const menu = await readMenu();
  newItem.id = Date.now();
  menu.push(newItem);
  if (await writeMenu(menu)) {
    res.status(201).json(newItem);
  } else {
    res.status(500).send({ message: "Erro ao adicionar a pizza" });
  }
});

app.post(
  "/api/upload-image",
  authenticate,
  upload.single("image"),
  (req, res) => {
    if (req.file) {
      res.json({ filename: req.file.filename });
    } else {
      res.status(400).send({ message: "Nenhum arquivo enviado." });
    }
  }
);

app.put("/api/menu/:id", authenticate, async (req, res) => {
  const idToUpdate = parseInt(req.params.id);
  const { name, description, price, imagePath, category, isOnHomepage } =
    req.body;
  const updatedItem = {
    name,
    description,
    price,
    imagePath,
    category,
    isOnHomepage: isOnHomepage === true || isOnHomepage === "true" || false,
  };
  const menu = await readMenu();
  const index = menu.findIndex((item) => item.id === idToUpdate);

  if (index !== -1) {
    const oldImagePath = menu[index].imagePath;
    menu[index] = { ...menu[index], ...updatedItem };

    if (await writeMenu(menu)) {
      const fsSync = require("fs");
      if (
        updatedItem.imagePath &&
        updatedItem.imagePath !== oldImagePath &&
        oldImagePath
      ) {
        const oldImagePathFull = path.join(IMAGE_STORAGE_PATH, oldImagePath);
        fsSync.unlink(oldImagePathFull, (err) => {
          if (err) console.error("Erro ao excluir imagem antiga:", err);
        });
      }
      res.json(menu[index]);
    } else {
      res.status(500).send({ message: "Erro ao atualizar a pizza" });
    }
  } else {
    res.status(404).send({ message: "Pizza não encontrada" });
  }
});

app.delete("/api/menu/:id", authenticate, async (req, res) => {
  const idToDelete = parseInt(req.params.id);
  const menu = await readMenu();
  const indexToDelete = menu.findIndex((item) => item.id === idToDelete);

  if (indexToDelete !== -1) {
    const imageToDelete = menu[indexToDelete].imagePath;
    const updatedMenu = menu.filter((item) => item.id !== idToDelete);
    if (await writeMenu(updatedMenu)) {
      const fsSync = require("fs");
      if (imageToDelete) {
        const imagePathFull = path.join(IMAGE_STORAGE_PATH, imageToDelete);
        fsSync.unlink(imagePathFull, (err) => {
          if (err) console.error("Erro ao excluir imagem:", err);
        });
      }
      res.status(200).send({ message: "Pizza removida com sucesso" });
    } else {
      res.status(500).send({ message: "Erro ao remover a pizza" });
    }
  } else {
    res.status(404).send({ message: "Pizza não encontrada" });
  }
});

// --- NOVA ROTA PARA RECEBER OS PEDIDOS ---
app.post("/api/orders", async (req, res) => {
  const orderData = req.body;

  console.log("Dados do pedido recebidos:", orderData);

  try {
    const pendingOrders = await readPendingOrders();
    orderData.timestamp = Date.now();
    pendingOrders.push(orderData);
    await writePendingOrders(pendingOrders);
    sendNewOrderNotification(orderData); // Notificar via SSE
    res.status(201).json({ message: "Pedido recebido com sucesso!" });
  } catch (error) {
    console.error("Erro ao salvar o pedido:", error);
    res.status(500).json({ message: "Erro ao salvar o pedido." });
  }
});
// --- FIM DA NOVA ROTA ---

// --- NOVA ROTA PARA BUSCAR OS PEDIDOS PARA O ADMIN PANEL ---
app.get("/api/admin/orders", authenticate, async (req, res) => {
  try {
    const pedidos = await readPendingOrders();
    res.json(pedidos);
  } catch (error) {
    console.error("Erro ao ler pedidos:", error);
    res.status(500).json({ message: "Erro ao carregar pedidos." });
  }
});
// --- FIM DA NOVA ROTA PARA ADMIN PANEL ---

// --- NOVA ROTA PARA REMOVER UM PEDIDO (ADICIONADA AGORA) ---
app.delete("/api/admin/orders/:timestamp", authenticate, async (req, res) => {
  const timestampToRemove = parseInt(req.params.timestamp);

  try {
    const pendingOrders = await readPendingOrders();
    const updatedOrders = pendingOrders.filter(
      (order) => order.timestamp !== timestampToRemove
    );

    if (pendingOrders.length === updatedOrders.length) {
      return res.status(404).json({ message: "Pedido não encontrado." });
    }

    await writePendingOrders(updatedOrders);
    res.json({ message: "Pedido removido com sucesso." });
  } catch (error) {
    console.error("Erro ao remover pedido:", error);
    res.status(500).json({ message: "Erro ao remover o pedido." });
  }
});
// --- FIM DA NOVA ROTA PARA REMOVER PEDIDO ---

// --- SSE IMPLEMENTATION ---
let adminClients = [];

app.get("/admin/events", (req, res) => {
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

  req.on("close", () => {
    adminClients = adminClients.filter((client) => client.id !== clientId);
    console.log(`Admin cliente ${clientId} desconectado do SSE`);
  });

  res.write(`event: ping\ndata: {}\n\n`); // Envia um evento inicial (opcional)
});

const sendNewOrderNotification = (newOrder) => {
  adminClients.forEach((client) => {
    client.res.write(`event: newOrder\ndata: ${JSON.stringify(newOrder)}\n\n`);
  });
  console.log(
    "Notificação de novo pedido enviada para os admins via SSE:",
    newOrder
  );
};

const fsSync = require("fs");

app.listen(port, () => {
  console.log(`Servidor backend rodando na porta ${port}`);
});
