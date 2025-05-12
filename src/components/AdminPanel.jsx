// AdminPanel.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AdminPanel = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: { pequena: "", media: "", grande: "", familia: "" },
    imagePath: "",
    category: "",
    isOnHomepage: false,
  });
  const [editingItem, setEditingItem] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    price: { pequena: "", media: "", grande: "", familia: "" },
    imagePath: "",
    category: "",
    isOnHomepage: false,
  });
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [pedidos, setPedidos] = useState([]);
  const [loadingPedidos, setLoadingPedidos] = useState(true);
  const [errorPedidos, setErrorPedidos] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/menu") // <-- ATUALIZADO
      .then((response) => response.json())
      .then((data) => setMenuItems(data))
      .catch((error) => console.error("Erro ao buscar o menu:", error));

    const fetchInitialPedidos = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/admin/login"); // Redirecionar se não houver token
          return;
        }
        const response = await fetch("/api/admin/orders", {
          // <-- ATUALIZADO
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          if (response.status === 401) {
            navigate("/admin/login"); // Redirecionar se não autorizado
          } else {
            throw new Error(`Erro ao buscar pedidos: ${response.status}`);
          }
        }
        const data = await response.json();
        setPedidos(data);
        setLoadingPedidos(false);
      } catch (error) {
        console.error("Erro ao buscar pedidos:", error);
        setErrorPedidos(error.message);
        setLoadingPedidos(false);
      }
    };

    fetchInitialPedidos();

    // Conectar ao fluxo de eventos SSE
    const eventSource = new EventSource("/admin/events"); // <-- ATUALIZADO

    eventSource.onopen = () => {
      console.log("Conexão SSE aberta com o servidor.");
    };

    eventSource.onerror = (error) => {
      console.error("Erro na conexão SSE:", error);
      eventSource.close(); // Tentar reconectar ou lidar com o erro
    };

    eventSource.addEventListener("newOrder", (event) => {
      try {
        const newOrderData = JSON.parse(event.data);
        console.log("Novo pedido recebido via SSE:", newOrderData);
        // Atualizar o estado de pedidos adicionando o novo pedido ao início da lista
        setPedidos((prevPedidos) => [newOrderData, ...prevPedidos]);
        // Opcional: Mostrar uma notificação visual para o admin
        alert("Novo pedido recebido!");
      } catch (error) {
        console.error("Erro ao processar dados do novo pedido:", error);
      }
    });

    // Limpar a conexão SSE ao desmontar o componente
    return () => {
      eventSource.close();
      console.log("Conexão SSE fechada.");
    };
  }, [navigate]);

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    if (name.startsWith("price.")) {
      const pricePart = name.split(".")[1];
      setNewItem((prevItem) => ({
        ...prevItem,
        price: { ...prevItem.price, [pricePart]: value },
      }));
    } else if (type === "checkbox") {
      setNewItem((prevItem) => ({ ...prevItem, [name]: checked }));
    } else {
      setNewItem((prevItem) => ({ ...prevItem, [name]: value }));
    }
  };

  const handleEditInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    if (name.startsWith("price.")) {
      const pricePart = name.split(".")[1];
      setEditFormData((prevData) => ({
        ...prevData,
        price: { ...prevData.price, [pricePart]: value },
      }));
    } else if (type === "checkbox") {
      setEditFormData((prevData) => ({ ...prevData, [name]: checked }));
    } else {
      setEditFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const handleImageChange = (event) => {
    setImageFile(event.target.files[0]);
  };

  const handleUploadImage = async () => {
    if (!imageFile) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("image", imageFile);

    try {
      const response = await fetch("/api/upload-image", {
        // <-- ATUALIZADO
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Use o token do localStorage
        },
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        setNewItem((prevItem) => ({ ...prevItem, imagePath: data.filename }));
        setUploadError("");
        alert("Imagem enviada com sucesso!");
      } else {
        const errorData = await response.text();
        setUploadError(`Erro ao enviar imagem: ${errorData}`);
      }
    } catch (error) {
      setUploadError(`Erro ao enviar imagem: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleAddItem = async () => {
    try {
      const response = await fetch("/api/menu", {
        // <-- ATUALIZADO
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Use o token do localStorage
        },
        body: JSON.stringify(newItem),
      });
      if (response.ok) {
        const addedItem = await response.json();
        setMenuItems([...menuItems, addedItem]);
        setNewItem({
          name: "",
          description: "",
          price: { pequena: "", media: "", grande: "", familia: "" },
          imagePath: "",
        });
        setImageFile(null);
        alert("Pizza adicionada com sucesso!");
      } else {
        const errorData = await response.text();
        alert(`Erro ao adicionar pizza: ${errorData}`);
      }
    } catch (error) {
      alert(`Erro ao adicionar pizza: ${error.message}`);
    }
  };

  const handleSaveEdit = async () => {
    try {
      const response = await fetch(
        `/api/menu/${editingItem.id}`, // <-- ATUALIZADO
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Use o token do localStorage
          },
          body: JSON.stringify(editFormData),
        }
      );
      if (response.ok) {
        const updatedItem = await response.json();
        setMenuItems(
          menuItems.map((item) =>
            item.id === updatedItem.id ? updatedItem : item
          )
        );
        setEditingItem(null);
        alert("Pizza atualizada com sucesso!");
      } else {
        const errorData = await response.text();
        alert(`Erro ao atualizar pizza: ${errorData}`);
      }
    } catch (error) {
      alert(`Erro ao atualizar pizza: ${error.message}`);
    }
  };

  const handleDeleteItem = async (idToDelete) => {
    if (window.confirm("Tem certeza que deseja remover esta pizza?")) {
      try {
        const response = await fetch(
          `/api/menu/${idToDelete}`, // <-- ATUALIZADO
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`, // Use o token do localStorage
            },
          }
        );
        if (response.ok) {
          setMenuItems(menuItems.filter((item) => item.id !== idToDelete));
          alert("Pizza removida com sucesso!");
        } else if (response.status === 401) {
          alert("Não autorizado a excluir a pizza.");
          // Lide com a não autorização, como redirecionar para a tela de login
        } else {
          const errorData = await response.text();
          alert(`Erro ao remover pizza: ${errorData}`);
        }
      } catch (error) {
        alert(`Erro ao remover pizza: ${error.message}`);
      }
    }
  };

  const handleMarcarEntregue = async (timestamp) => {
    try {
      const response = await fetch(
        `/api/admin/orders/${timestamp}/delivered`, // <-- ATUALIZADO (assumindo que você criará essa rota)
        {
          method: "PUT",
        }
      );
      if (response.ok) {
        setPedidos(pedidos.filter((pedido) => pedido.timestamp !== timestamp));
        alert("Pedido marcado como entregue!");
      } else {
        const errorData = await response.json();
        console.error("Erro ao marcar como entregue:", errorData);
        alert("Erro ao marcar pedido como entregue.");
      }
    } catch (error) {
      console.error("Erro ao comunicar com o servidor:", error);
      alert("Erro ao comunicar com o servidor.");
    }
  };

  const handleRemoverPedido = async (timestamp) => {
    if (window.confirm("Tem certeza que deseja remover este pedido?")) {
      try {
        const token = localStorage.getItem("token"); // *** Linha importante ***
        if (!token) {
          console.error("Token de admin não encontrado.");
          navigate("/admin/login"); // Redirecionar se não houver token
          return;
        }
        const response = await fetch(
          `/api/admin/orders/${timestamp}`, // <-- ATUALIZADO
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`, // *** Linha importante ***
            },
          }
        );
        if (response.ok) {
          setPedidos(
            pedidos.filter((pedido) => pedido.timestamp !== timestamp)
          );
          alert("Pedido removido com sucesso!");
        } else {
          let errorData;
          try {
            errorData = await response.json();
            console.error("Erro ao remover pedido:", errorData);
            alert("Erro ao remover pedido.");
          } catch {
            const errorText = await response.text();
            console.error("Erro ao remover pedido (não JSON):", errorText);
            alert("Erro ao remover pedido.");
          }
        }
      } catch (error) {
        console.error("Erro ao comunicar com o servidor:", error);
        alert("Erro ao comunicar com o servidor.");
      }
    }
  };

  const handleLogout = () => {
    // Adicione a função de logout
    localStorage.removeItem("token");
    navigate("/admin/login");
  };

  if (loadingPedidos) {
    return <div className="p-6 font-sans">Carregando pedidos...</div>;
  }

  if (errorPedidos) {
    return (
      <div className="p-6 font-sans">
        Erro ao carregar pedidos: {errorPedidos.message}
      </div>
    );
  }

  return (
    <div className="p-6 font-sans">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Painel de Administração
        </h2>
        <button
          onClick={handleLogout}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Logout
        </button>
      </div>

      {/* Seção de Adicionar Nova Pizza */}
      <h3 className="text-xl font-semibold mb-3 text-gray-700">
        Adicionar Nova Pizza
      </h3>
      <div className="mb-3">
        <label
          htmlFor="name"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Nome:
        </label>
        <input
          type="text"
          id="name"
          name="name"
          placeholder="Nome"
          value={newItem.name}
          onChange={handleInputChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="mb-3">
        <label
          htmlFor="description"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Descrição:
        </label>
        <textarea
          id="description"
          name="description"
          placeholder="Descrição"
          value={newItem.description}
          onChange={handleInputChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        ></textarea>
      </div>
      {/* Campo de Categoria */}
      <div className="mb-3">
        <label
          htmlFor="category"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Categoria:
        </label>
        <select
          id="category"
          name="category"
          value={newItem.category}
          onChange={handleInputChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        >
          <option value="">Selecione a categoria</option>
          <option value="salgada">Salgada</option>
          <option value="doce">Doce</option>
          <option value="vegetariana">Vegetariana</option>
          {/* Adicione mais opções conforme necessário */}
        </select>
      </div>

      {/* Checkbox de Mostrar na Página Principal */}
      <div className="mb-4 flex items-center">
        <input
          type="checkbox"
          id="isOnHomepage"
          name="isOnHomepage"
          checked={newItem.isOnHomepage}
          onChange={(event) =>
            setNewItem({ ...newItem, isOnHomepage: event.target.checked })
          }
          className="mr-2 leading-tight"
        />
        <label
          htmlFor="isOnHomepage"
          className="text-gray-700 text-sm font-bold"
        >
          Mostrar na página principal
        </label>
      </div>
      <div className="mb-3">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Preços:
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            name="price.pequena"
            placeholder="Pequena"
            value={newItem.price.pequena}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-1/4 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          <input
            type="number"
            name="price.media"
            placeholder="Média"
            value={newItem.price.media}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-1/4 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          <input
            type="number"
            name="price.grande"
            placeholder="Grande"
            value={newItem.price.grande}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-1/4 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          <input
            type="number"
            name="price.familia"
            placeholder="Família"
            value={newItem.price.familia}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-1/4 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
      </div>
      <div className="mb-4 flex items-center gap-2">
        <input
          type="file"
          onChange={handleImageChange}
          className="shadow appearance-none border rounded w-1/2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
        <button
          className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
            uploading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={handleUploadImage}
          disabled={uploading}
        >
          {uploading ? "Enviando..." : "Enviar Imagem"}
        </button>
        {uploadError && <p className="text-red-500 text-sm">{uploadError}</p>}
        {newItem.imagePath && (
          <p className="text-green-500 text-sm">Imagem: {newItem.imagePath}</p>
        )}
      </div>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        onClick={handleAddItem}
      >
        Adicionar Pizza
      </button>

      {/* Seção da Lista de Pizzas */}
      <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-700">
        Lista de Pizzas
      </h3>
      <ul className="space-y-2">
        {menuItems.map((item) => (
          <li
            key={item.id}
            className="bg-white shadow border rounded p-3 flex items-center justify-between"
          >
            <div className="flex-grow">
              {item.name} - {item.description} - Preços: P:{item.price.pequena},
              M:{item.price.media}, G:{item.price.grande}, F:
              {item.price.familia}- Imagem: {item.imagePath}
            </div>
            <div className="space-x-2">
              <button
                className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline text-sm"
                onClick={() => {
                  setEditingItem(item);
                  setEditFormData({
                    id: item.id,
                    name: item.name,
                    description: item.description,
                    price: { ...item.price },
                    imagePath: item.imagePath,
                    category: item.category || "",
                    isOnHomepage: item.isOnHomepage || false,
                  });
                  // Se você quiser navegar para uma página de edição separada *depois* de preencher o estado,
                  // você pode adicionar navigate(`/admin/edit/${item.id}`); aqui.
                  // Mas para manter a edição no mesmo painel, você não precisa desta linha agora.
                }}
              >
                Editar
              </button>
              <button
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline text-sm"
                onClick={() => handleDeleteItem(item.id)}
              >
                Remover
              </button>
            </div>
          </li>
        ))}
      </ul>

      {editingItem && (
        <div className="mt-6 p-4 border rounded shadow-md bg-gray-100">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">
            Editar Pizza
          </h3>
          <div className="mb-3">
            <label
              htmlFor="editName"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Nome:
            </label>
            <input
              type="text"
              id="editName"
              name="name"
              value={editFormData.name}
              onChange={handleEditInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mb-3">
            <label
              htmlFor="editDescription"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Descrição:
            </label>
            <textarea
              id="editDescription"
              name="description"
              value={editFormData.description}
              onChange={handleEditInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            ></textarea>
          </div>
          <div className="mb-3">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Preços:
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                name="price.pequena"
                placeholder="Pequena"
                value={editFormData.price.pequena}
                onChange={handleEditInputChange}
                className="shadow appearance-none border rounded w-1/4 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
              <input
                type="number"
                name="price.media"
                placeholder="Média"
                value={editFormData.price.media}
                onChange={handleEditInputChange}
                className="shadow appearance-none border rounded w-1/4 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
              <input
                type="number"
                name="price.grande"
                placeholder="Grande"
                value={editFormData.price.grande}
                onChange={handleEditInputChange}
                className="shadow appearance-none border rounded w-1/4 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
              <input
                type="number"
                name="price.familia"
                placeholder="Família"
                value={editFormData.price.familia}
                onChange={handleEditInputChange}
                className="shadow appearance-none border rounded w-1/4 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
          </div>
          {/* Campo de Editar Categoria */}
          <div className="mb-3">
            <label
              htmlFor="editCategory"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Categoria:
            </label>
            <select
              id="editCategory"
              name="category"
              value={editFormData.category}
              onChange={handleEditInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">Selecione a categoria</option>
              <option value="salgada">Salgada</option>
              <option value="doce">Doce</option>
              <option value="vegetariana">Vegetariana</option>
              {/* Adicione mais opções conforme necessário */}
            </select>
          </div>
          {/* Checkbox de Editar Mostrar na Página Principal */}
          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              id="editIsOnHomepage"
              name="isOnHomepage"
              checked={editFormData.isOnHomepage}
              onChange={handleEditInputChange}
              className="mr-2 leading-tight"
            />
            <label
              htmlFor="editIsOnHomepage"
              className="text-gray-700 text-sm font-bold"
            >
              Mostrar na página principal
            </label>
          </div>
          <div className="flex gap-2">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={handleSaveEdit}
            >
              Salvar Edição
            </button>
            <button
              className="bg-gray-400 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={() => setEditingItem(null)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Seção de Pedidos Pendentes */}
      <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-700">
        Pedidos Pendentes
      </h3>
      {pedidos.length === 0 ? (
        <p>Nenhum pedido pendente.</p>
      ) : (
        <ul>
          {pedidos.map((pedido) => (
            <li
              key={pedido.timestamp}
              className="border rounded p-4 mb-4 bg-white shadow"
            >
              <h4 className="font-semibold">
                Pedido Recebido em:{" "}
                {new Date(pedido.timestamp).toLocaleString()}
              </h4>
              <p>Nome: {pedido.nome}</p>
              <p>Telefone: {pedido.telefone}</p>
              {pedido.email && <p>Email: {pedido.email}</p>}
              <p>Entrega: {pedido.entrega === "entrega" ? "Sim" : "Não"}</p>
              {pedido.entrega === "entrega" && (
                <div>
                  <p>
                    Endereço: {pedido.endereco.endereco},{" "}
                    {pedido.endereco.numero} {pedido.endereco.complemento}
                  </p>
                  <p>
                    Bairro: {pedido.endereco.bairro}, {pedido.endereco.cidade} -{" "}
                    {pedido.endereco.estado}
                  </p>
                  <p>CEP: {pedido.endereco.cep}</p>
                </div>
              )}
              <h5 className="font-semibold mt-2">Itens do Pedido:</h5>
              <ul>
                {pedido.items.map((item) => (
                  <li key={item.id}>
                    ID: {item.id}, Qtd: {item.quantity}
                    {item.observation && `, Obs: ${item.observation}`}
                  </li>
                ))}
              </ul>
              <p className="font-semibold mt-2">Total: R$ {pedido.total}</p>
              <p>Método de Pagamento: {pedido.metodoPagamento}</p>
              {pedido.observacoes && <p>Observações: {pedido.observacoes}</p>}

              <div className="mt-4 flex gap-2">
                <button
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                  onClick={() => handleMarcarEntregue(pedido.timestamp)}
                >
                  Marcar como Entregue
                </button>
                <button
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                  onClick={() => handleRemoverPedido(pedido.timestamp)}
                >
                  Remover Pedido
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminPanel;
