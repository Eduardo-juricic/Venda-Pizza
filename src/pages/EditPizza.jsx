import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

function EditPizza() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pizza, setPizza] = useState({
    name: "",
    description: "",
    price: { pequena: "", media: "", grande: "", familia: "" },
    imagePath: "",
  });
  const [newImage, setNewImage] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchPizza = async () => {
      try {
        const response = await fetch(`/api/menu/${id}`);
        if (response.ok) {
          const data = await response.json();
          setPizza(data);
        } else {
          setErrorMessage("Erro ao carregar os dados da pizza.");
        }
      } catch (error) {
        console.error("Erro ao buscar a pizza:", error);
        setErrorMessage("Erro ao buscar os dados da pizza.");
      }
    };

    fetchPizza();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("price.")) {
      const [, size] = name.split(".");
      setPizza((prevPizza) => ({
        ...prevPizza,
        price: { ...prevPizza.price, [size]: value },
      }));
    } else {
      setPizza((prevPizza) => ({ ...prevPizza, [name]: value }));
    }
  };

  const handleImageChange = (event) => {
    setNewImage(event.target.files[0]);
  };

  const handleSaveEdit = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    let newImagePath = pizza.imagePath;
    const formData = new FormData();

    if (newImage) {
      formData.append("image", newImage);
      try {
        const uploadResponse = await fetch("/api/upload-image", {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Use o token JWT
          },
        });
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          newImagePath = uploadData.filename;
        } else {
          const errorData = await uploadResponse.json();
          setErrorMessage(
            `Erro ao enviar a nova imagem: ${
              errorData.message || "Erro desconhecido"
            }`
          );
          return;
        }
      } catch (error) {
        console.error("Erro ao enviar a nova imagem:", error);
        setErrorMessage("Erro ao enviar a nova imagem.");
        return;
      }
    }

    try {
      const response = await fetch(`/api/menu/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Use o token JWT
        },
        body: JSON.stringify({ ...pizza, imagePath: newImagePath }),
      });

      if (response.ok) {
        setSuccessMessage("Pizza atualizada com sucesso!");
        setTimeout(() => navigate("/admin"), 1500);
      } else {
        const errorData = await response.json();
        setErrorMessage(
          `Erro ao salvar a edição: ${errorData.message || "Erro desconhecido"}`
        );
      }
    } catch (error) {
      console.error("Erro ao salvar a edição:", error);
      setErrorMessage("Erro ao salvar a edição.");
    }
  };

  return (
    <div className="container mx-auto mt-8 p-6 bg-white shadow-md rounded-md">
      <h2 className="text-xl font-semibold mb-4">Editar Pizza</h2>
      {errorMessage && <div className="text-red-500 mb-4">{errorMessage}</div>}
      {successMessage && (
        <div className="text-green-500 mb-4">{successMessage}</div>
      )}

      {pizza ? (
        <div>
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
              name="name"
              value={pizza.name}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="descricao"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Descrição:
            </label>
            <textarea
              id="descricao"
              name="description"
              value={pizza.description}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            ></textarea>
          </div>
          <div className="mb-4 grid grid-cols-4 gap-2">
            <div>
              <label
                htmlFor="preco-pequena"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Preço Pequena:
              </label>
              <input
                type="number"
                id="preco-pequena"
                name="price.pequena"
                value={pizza.price?.pequena || ""}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div>
              <label
                htmlFor="preco-media"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Preço Média:
              </label>
              <input
                type="number"
                id="preco-media"
                name="price.media"
                value={pizza.price?.media || ""}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div>
              <label
                htmlFor="preco-grande"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Preço Grande:
              </label>
              <input
                type="number"
                id="preco-grande"
                name="price.grande"
                value={pizza.price?.grande || ""}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div>
              <label
                htmlFor="preco-familia"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Preço Família:
              </label>
              <input
                type="number"
                id="preco-familia"
                name="price.familia"
                value={pizza.price?.familia || ""}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
          </div>
          <div className="mb-4">
            <label
              htmlFor="nova-imagem"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Nova Imagem:
            </label>
            <input
              type="file"
              id="nova-imagem"
              onChange={handleImageChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            {pizza.imagePath && (
              <div className="mt-2">
                <img
                  src={`/images/${pizza.imagePath}`}
                  alt={pizza.name}
                  className="w-32 h-32 object-cover rounded-md"
                />
                <p className="text-gray-500 text-xs mt-1">Imagem atual</p>
              </div>
            )}
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleSaveEdit}
              className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Salvar Edição
            </button>
            <button
              onClick={() => navigate("/admin")}
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <p>Carregando dados da pizza...</p>
      )}
    </div>
  );
}

export default EditPizza;
