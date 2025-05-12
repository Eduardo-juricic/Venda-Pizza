import { ShieldCheckIcon, BoltIcon, CakeIcon } from "@heroicons/react/24/solid";

function DestaquesSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-heading text-brown-600 font-bold mb-16">
          Por que escolher a Delicia Pizza?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <div className="p-8 rounded-lg shadow-md bg-white hover:shadow-lg transition-shadow duration-300">
            <ShieldCheckIcon className="h-12 w-12 mx-auto mb-6 text-accent" />
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              Qualidade Impecável
            </h3>
            <p className="text-text-secondary text-sm">
              Utilizamos apenas ingredientes frescos e da mais alta qualidade.
            </p>
          </div>
          <div className="p-8 rounded-lg shadow-md bg-white hover:shadow-lg transition-shadow duration-300">
            <BoltIcon className="h-12 w-12 mx-auto mb-6 text-primary" />
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              Entrega Super Rápida
            </h3>
            <p className="text-text-secondary text-sm">
              Receba sua pizza quentinha em tempo recorde, sem sair de casa.
            </p>
          </div>
          <div className="p-8 rounded-lg shadow-md bg-white hover:shadow-lg transition-shadow duration-300">
            <CakeIcon className="h-12 w-12 mx-auto mb-6 text-yellow-700" />
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              Sabores Exclusivos
            </h3>
            <p className="text-text-secondary text-sm">
              Explore nosso menu com criações únicas que vão surpreender seu
              paladar.
            </p>
          </div>
          {/* Adicione mais destaques aqui */}
        </div>
      </div>
    </section>
  );
}

export default DestaquesSection;
