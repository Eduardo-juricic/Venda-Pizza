// api/login.mjs
export default async (req, res) => {
  console.log("Função de login acionada!");
  res.status(200).json({ message: "Teste de login bem-sucedido!" });
};
