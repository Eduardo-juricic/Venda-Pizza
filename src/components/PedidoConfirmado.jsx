import { Link } from "react-router-dom";

function PedidoConfirmado() {
  return (
    <div className="py-10 container mx-auto text-center">
      <h2 className="text-2xl font-semibold mb-4">Pedido Confirmado!</h2>
      <p className="text-gray-600 mb-4">
        Seu pedido foi realizado com sucesso. Em breve entraremos em contato
        para confirmar os detalhes.
      </p>
      <p className="text-gray-600 mb-4">
        Obrigado por escolher a Delícia Pizza!
      </p>
      <Link
        to="/"
        className="inline-block bg-primary text-white font-semibold rounded-md py-2 px-4 hover:bg-primary-light transition-colors duration-300"
      >
        Voltar ao Menu
      </Link>
    </div>
  );
}

export default PedidoConfirmado;
