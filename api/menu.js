import { promises as fs } from "fs";
import path from "path";
import jwt from "jsonwebtoken";

const MENU_FILE_PATH = path.join(process.cwd(), "src/data/menu.json");
const JWT_SECRET = process.env.JWT_SECRET || "suaChaveSecretaSuperSegura";

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
    const { homepage } = req.query;
    const menu = await readMenu();
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

    const menu = await readMenu();
    menu.push(newItem);

    if (await writeMenu(menu)) {
      res.status(201).json(newItem);
    } else {
      res.status(500).json({ message: "Erro ao adicionar a pizza." });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
