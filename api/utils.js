// api/utils.js
const jwt = require("jsonwebtoken");

const JWT_SECRET = "suaChaveSecretaSuperSegura"; // *** CERTIFIQUE-SE DE USAR A MESMA CHAVE SECRETA ***

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Token inválido." });
      }
      req.adminId = decoded.adminId;
      // Em API Routes, não temos o conceito de 'next()'. Precisamos retornar o resultado.
      return decoded.adminId;
    });
  } else {
    res.status(401).json({ message: "Token de autorização não encontrado." });
    return null; // Ou lançar um erro, dependendo de como você quer lidar com isso nas rotas
  }
  return null; // Se a autenticação falhar
};

module.exports = { authenticate };
