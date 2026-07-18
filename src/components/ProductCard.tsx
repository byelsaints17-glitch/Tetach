import { Star, ShoppingCart, Info, Heart } from "lucide-react";
import { Product } from "../types";

interface ProductCardProps {
  key?: string | number;
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewDetails?: (product: Product) => void;
  onToggleWishlist?: (product: Product) => void;
  isFavorite?: boolean;
}

export default function ProductCard({ 
  product, 
  onAddToCart, 
  onViewDetails, 
  onToggleWishlist, 
  isFavorite = false 
}: ProductCardProps) {
  const installmentVal = product.price / 12;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col group h-full relative">
      {/* Product Image */}
      <div 
        onClick={() => onViewDetails?.(product)}
        className="relative bg-slate-950 pt-[80%] overflow-hidden cursor-pointer"
        title="Clique para ver detalhes"
      >
        <img
          src={product.imageUrl}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.originalPrice && (
          <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-black uppercase px-2.5 py-1 rounded-md tracking-wider">
            Oferta
          </span>
        )}
        <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded-md flex items-center gap-1 z-10">
          <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
          <span className="text-xs font-bold text-white">{product.rating.toFixed(1)}</span>
        </div>

        {onToggleWishlist && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(product);
            }}
            className="absolute top-11 right-3 bg-slate-900/80 backdrop-blur-md p-2 rounded-md hover:text-red-400 transition-colors z-10 text-gray-300"
            title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorite ? "text-red-500 fill-red-500" : ""}`} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div 
          onClick={() => onViewDetails?.(product)}
          className="cursor-pointer"
          title="Clique para ver detalhes"
        >
          {/* Category */}
          <span className="text-[10px] uppercase font-bold text-blue-500 tracking-wider">
            {product.category === "celulares" && "Smartphone / Celular"}
            {product.category === "computadores" && "Computador"}
            {product.category === "notebooks" && "Notebook"}
            {product.category === "tablets" && "Tablet"}
            {product.category === "monitores" && "Monitor"}
            {product.category === "impressoras" && "Impressora"}
            {product.category === "tvs" && "Smart TV"}
            {product.category === "smartwatches" && "Smartwatch"}
            {product.category === "fones" && "Áudio / Fone"}
            {product.category === "perifericos" && "Periférico"}
            {product.category === "pecas" && "Peças / Componentes"}
            {product.category === "gamer" && "Espaço Gamer"}
            {product.category === "bicicletas" && "Bicicleta & Mobilidade"}
            {!["celulares", "computadores", "notebooks", "tablets", "monitores", "impressoras", "tvs", "smartwatches", "fones", "perifericos", "pecas", "gamer", "bicicletas"].includes(product.category) && product.category}
          </span>

          {/* Title */}
          <h3 className="font-bold text-white text-base sm:text-lg tracking-tight mt-1 group-hover:text-blue-400 transition-colors line-clamp-1">
            {product.name}
          </h3>

          {/* Description */}
          <p className="text-xs text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          {/* Key Specs */}
          <div className="mt-3.5 space-y-1">
            {product.specs.slice(0, 3).map((spec, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-[11px] text-gray-500">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full shrink-0"></span>
                <span className="truncate">{spec}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          <div className="flex flex-col">
            {product.originalPrice && (
              <span className="text-xs text-gray-500 line-through">
                R$ {product.originalPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            )}
            <span className="text-2xl font-black text-white leading-none">
              R$ {product.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-gray-400 mt-1">
              ou <strong className="text-blue-500">12x de R$ {installmentVal.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> sem juros
            </span>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => onAddToCart(product)}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98]"
            >
              <ShoppingCart className="w-4 h-4" />
              Comprar
            </button>
            {onViewDetails && (
              <button
                onClick={() => onViewDetails(product)}
                className="bg-slate-800 hover:bg-slate-700 text-white p-2.5 rounded-xl transition-all"
                title="Ver detalhes técnicos"
              >
                <Info className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
