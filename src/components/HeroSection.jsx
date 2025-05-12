import { Link } from "react-router-dom";
import pizzaHeroImage from "../assets/pizza-fundo.jpg";

function HeroSection() {
  return (
    <section
      className="relative py-48 flex items-center justify-center overflow-hidden" // Aumentei o py-32 para py-48
      style={{
        backgroundImage: `url(${pizzaHeroImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute top-0 left-0 w-full h-full bg-black opacity-50"></div>
      <div className="container mx-auto text-center relative z-10">
        <h1 className="text-5xl lg:text-6xl font-heading text-secondary font-bold mb-8">
          Sabor e Qualidade em Cada Fatia.
        </h1>
        <p className="text-xl lg:text-2xl text-white mb-10">
          A sua melhor experiência com pizza começa aqui. Escolha seus sabores
          favoritos e peça online!
        </p>
        <Link
          to="/cardapio" // Alterei o 'to' para '/cardapio'
          className="bg-accent text-text-primary font-bold py-5 px-10 rounded-full shadow-lg hover:bg-accent-dark transition-colors duration-300 text-lg"
        >
          Descubra Nosso Cardápio
        </Link>
      </div>
    </section>
  );
}

export default HeroSection;
