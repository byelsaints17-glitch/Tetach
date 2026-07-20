import { Tab, Product } from "../types";
import { ChevronRight, ArrowRight, Smartphone, Laptop, Headphones, Sparkles, AlertCircle, ShoppingCart } from "lucide-react";
import ProductCard from "./ProductCard";

interface HomeViewProps {
  products: Product[];
  setActiveTab: (tab: Tab) => void;
  onAddToCart: (product: Product) => void;
  onViewProduct: (product: Product) => void;
  isLoading: boolean;
  onToggleWishlist?: (product: Product) => void;
  wishlist?: Product[];
}

export default function HomeView({ 
  products, 
  setActiveTab, 
  onAddToCart, 
  onViewProduct, 
  isLoading,
  onToggleWishlist,
  wishlist = []
}: HomeViewProps) {
  // Main banner click
  const handleBannerClick = () => {
    setActiveTab("celulares");
  };

  const categories = [
    {
      id: "celulares" as Tab,
      title: "Smartphones",
      desc: "Top de Linha das Melhores Marcas",
      icon: Smartphone,
      color: "bg-blue-600",
      image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&q=80",
    },
    {
      id: "notebooks" as Tab,
      title: "Notebooks",
      desc: "Produtividade de Alta Performance",
      icon: Laptop,
      color: "bg-emerald-600",
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80",
    },
    {
      id: "perifericos" as Tab,
      title: "Periféricos",
      desc: "Teclados Mecânicos, Mouses e Mais",
      icon: Headphones,
      color: "bg-orange-500",
      image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500&q=80",
    },
  ];

  // Get first 8 featured items (dense grid)
  const featured = products.slice(0, 8);

  return (
    <div className="space-y-12">
      {/* 1. Hero Banner */}
      <div className="relative bg-[#0086ff] overflow-hidden rounded-3xl shadow-md min-h-[360px] sm:min-h-[420px] flex flex-col justify-center">
        {/* Abstract background graphics (Brazilian retail blue to orange sweep) */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0086ff] via-[#0086ff]/80 to-transparent z-10" />
        <img
          src="https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=1200&q=80"
          alt="Tecnologia Banner"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-25 select-none pointer-events-none"
        />

        {/* Content */}
        <div className="relative z-20 max-w-2xl px-6 sm:px-12 py-10 space-y-5 text-white">
          <span className="inline-flex items-center gap-1.5 bg-white/20 text-white font-black text-[10px] uppercase tracking-wider px-3 py-1 rounded-full border border-white/20">
            <Sparkles className="w-3.5 h-3.5" /> LANÇAMENTOS DO MÊS
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-none tracking-tight">
            TECNOLOGIA DO SEU JEITO <span className="text-amber-300">COM PIX DESCONTO</span>
          </h2>
          <p className="text-xs sm:text-sm text-blue-50 max-w-md font-bold leading-relaxed">
            As melhores marcas de celular, computadores e periféricos premium selecionados para você, com entrega expressa segurada.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={handleBannerClick}
              className="bg-[#ff6500] hover:bg-[#e05900] text-white font-extrabold py-3.5 px-8 rounded-2xl transition-all shadow-md active:scale-[0.98] text-xs uppercase tracking-wider flex items-center gap-2"
            >
              Comprar Agora <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab("ofertas")}
              className="bg-white/10 hover:bg-white/20 text-white font-extrabold py-3.5 px-6 rounded-2xl transition-all border border-white/20 text-xs uppercase tracking-wider"
            >
              Ofertas Imperdíveis
            </button>
          </div>
        </div>
      </div>

      {/* 2. Categorias Principais */}
      <div className="space-y-5">
        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
          <h3 className="text-xl sm:text-2xl font-black text-gray-800 tracking-tight">
            Categorias em Destaque
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className="group relative bg-white border border-gray-200 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all duration-300 h-40 flex flex-col justify-between"
              >
                {/* Background image & gradient fade */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/70 via-gray-900/25 to-transparent z-10" />
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="absolute inset-0 w-full h-full object-cover object-center opacity-85 group-hover:scale-105 transition-transform duration-500"
                />

                {/* Content */}
                <div className="p-5 relative z-20 flex flex-col justify-between h-full">
                  <div className={`p-2 rounded-xl ${cat.color} text-white w-fit shadow-md`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex items-end justify-between gap-4">
                    <div className="text-white">
                      <h4 className="font-extrabold text-lg tracking-tight leading-none">
                        {cat.title}
                      </h4>
                      <p className="text-[10px] text-gray-200 mt-1 leading-none font-bold">{cat.desc}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg text-white group-hover:bg-[#0086ff] transition-all">
                      <ChevronRight className="w-4 h-4 stroke-[3]" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Produtos em Destaque */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-gray-800 tracking-tight">
              Ofertas Recomendadas
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Os produtos mais buscados e com os melhores descontos do dia</p>
          </div>
          <button
            onClick={() => setActiveTab("todos" as any)}
            className="text-xs font-black text-[#0086ff] hover:text-[#0077e6] flex items-center gap-1 transition-colors uppercase tracking-wider"
          >
            Ver Catálogo <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#0086ff]"></div>
            <p className="text-xs text-gray-400 font-bold">Carregando estoque real da loja...</p>
          </div>
        ) : featured.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center flex flex-col items-center gap-3">
            <AlertCircle className="w-10 h-10 text-gray-300" />
            <p className="text-gray-400 text-xs font-bold">Nenhum produto em destaque disponível no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onAddToCart={onAddToCart}
                onViewDetails={onViewProduct}
                onToggleWishlist={onToggleWishlist}
                isFavorite={wishlist.some((item) => item.id === p.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
