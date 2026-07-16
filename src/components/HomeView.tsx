import { Tab, Product } from "../types";
import { ChevronRight, ArrowRight, Smartphone, Laptop, Headphones, Sparkles, AlertCircle } from "lucide-react";
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
      title: "Celulares",
      desc: "Smartphones premium",
      icon: Smartphone,
      color: "from-blue-600 to-indigo-700",
      image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&q=80",
    },
    {
      id: "computadores" as Tab,
      title: "Computadores",
      desc: "Notebooks & Gamers",
      icon: Laptop,
      color: "from-cyan-600 to-blue-700",
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80",
    },
    {
      id: "acessorios" as Tab,
      title: "Acessórios",
      desc: "Fones, mouses & mais",
      icon: Headphones,
      color: "from-purple-600 to-pink-700",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
    },
  ];

  // Get first 4 featured items
  const featured = products.slice(0, 4);

  return (
    <div className="space-y-12">
      {/* 1. Hero Banner */}
      <div className="relative bg-slate-950 overflow-hidden rounded-3xl shadow-xl min-h-[420px] flex flex-col justify-center">
        {/* Abstract background graphics */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/80 to-transparent z-10" />
        <img
          src="https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=1200&q=80"
          alt="Tecnologia Banner"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-40 select-none pointer-events-none"
        />

        {/* Content */}
        <div className="relative z-20 max-w-2xl px-6 sm:px-12 py-10 space-y-6">
          <span className="inline-flex items-center gap-1.5 bg-blue-600/20 text-blue-400 font-bold text-xs uppercase tracking-wider px-3 py-1 rounded-full border border-blue-500/30">
            <Sparkles className="w-3.5 h-3.5" /> Lançamentos Exclusivos
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-none tracking-tight">
            TECNOLOGIA QUE CONECTA VOCÊ <span className="text-blue-500">AO FUTURO</span>
          </h2>
          <p className="text-sm sm:text-base text-gray-300 max-w-md font-medium leading-relaxed">
            Descubra smartphones inovadores, notebooks de alta performance e os acessórios perfeitos para o seu ecossistema digital.
          </p>
          <div className="pt-2 flex flex-wrap gap-4">
            <button
              onClick={handleBannerClick}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-8 rounded-2xl transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98] text-sm flex items-center gap-2"
            >
              Ver Produtos <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab("ofertas")}
              className="bg-slate-800/80 hover:bg-slate-700 text-white font-bold py-3.5 px-6 rounded-2xl transition-all border border-slate-700/50 text-sm"
            >
              Aproveitar Ofertas
            </button>
          </div>
        </div>
      </div>

      {/* 2. Categorias Principais */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-black text-white tracking-tight">
            Categorias Principais
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className="group relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 h-44 flex flex-col justify-between"
              >
                {/* Background image & overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent z-10" />
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="absolute inset-0 w-full h-full object-cover object-center opacity-30 group-hover:scale-105 transition-transform duration-500"
                />

                {/* Content */}
                <div className="p-6 relative z-20 flex flex-col justify-between h-full">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${cat.color} text-white w-fit shadow-md`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex items-end justify-between gap-4 mt-6">
                    <div>
                      <h4 className="font-extrabold text-xl text-white tracking-tight leading-none">
                        {cat.title}
                      </h4>
                      <p className="text-xs text-gray-400 mt-1">{cat.desc}</p>
                    </div>
                    <div className="bg-slate-800 p-2 rounded-lg text-white group-hover:bg-blue-600 transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Produtos em Destaque */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black text-white tracking-tight">
              Produtos em Destaque
            </h3>
            <p className="text-xs text-gray-400">Os itens mais vendidos e recomendados da TECHNOVA</p>
          </div>
          <button
            onClick={() => setActiveTab("lancamentos")}
            className="text-sm font-bold text-blue-500 hover:text-blue-400 flex items-center gap-1 transition-colors"
          >
            Ver tudo <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            <p className="text-sm text-gray-400">Buscando as melhores ofertas reais no Google...</p>
          </div>
        ) : featured.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center flex flex-col items-center gap-3">
            <AlertCircle className="w-10 h-10 text-gray-500" />
            <p className="text-gray-400 font-medium">Nenhum produto em destaque disponível no momento.</p>
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
