import { Star, ShoppingCart, Info, Heart, Truck, CreditCard } from "lucide-react";
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
  const pixPrice = product.price; // We show this as the cash price

  return (
    <div className="bg-white border border-gray-200 hover:border-blue-400 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group h-full relative">
      {/* Product Image */}
      <div 
        onClick={() => onViewDetails?.(product)}
        className="relative bg-white pt-[85%] overflow-hidden cursor-pointer border-b border-gray-100 flex items-center justify-center"
        title="Clique para ver detalhes"
      >
        <img
          src={product.imageUrl}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
        />
        {product.originalPrice && (
          <span className="absolute top-3 left-3 bg-[#ff6500] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wide z-10 shadow-sm">
            {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
          </span>
        )}
        
        {/* Rating badge */}
        <div className="absolute top-3 right-3 bg-gray-100/90 backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center gap-1 z-10 border border-gray-200">
          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
          <span className="text-[10px] font-extrabold text-gray-700">{product.rating.toFixed(1)}</span>
        </div>

        {/* Favorite button */}
        {onToggleWishlist && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(product);
            }}
            className="absolute top-11 right-3 bg-white/95 shadow-sm border border-gray-200 p-1.5 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors z-10"
            title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorite ? "text-red-500 fill-red-500" : ""}`} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between bg-white text-slate-800">
        <div 
          onClick={() => onViewDetails?.(product)}
          className="cursor-pointer"
          title="Clique para ver detalhes"
        >
          {/* Brand & Category */}
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            <span>{product.brand}</span>
            <span>•</span>
            <span className="text-blue-500">
              {product.category === "celulares" && "Smartphone"}
              {product.category === "computadores" && "Computador"}
              {product.category === "notebooks" && "Notebook"}
              {product.category === "tablets" && "Tablet"}
              {product.category === "monitores" && "Monitor"}
              {product.category === "impressoras" && "Impressora"}
              {product.category === "tvs" && "Smart TV"}
              {product.category === "smartwatches" && "Smartwatch"}
              {product.category === "fones" && "Áudio / Fone"}
              {product.category === "perifericos" && "Periférico"}
              {product.category === "pecas" && "Peças"}
              {product.category === "gamer" && "Gamer"}
              {product.category === "bicicletas" && "Mobilidade"}
              {!["celulares", "computadores", "notebooks", "tablets", "monitores", "impressoras", "tvs", "smartwatches", "fones", "perifericos", "pecas", "gamer", "bicicletas"].includes(product.category) && product.category}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-gray-800 text-sm tracking-tight mt-1 group-hover:text-blue-600 transition-colors line-clamp-2 h-10 leading-tight">
            {product.name}
          </h3>

          {/* Key Specs in small grey badges */}
          <div className="mt-2.5 flex flex-wrap gap-1">
            {product.specs.slice(0, 2).map((spec, idx) => (
              <span key={idx} className="bg-gray-100 text-gray-600 text-[9px] font-semibold px-2 py-0.5 rounded-full border border-gray-200/50 truncate max-w-full">
                {spec}
              </span>
            ))}
          </div>

          {/* Delivery speed (Mercado Livre signature style) */}
          <div className="mt-3 flex items-center gap-1 text-[11px] text-emerald-600 font-bold">
            <Truck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Frete Grátis <span className="font-normal text-gray-400">Full</span></span>
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex flex-col">
            {product.originalPrice && (
              <span className="text-xs text-gray-400 line-through">
                R$ {product.originalPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            )}
            
            {/* Cash/PIX Pricing focus (Standard in Brazilian retail) */}
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-black text-gray-900 leading-none">
                R$ {pixPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
              <span className="bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase px-1.5 py-0.5 rounded">
                no PIX
              </span>
            </div>

            <span className="text-[11px] text-gray-500 mt-1.5 flex items-center gap-1">
              <CreditCard className="w-3 h-3 text-blue-500" />
              <span>ou <strong>12x de R$ {installmentVal.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> sem juros</span>
            </span>
          </div>

          {/* CTA Buttons */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => onAddToCart(product)}
              className="flex-1 bg-[#ff6500] hover:bg-[#e05900] text-white font-extrabold py-2 px-3 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-[0.98]"
            >
              <ShoppingCart className="w-4 h-4" />
              Comprar
            </button>
            {onViewDetails && (
              <button
                onClick={() => onViewDetails(product)}
                className="bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-600 p-2 rounded-xl transition-all"
                title="Ver especificações"
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
