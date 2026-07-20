import { useState, useMemo } from "react";
import { Tab, Product } from "../types";
import { 
  Filter, Search, ArrowUpDown, Smartphone, Laptop, Headphones, 
  Percent, Sparkles, SlidersHorizontal, AlertCircle, Cpu, Watch, 
  Monitor, Printer, Tv, Keyboard, Gamepad2, Bike
} from "lucide-react";
import ProductCard from "./ProductCard";

interface CategoryViewProps {
  products: Product[];
  category: Tab | "todos";
  onAddToCart: (product: Product) => void;
  onViewProduct: (product: Product) => void;
  isLoading: boolean;
  onToggleWishlist?: (product: Product) => void;
  wishlist?: Product[];
}

export default function CategoryView({ 
  products, 
  category, 
  onAddToCart, 
  onViewProduct, 
  isLoading,
  onToggleWishlist,
  wishlist = []
}: CategoryViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"relevance" | "price-asc" | "price-desc" | "rating">("relevance");
  const [brandFilter, setBrandFilter] = useState<string>("all");

  const titleAndDesc = useMemo(() => {
    switch (category) {
      case "celulares":
        return {
          title: "Celulares & Smartphones",
          desc: "Explore celulares premium das melhores marcas com as tecnologias mais recentes do mercado mundial.",
          icon: Smartphone,
        };
      case "notebooks":
        return {
          title: "Notebooks de Alta Performance",
          desc: "Computadores portáteis potentes e compactos para estudos, trabalho profissional e produtividade extrema.",
          icon: Laptop,
        };
      case "computadores":
        return {
          title: "Computadores Desktops",
          desc: "Workstations potentes, gabinetes customizados e setups de mesa de alta performance.",
          icon: Cpu,
        };
      case "tablets":
        return {
          title: "Tablets e iPads",
          desc: "Telas interativas e compactas ideais para leitura, ilustração, entretenimento e mobilidade diária.",
          icon: Watch,
        };
      case "monitores":
        return {
          title: "Monitores UltraWide & Gamer",
          desc: "Monitores de alta taxa de atualização, painéis IPS e displays perfeitos para design ou jogos.",
          icon: Monitor,
        };
      case "impressoras":
        return {
          title: "Impressoras & Multifuncionais",
          desc: "Impressoras tanque de tinta, laser e multifuncionais de alta resolução para casa ou escritório.",
          icon: Printer,
        };
      case "tvs":
        return {
          title: "Smart TVs 4K & OLED",
          desc: "O melhor do cinema na sua casa com telas gigantes de ultra-alta-definição, cores vivas e sistemas inteligentes.",
          icon: Tv,
        };
      case "smartwatches":
        return {
          title: "Smartwatches & Wearables",
          desc: "Monitore sua saúde, atividades físicas e notificações integradas direto no seu pulso.",
          icon: Watch,
        };
      case "fones":
        return {
          title: "Fones de Ouvido & Som",
          desc: "Som de alta fidelidade, fones bluetooth ANC (cancelamento de ruído) e caixas acústicas potentes.",
          icon: Headphones,
        };
      case "perifericos":
        return {
          title: "Periféricos & Acessórios",
          desc: "Mouses, teclados mecânicos, cabos premium, carregadores rápidos e acessórios de elite.",
          icon: Keyboard,
        };
      case "pecas":
        return {
          title: "Peças para Computador",
          desc: "Placas de vídeo (GPU), processadores (CPU), placas-mãe, memórias RAM e unidades de armazenamento SSD.",
          icon: Cpu,
        };
      case "gamer":
        return {
          title: "Espaço Gamer",
          desc: "Consoles de última geração, acessórios otimizados, cadeiras ergonômicas e setups gamers imbatíveis.",
          icon: Gamepad2,
        };
      case "bicicletas":
        return {
          title: "Bicicletas e Mobilidade",
          desc: "Encontre bicicletas elétricas, mountain bikes, urbanas e acessórios de mobilidade de alta tecnologia.",
          icon: Bike,
        };
      case "ofertas":
        return {
          title: "Ofertas e Descontos",
          desc: "Aproveite preços especiais, cupons, queima de estoque e produtos selecionados com o maior custo-benefício.",
          icon: Percent,
        };
      case "lancamentos":
        return {
          title: "Lançamentos Tecnológicos",
          desc: "Fique por dentro das novidades recém-lançadas na indústria mundial de eletrônicos.",
          icon: Sparkles,
        };
      default:
        return {
          title: "Catálogo Geral de Tecnologia",
          desc: "Navegue pela coleção completa de produtos de alta tecnologia disponíveis na TECHNOVA.",
          icon: SlidersHorizontal,
        };
    }
  }, [category]);

  // Extract brands for filtering
  const brands = useMemo(() => {
    const list = new Set<string>();
    products.forEach((p) => {
      const firstWord = p.name.split(" ")[0];
      if (firstWord) list.add(firstWord);
    });
    return ["all", ...Array.from(list)];
  }, [products]);

  // Filter and Sort Logic
  const processedProducts = useMemo(() => {
    let list = [...products];

    // Category filter is pre-applied by parent state or backend
    if (category !== "todos" && category !== "ofertas" && category !== "lancamentos") {
      list = list.filter((p) => p.category === category);
    } else if (category === "ofertas") {
      list = list.filter((p) => p.originalPrice !== undefined);
    } else if (category === "lancamentos") {
      list = list.filter((p) => ["iphone-15-pro-max", "macbook-air-m3", "samsung-galaxy-s24"].includes(p.id) || p.id.startsWith("google"));
    }

    // Search query filter
    if (searchTerm.trim() !== "") {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.specs.some((s) => s.toLowerCase().includes(q))
      );
    }

    // Brand filter
    if (brandFilter !== "all") {
      list = list.filter((p) => p.name.toLowerCase().startsWith(brandFilter.toLowerCase()));
    }

    // Sort
    if (sortBy === "price-asc") {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      list.sort((a, b) => b.rating - a.rating);
    }

    return list;
  }, [products, category, searchTerm, brandFilter, sortBy]);

  const Icon = titleAndDesc.icon;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* View Header Info */}
      <div className="bg-white border border-gray-200 p-6 sm:p-8 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="bg-[#0086ff]/10 text-[#0086ff] p-2.5 rounded-xl">
              <Icon className="w-5 h-5 stroke-[2.5]" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-800 tracking-tight">
              {titleAndDesc.title}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 max-w-2xl font-bold leading-relaxed">
            {titleAndDesc.desc}
          </p>
        </div>

        {/* Dynamic Badge Count */}
        <span className="bg-gray-100 text-gray-500 font-black text-xs px-4 py-2 rounded-xl border border-gray-200 shrink-0">
          {processedProducts.length} {processedProducts.length === 1 ? "Produto" : "Produtos"} encontrado(s)
        </span>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white border border-gray-200 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
        {/* Search input in catalog */}
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            placeholder="Filtrar nesta categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 text-slate-800 placeholder-gray-400 pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0086ff] focus:border-transparent text-xs font-semibold"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
          {/* Brand select */}
          {brands.length > 2 && (
            <div className="flex items-center gap-1.5 shrink-0">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className="bg-white border border-gray-200 text-slate-700 text-xs rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#0086ff] font-bold"
              >
                <option value="all">Todas as marcas</option>
                {brands.map(
                  (b) =>
                    b !== "all" && (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    )
                )}
              </select>
            </div>
          )}

          {/* Sort selection */}
          <div className="flex items-center gap-1.5 shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-gray-200 text-slate-700 text-xs rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#0086ff] font-bold"
            >
              <option value="relevance">Mais Relevantes</option>
              <option value="price-asc">Menor Preço</option>
              <option value="price-desc">Maior Preço</option>
              <option value="rating">Melhores Avaliações</option>
            </select>
          </div>
        </div>
      </div>

      {/* Catalog Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center bg-white border border-gray-200 rounded-3xl shadow-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0086ff]"></div>
          <div>
            <h4 className="text-gray-800 font-extrabold text-lg">Busca Inteligente TECHNOVA</h4>
            <p className="text-xs text-gray-400 max-w-sm mt-1 font-bold">
              Obtendo as especificações oficiais, preços atualizados e avaliações reais de mercado...
            </p>
          </div>
        </div>
      ) : processedProducts.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-3xl py-20 text-center max-w-md mx-auto p-6 flex flex-col items-center gap-4 shadow-sm">
          <div className="bg-gray-50 p-4 rounded-full text-gray-400 border border-gray-100">
            <AlertCircle className="w-10 h-10" />
          </div>
          <div>
            <h4 className="text-gray-800 font-extrabold text-lg">Nenhum eletrônico encontrado</h4>
            <p className="text-xs text-gray-400 mt-1.5 max-w-xs mx-auto font-bold leading-normal">
              Tente redefinir seus filtros de busca, usar outras palavras-chave ou recarregar os padrões da TECHNOVA.
            </p>
          </div>
          <button
            onClick={() => {
              setSearchTerm("");
              setBrandFilter("all");
              setSortBy("relevance");
            }}
            className="bg-[#0086ff] hover:bg-blue-600 text-white font-extrabold text-xs py-2.5 px-5 rounded-xl transition-all shadow-sm active:scale-95"
          >
            Limpar Filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {processedProducts.map((p) => (
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
  );
}
