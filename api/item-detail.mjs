// api/item-detail.js
import { promises as fs } from "fs";
import path from "path";
import jwt from "jsonwebtoken";

const MENU_FILE_PATH = path.join(process.cwd(), "src/data/menu.json");
const IMAGE_STORAGE_PATH = path.join(process.cwd(), "public/images");
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
  const { id } = req.params; // <----- A MUDANÇA IMPORTANTE AQUI

  const idToFind = parseInt(id);

  if (isNaN(idToFind)) {
    return res.status(400).json({ message: "ID inválido." });
  }

  if (req.method === "GET") {
    const menu = await readMenu();
    const item = menu.find((item) => item.id === idToFind);
    if (item) {
      res.status(200).json(item);
    } else {
      res.status(404).json({ message: "Item não encontrado." });
    }
  } else if (req.method === "PUT") {
    if (!authenticate(req)) {
      return res
        .status(401)
        .json({ message: "Token de autorização inválido." });
    }

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
    const index = menu.findIndex((item) => item.id === idToFind);

    if (index !== -1) {
      const oldImagePath = menu[index].imagePath;
      menu[index] = { ...menu[index], ...updatedItem };

      if (await writeMenu(menu)) {
        // Remover a imagem antiga se um novo caminho de imagem foi fornecido e é diferente
        if (
          updatedItem.imagePath &&
          updatedItem.imagePath !== oldImagePath &&
          oldImagePath
        ) {
          const oldImagePathFull = path.join(IMAGE_STORAGE_PATH, oldImagePath);
          fs.unlink(oldImagePathFull).catch((err) => {
            console.error("Erro ao excluir imagem antiga:", err);
          });
        }
        res.status(200).json(menu[index]);
      } else {
        res.status(500).json({ message: "Erro ao atualizar o item." });
      }
    } else {
      res.status(404).json({ message: "Item não encontrado." });
    }
  } else if (req.method === "DELETE") {
    if (!authenticate(req)) {
      return res
        .status(401)
        .json({ message: "Token de autorização inválido." });
    }

    const menu = await readMenu();
    const indexToDelete = menu.findIndex((item) => item.id === idToFind);

    if (indexToDelete !== -1) {
      const imageToDelete = menu[indexToDelete].imagePath;
      const updatedMenu = menu.filter((item) => item.id !== idToFind);

      if (await writeMenu(updatedMenu)) {
        // Remover a imagem associada ao item deletado
        if (imageToDelete) {
          const imagePathFull = path.join(IMAGE_STORAGE_PATH, imageToDelete);
          fs.unlink(imagePathFull).catch((err) => {
            console.error("Erro ao excluir imagem:", err);
          });
        }
        res.status(200).json({ message: "Item removido com sucesso." });
      } else {
        res.status(500).json({ message: "Erro ao remover o item." });
      }
    } else {
      res.status(404).json({ message: "Item não encontrado." });
    }
  } else {
    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
