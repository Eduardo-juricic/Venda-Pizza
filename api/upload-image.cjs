import { promises as fs } from "fs";
import path from "path";
import formidable from "formidable";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

export const config = {
  api: {
    bodyParser: false, // Desabilitar o bodyParser padrão do Next.js para lidar com form data
  },
};

const IMAGE_STORAGE_PATH = path.join(process.cwd(), "public/images");
const JWT_SECRET = process.env.JWT_SECRET || "suaChaveSecretaSuperSegura";

// Certifique-se de que a pasta de destino exista
fs.mkdir(IMAGE_STORAGE_PATH, { recursive: true }).catch(console.error);

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

const parseForm = (req) => {
  return new Promise((resolve, reject) => {
    const form = formidable({
      multiples: false,
      uploadDir: IMAGE_STORAGE_PATH,
      keepExtensions: true,
    });
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
        return;
      }
      resolve({ fields, files });
    });
  });
};

export default async function handler(req, res) {
  if (req.method === "POST") {
    if (!authenticate(req)) {
      return res
        .status(401)
        .json({ message: "Token de autorização inválido." });
    }

    try {
      const { files } = await parseForm(req);
      const uploadedFile = files.image;

      if (!uploadedFile) {
        return res
          .status(400)
          .json({ message: 'Nenhuma imagem enviada com o campo "image".' });
      }

      const fileExtension = path.extname(uploadedFile.originalFilename);
      const newFilename = `${uuidv4()}${fileExtension}`;
      const oldPath = uploadedFile.filepath;
      const newPath = path.join(IMAGE_STORAGE_PATH, newFilename);

      await fs.rename(oldPath, newPath);

      res.status(200).json({ filename: newFilename });
    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error);
      res.status(500).json({ message: "Erro ao fazer upload da imagem." });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
