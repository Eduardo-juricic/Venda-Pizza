// src/components/Checkout.jsx
import { useState, useContext } from "react";
import { CartContext } from "../contexts/CartContext";
import { useNavigate, Link } from "react-router-dom";

function Checkout() {
  const { cart, clearCart } = useContext(CartContext);
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [entrega, setEntrega] = useState("retirada"); // 'retirada' ou 'entrega'
  const [endereco, setEndereco] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [cep, setCep] = useState(""); // eslint-disable-next-line no-unused-vars
  const [pagamentoEntrega, setPagamentoEntrega] = useState("na_entrega");
  const [observacoes, setObservacoes] = useState("");
  const [errors, setErrors] = useState({}); // eslint-disable-next-line no-unused-vars
  const [metodoPagamentoOnline, setMetodoPagamentoOnline] = useState("");

  const calculateTotal = () => {
    return cart
      .reduce((total, item) => {
        let price = 0;
        if (item.prices && item.size) {
          const selectedPrice = item.prices[item.size];
          price =
            parseFloat(
              selectedPrice?.replace("R$ ", "").replace(",", ".") || "0"
            ) || 0;
        }
        return total + price * item.quantity;
      }, 0)
      .toFixed(2);
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    if (!nome.trim()) {
      newErrors.nome = "O nome é obrigatório.";
      isValid = false;
    }

    if (!telefone.trim()) {
      newErrors.telefone = "O telefone é obrigatório.";
      isValid = false;
    }

    if (entrega === "entrega") {
      if (!endereco.trim()) {
        newErrors.endereco = "O endereço é obrigatório para entrega.";
        isValid = false;
      }
      if (!numero.trim()) {
        newErrors.numero = "O número é obrigatório para entrega.";
        isValid = false;
      }
      if (!bairro.trim()) {
        newErrors.bairro = "O bairro é obrigatório para entrega.";
        isValid = false;
      }
      if (!cidade.trim()) {
        newErrors.cidade = "A cidade é obrigatória para entrega.";
        isValid = false;
      }
      if (!estado.trim()) {
        newErrors.estado = "O estado é obrigatório para entrega.";
        isValid = false;
      }
      if (!cep.trim()) {
        newErrors.cep = "O CEP é obrigatório para entrega.";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) {
      return;
    }

    const metodoDePagamentoFinal =
      entrega === "retirada"
        ? "na_retirada"
        : pagamentoEntrega === "na_entrega"
        ? "na_entrega"
        : metodoPagamentoOnline; // Usa o método online se selecionado

    const orderData = {
      items: cart.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        observation: item.observation,
        size: item.size, // Inclua o tamanho no pedido
      })),
      nome,
      telefone,
      email,
      entrega,
      endereco:
        entrega === "entrega"
          ? { endereco, numero, complemento, bairro, cidade, estado, cep }
          : null,
      metodoPagamento: metodoDePagamentoFinal,
      observacoes,
      total: calculateTotal(),
      timestamp: Date.now(),
    };

    try {
      const response = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        clearCart();
        navigate("/pedido-confirmado");
      } else {
        const error = await response.json();
        console.error("Erro ao finalizar pedido:", error);
        alert(
          "Houve um erro ao processar seu pedido. Por favor, tente novamente."
        );
      }
    } catch (error) {
      console.error("Erro ao enviar pedido:", error);
      alert(
        "Houve um erro ao conectar ao servidor. Por favor, tente novamente mais tarde."
      );
    }
  };

  return (
    <div className="py-10 container mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Finalizar Pedido</h2>
      {cart.length === 0 ? (
        <p className="text-gray-600">
          Seu carrinho está vazio.{" "}
          <Link to="/menu" className="text-primary">
            Voltar ao menu
          </Link>
          .
        </p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Resumo do Pedido */}
          <div className="shadow-md rounded-md p-4">
            <h3 className="font-semibold mb-2">Seu Pedido</h3>
            <ul>
              {cart.map((item) => (
                <li
                  key={item.id}
                  className="flex justify-between py-2 border-b"
                >
                  <span>
                    {item.name} ({item.size}) x {item.quantity}
                  </span>
                  <span>
                    R${" "}
                    {(
                      parseFloat(
                        item.prices?.[item.size]
                          ?.replace("R$ ", "")
                          .replace(",", ".") || 0
                      ) * item.quantity
                    ).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="font-semibold text-lg mt-2">
              Total: R$ {calculateTotal()}
            </div>
          </div>

          {/* Informações do Cliente e Opções */}
          <div className="shadow-md rounded-md p-4">
            <h3 className="font-semibold mb-2">Informações</h3>
            <div className="mb-4">
              <label
                htmlFor="nome"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Nome:
              </label>
              <input
                type="text"
                id="nome"
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                  errors.nome ? "border-red-500" : ""
                }`}
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
              {errors.nome && (
                <p className="text-red-500 text-xs italic">{errors.nome}</p>
              )}
            </div>
            <div className="mb-4">
              <label
                htmlFor="telefone"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Telefone:
              </label>
              <input
                type="tel"
                id="telefone"
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                  errors.telefone ? "border-red-500" : ""
                }`}
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
              />
              {errors.telefone && (
                <p className="text-red-500 text-xs italic">{errors.telefone}</p>
              )}
            </div>
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Email (opcional):
              </label>
              <input
                type="email"
                id="email"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Opção de Entrega:
              </label>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="retirada"
                  value="retirada"
                  checked={entrega === "retirada"}
                  onChange={(e) => setEntrega(e.target.value)}
                  className="mr-2"
                />
                <label htmlFor="retirada" className="mr-4">
                  Retirar na Pizzaria
                </label>
                <input
                  type="radio"
                  id="entrega"
                  value="entrega"
                  checked={entrega === "entrega"}
                  onChange={(e) => setEntrega(e.target.value)}
                  className="mr-2"
                />
                <label htmlFor="entrega">Entrega</label>
              </div>
            </div>

            {entrega === "entrega" && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Detalhes da Entrega</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <label
                      htmlFor="endereco"
                      className="block text-gray-700 text-sm font-bold mb-2"
                    >
                      Endereço:
                    </label>
                    <input
                      type="text"
                      id="endereco"
                      className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                        errors.endereco ? "border-red-500" : ""
                      }`}
                      value={endereco}
                      onChange={(e) => setEndereco(e.target.value)}
                    />
                    {errors.endereco && (
                      <p className="text-red-500 text-xs italic">
                        {errors.endereco}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="numero"
                      className="block text-gray-700 text-sm font-bold mb-2"
                    >
                      Número:
                    </label>
                    <input
                      type="text"
                      id="numero"
                      className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                        errors.numero ? "border-red-500" : ""
                      }`}
                      value={numero}
                      onChange={(e) => setNumero(e.target.value)}
                    />
                    {errors.numero && (
                      <p className="text-red-500 text-xs italic">
                        {errors.numero}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="complemento"
                      className="block text-gray-700 text-sm font-bold mb-2"
                    >
                      Complemento (opcional):
                    </label>
                    <input
                      type="text"
                      id="complemento"
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      value={complemento}
                      onChange={(e) => setComplemento(e.target.value)}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="bairro"
                      className="block text-gray-700 text-sm font-bold mb-2"
                    >
                      Bairro:
                    </label>
                    <input
                      type="text"
                      id="bairro"
                      className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                        errors.bairro ? "border-red-500" : ""
                      }`}
                      value={bairro}
                      onChange={(e) => setBairro(e.target.value)}
                    />
                    {errors.bairro && (
                      <p className="text-red-500 text-xs italic">
                        {errors.bairro}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="cidade"
                      className="block text-gray-700 text-sm font-bold mb-2"
                    >
                      Cidade:
                    </label>
                    <input
                      type="text"
                      id="cidade"
                      className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                        errors.cidade ? "border-red-500" : ""
                      }`}
                      value={cidade}
                      onChange={(e) => setCidade(e.target.value)}
                    />
                    {errors.cidade && (
                      <p className="text-red-500 text-xs italic">
                        {errors.cidade}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="estado"
                      className="block text-gray-700 text-sm font-bold mb-2"
                    >
                      Estado:
                    </label>
                    <input
                      type="text"
                      id="estado"
                      className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                        errors.estado ? "border-red-500" : ""
                      }`}
                      value={estado}
                      onChange={(e) => setEstado(e.target.value)}
                    />
                    {errors.estado && (
                      <p className="text-red-500 text-xs italic">
                        {errors.estado}
                      </p>
                    )}
                  </div>
                  <div className="col-span-2">
                    <label
                      htmlFor="cep"
                      className="block text-gray-700 text-sm font-bold mb-2"
                    >
                      CEP:
                    </label>
                    <input
                      type="text"
                      id="cep"
                      className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                        errors.cep ? "border-red-500" : ""
                      }`}
                      value={cep}
                      onChange={(e) => setCep(e.target.value)}
                    />
                    {errors.cep && (
                      <p className="text-red-500 text-xs italic">
                        {errors.cep}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="mb-4">
              <label
                htmlFor="observacoes"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Observações (opcional):
              </label>
              <textarea
                id="observacoes"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows="3"
              ></textarea>
            </div>

            <button
              type="submit"
              className="bg-primary text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Finalizar Pedido
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default Checkout;
