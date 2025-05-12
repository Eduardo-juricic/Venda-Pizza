// api/utils.js
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "suaChaveSecretaSuperSegura"; // *** CERTIFIQUE-SE DE USAR A MESMA CHAVE SECRETA ***

export const authenticate = (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.adminId = decoded.adminId;
      return decoded.adminId;
    } catch (err) {
      res.status(401).json({ message: "Token inválido." });
      return null;
    }
  } else {
    res.status(401).json({ message: "Token de autorização não encontrado." });
    return null;
  }
  return null; // Se a autenticação falhar
};
